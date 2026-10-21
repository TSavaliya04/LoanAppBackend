using LoanPortal.Core.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LoanPortal.API.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ImportProgressHub : Hub
{
    private readonly IImportJobRepository _jobRepository;

    public ImportProgressHub(IImportJobRepository jobRepository) => _jobRepository = jobRepository;

    public async Task SubscribeToJob(string jobId)
    {
        if (!Guid.TryParse(jobId, out var parsedJobId) || !TryGetUserId(out var userId))
            throw new HubException("Import job not found.");

        var job = await _jobRepository.GetByIdAsync(parsedJobId);
        if (job is null || job.UserId != userId)
            throw new HubException("Import job not found.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(parsedJobId));
    }

    public Task UnsubscribeFromJob(string jobId) =>
        Guid.TryParse(jobId, out var parsedJobId)
            ? Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(parsedJobId))
            : Task.CompletedTask;

    internal static string GroupName(Guid jobId) => $"job:{jobId}";

    private bool TryGetUserId(out Guid userId) => Guid.TryParse(Context.User?.FindFirst("UserId")?.Value, out userId);
}
