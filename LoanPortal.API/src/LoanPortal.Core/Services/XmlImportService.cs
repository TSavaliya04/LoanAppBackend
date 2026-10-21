using System.IO.Compression;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Constants;
using LoanPortal.Shared.Enum;
using Microsoft.AspNetCore.Http;

namespace LoanPortal.Core.Services;

public class XmlImportService : IXmlImportService
{
    private readonly IImportJobRepository _jobRepository;
    private readonly IImportQueue _queue;

    public XmlImportService(IImportJobRepository jobRepository, IImportQueue queue)
    {
        _jobRepository = jobRepository;
        _queue = queue;
    }

    public async Task<Guid> StartJobAsync(List<IFormFile> files, Guid userId, CancellationToken cancellationToken = default)
    {
        var xmlFiles = await ExtractXmlFilesAsync(files, cancellationToken);
        var now = DateTime.UtcNow;
        var job = new ImportJobDocument
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = ImportJobStatus.Pending,
            CreatedAt = now,
            UpdatedAt = now,
            Files = xmlFiles.Select(file => new FileImportItem
            {
                FileId = Guid.NewGuid(),
                FileName = file.Name,
                Status = FileImportStatus.Pending
            }).ToList()
        };

        await _jobRepository.InsertAsync(job);

        for (var index = 0; index < xmlFiles.Count; index++)
        {
            await _queue.EnqueueAsync(new ImportWorkItem(
                job.Id,
                job.Files[index].FileId,
                job.Files[index].FileName,
                xmlFiles[index].Content,
                userId), cancellationToken);
        }

        return job.Id;
    }

    private static async Task<List<(string Name, byte[] Content)>> ExtractXmlFilesAsync(
        List<IFormFile> files,
        CancellationToken cancellationToken)
    {
        if (files.Count == 1 && (files[0].FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase) ||
            files[0].ContentType is "application/zip" or "application/x-zip-compressed"))
            return await SafeExtractZipAsync(files[0], cancellationToken);

        var result = new List<(string Name, byte[] Content)>();
        foreach (var file in files)
        {
            await using var stream = new MemoryStream();
            await file.CopyToAsync(stream, cancellationToken);
            result.Add((Path.GetFileName(file.FileName), stream.ToArray()));
        }

        return result;
    }


    private static async Task<List<(string Name, byte[] Content)>> SafeExtractZipAsync(
        IFormFile zip,
        CancellationToken cancellationToken)
    {
        try
        {
            await using var zipStream = zip.OpenReadStream();
            using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read, leaveOpen: false);
            var result = new List<(string Name, byte[] Content)>();
            long totalBytesRead = 0;
            var buffer = new byte[81_920];

            foreach (var entry in archive.Entries)
            {
                if (string.IsNullOrEmpty(entry.Name))
                    continue;

                var safeName = Path.GetFileName(entry.FullName);
                if (string.IsNullOrEmpty(safeName) || !safeName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
                    throw new ImportValidationException("ZIP contains an invalid XML entry.");

                await using var entryStream = entry.Open();
                await using var destination = new MemoryStream();
                int read;
                long entryBytesRead = 0;
                while ((read = await entryStream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken)) > 0)
                {
                    entryBytesRead += read;
                    totalBytesRead += read;
                    if (entryBytesRead > ImportConstants.MaxXmlBytes ||
                        totalBytesRead > ImportConstants.MaxZipUncompressedBytes)
                    {
                        throw new ImportValidationException(
                            $"ZIP entry '{safeName}' exceeded the uncompressed size limit during extraction.");
                    }

                    await destination.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
                }

                result.Add((safeName, destination.ToArray()));
            }

            return result;
        }
        catch (InvalidDataException)
        {
            throw new ImportValidationException("The uploaded ZIP file is invalid or corrupted.");
        }
    }
}
