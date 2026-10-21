using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using LoanPortal.Shared.Constants;
using LoanPortal.Shared.Enum;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LoanPortal.Infrastructure.Services;

public class XmlImportBackgroundService : BackgroundService
{
    private readonly IImportQueue _queue;
    private readonly IServiceProvider _services;
    private readonly ILogger<XmlImportBackgroundService> _logger;
    private readonly SemaphoreSlim _semaphore = new(ImportConstants.MaxConcurrentProcessors, ImportConstants.MaxConcurrentProcessors);

    public XmlImportBackgroundService(
        IImportQueue queue,
        IServiceProvider services,
        ILogger<XmlImportBackgroundService> logger)
    {
        _queue = queue;
        _services = services;
        _logger = logger;
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _services.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IImportJobRepository>();
        var incompleteJobs = await repository.GetIncompleteJobsAsync();
        var failedFileCount = 0;

        foreach (var job in incompleteJobs)
        {
            foreach (var file in job.Files.Where(file => file.Status is FileImportStatus.Pending or FileImportStatus.Processing))
            {
                await repository.UpdateFileStatusAsync(job.Id, file.FileId, FileImportStatus.Failed,
                    errorReason: "Server restarted while this file was processing. Please re-upload.",
                    processedAt: DateTime.UtcNow);
                failedFileCount++;
            }

            await CompleteIfReadyAsync(repository, job.Id);
        }

        if (failedFileCount > 0)
            _logger.LogWarning("Marked {FailedFileCount} interrupted XML import file(s) as failed during startup recovery.", failedFileCount);

        await base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _ = RunStaleJobSweeperAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var item = await _queue.DequeueAsync(stoppingToken);
                await _semaphore.WaitAsync(stoppingToken);

                _ = ProcessAndReleaseAsync(item);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                // BackgroundService exceptions otherwise stop the entire host by default.
                // Keep the API available and continue accepting later imports.
                _logger.LogError(exception, "XML import queue worker encountered an unexpected error.");
                Console.WriteLine($"XML import queue worker encountered an unexpected error: {exception}");
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
            }
        }
    }

    private async Task ProcessAndReleaseAsync(ImportWorkItem item)
    {
        try
        {
            await ProcessFileAsync(item);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Unhandled error while processing import file {FileName} in job {JobId}.", item.FileName, item.JobId);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task ProcessFileAsync(ImportWorkItem item)
    {
        using var scope = _services.CreateScope();
        var provider = scope.ServiceProvider;
        var repository = provider.GetRequiredService<IImportJobRepository>();
        var parser = provider.GetRequiredService<AriveXmlParser>();
        var mapper = provider.GetRequiredService<MismoToDtoMapper>();
        var preApprovalService = provider.GetRequiredService<IPreApprovalService>();
        var loginUser = provider.GetRequiredService<ILoginUserDetails>();

        await repository.UpdateFileStatusAsync(item.JobId, item.FileId, FileImportStatus.Processing);
        try
        {
            var payload = parser.Parse(item.Content);
            var dto = await mapper.MapAsync(payload, item.UserId);

            // SavePreApproval uses the scoped login context for ownership/auditing.
            // A background scope has no HTTP middleware, so establish it from the queued job.
            loginUser.UserID = item.UserId;
            var savedDocument = await preApprovalService.SaveImportedPreApproval(dto);

            await repository.UpdateFileStatusAsync(item.JobId, item.FileId, FileImportStatus.Success,
                preApprovalId: savedDocument.Id, processedAt: DateTime.UtcNow);
            _logger.LogInformation("Imported {FileName} into quote {PreApprovalId} for job {JobId}.",
                item.FileName, savedDocument.Id, item.JobId);
        }
        catch (XmlParseException exception)
        {
            _logger.LogWarning(exception, "XML parsing failed for {FileName} in job {JobId}.", item.FileName, item.JobId);
            await repository.UpdateFileStatusAsync(item.JobId, item.FileId, FileImportStatus.Failed,
                errorReason: exception.Message, processedAt: DateTime.UtcNow);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Import failed for {FileName} in job {JobId}.", item.FileName, item.JobId);
            await repository.UpdateFileStatusAsync(item.JobId, item.FileId, FileImportStatus.Failed,
                errorReason: "An unexpected error occurred while importing this file.", processedAt: DateTime.UtcNow);
        }
        finally
        {
            await CompleteIfReadyAsync(repository, item.JobId, provider, item.UserId);

            var job = await repository.GetByIdAsync(item.JobId);
            if (job is not null)
            {
                try
                {
                    await provider.GetRequiredService<IImportProgressNotifier>().BroadcastProgressAsync(job);
                }
                catch (Exception exception)
                {
                    _logger.LogWarning(exception, "Unable to broadcast progress for import job {JobId}.", item.JobId);
                }
            }
        }
    }

    private async Task CompleteIfReadyAsync(IImportJobRepository repository, Guid jobId,
        IServiceProvider? provider = null, Guid? userId = null)
    {
        var job = await repository.GetByIdAsync(jobId);
        if (job is null || job.Files.Any(file => file.Status is FileImportStatus.Pending or FileImportStatus.Processing))
            return;

        var status = job.Files.All(file => file.Status == FileImportStatus.Failed)
            ? ImportJobStatus.Failed
            : ImportJobStatus.Completed;
        if (!await repository.TryCompleteJobAsync(jobId, status) || provider is null || !userId.HasValue)
            return;

        try
        {
            var user = await provider.GetRequiredService<IUserRepository>().GetUserById(userId.Value);
            if (user is not null)
                await provider.GetRequiredService<INotificationService>()
                    .NotifyXmlImportCompletedAsync(job, user);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "Unable to create completion notification for import job {JobId}.", jobId);
        }
    }

    private async Task RunStaleJobSweeperAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(ImportConstants.StaleJobSweepIntervalMinutes));
            while (await timer.WaitForNextTickAsync(cancellationToken))
            {
                try
                {
                    using var scope = _services.CreateScope();
                    await scope.ServiceProvider.GetRequiredService<IImportJobRepository>().MarkStaleJobsAsync(
                        DateTime.UtcNow.AddHours(-ImportConstants.StaleJobThresholdHours));
                }
                catch (Exception exception)
                {
                    _logger.LogError(exception, "XML import stale-job sweep failed.");
                }
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // Normal shutdown.
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "XML import stale-job sweeper stopped unexpectedly.");
        }
    }
}
