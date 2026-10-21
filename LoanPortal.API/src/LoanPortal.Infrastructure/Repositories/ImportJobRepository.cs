using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;
using MongoDB.Driver;

namespace LoanPortal.Infrastructure.Repositories;

public class ImportJobRepository : IImportJobRepository
{
    private readonly IMongoCollection<ImportJobDocument> _collection;

    public ImportJobRepository(MongoDbContext context)
    {
        _collection = context.ImportJobs;
    }

    public Task InsertAsync(ImportJobDocument job) => _collection.InsertOneAsync(job);

    public async Task<ImportJobDocument?> GetByIdAsync(Guid jobId) =>
        await _collection.Find(job => job.Id == jobId).FirstOrDefaultAsync();

    public Task<List<ImportJobDocument>> GetByUserIdAsync(Guid userId, int page, int pageSize) =>
        _collection.Find(job => job.UserId == userId)
            .SortByDescending(job => job.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

    public async Task UpdateFileStatusAsync(Guid jobId, Guid fileId, FileImportStatus status,
        Guid? preApprovalId = null, string? errorReason = null, DateTime? processedAt = null)
    {
        var filter = Builders<ImportJobDocument>.Filter.And(
            Builders<ImportJobDocument>.Filter.Eq(job => job.Id, jobId),
            Builders<ImportJobDocument>.Filter.ElemMatch(job => job.Files, file => file.FileId == fileId));
        var update = new List<UpdateDefinition<ImportJobDocument>>
        {
            Builders<ImportJobDocument>.Update.Set("files.$.status", status),
            Builders<ImportJobDocument>.Update.Set(job => job.UpdatedAt, DateTime.UtcNow)
        };
        if (status == FileImportStatus.Processing)
            update.Add(Builders<ImportJobDocument>.Update.Set(job => job.Status, ImportJobStatus.Processing));
        if (preApprovalId.HasValue)
            update.Add(Builders<ImportJobDocument>.Update.Set("files.$.preApprovalId", preApprovalId.Value));
        if (errorReason is not null)
            update.Add(Builders<ImportJobDocument>.Update.Set("files.$.errorReason", errorReason));
        if (processedAt.HasValue)
            update.Add(Builders<ImportJobDocument>.Update.Set("files.$.processedAt", processedAt.Value));

        await _collection.UpdateOneAsync(filter, Builders<ImportJobDocument>.Update.Combine(update));
    }

    public Task UpdateJobStatusAsync(Guid jobId, ImportJobStatus status) => _collection.UpdateOneAsync(
        Builders<ImportJobDocument>.Filter.Eq(job => job.Id, jobId),
        Builders<ImportJobDocument>.Update.Set(job => job.Status, status).Set(job => job.UpdatedAt, DateTime.UtcNow));

    public async Task<bool> TryCompleteJobAsync(Guid jobId, ImportJobStatus status)
    {
        var filter = Builders<ImportJobDocument>.Filter.And(
            Builders<ImportJobDocument>.Filter.Eq(job => job.Id, jobId),
            Builders<ImportJobDocument>.Filter.In(job => job.Status, new[] { ImportJobStatus.Pending, ImportJobStatus.Processing }));
        var result = await _collection.UpdateOneAsync(filter,
            Builders<ImportJobDocument>.Update.Set(job => job.Status, status).Set(job => job.UpdatedAt, DateTime.UtcNow));
        return result.ModifiedCount == 1;
    }

    public Task<List<ImportJobDocument>> GetIncompleteJobsAsync() => _collection.Find(job =>
        job.Status == ImportJobStatus.Pending || job.Status == ImportJobStatus.Processing).ToListAsync();

    public async Task MarkStaleJobsAsync(DateTime olderThan)
    {
        var staleJobs = await _collection.Find(Builders<ImportJobDocument>.Filter.And(
            Builders<ImportJobDocument>.Filter.Eq(job => job.Status, ImportJobStatus.Processing),
            Builders<ImportJobDocument>.Filter.Lt(job => job.UpdatedAt, olderThan))).ToListAsync();

        foreach (var job in staleJobs)
        {
            foreach (var file in job.Files.Where(file => file.Status is FileImportStatus.Pending or FileImportStatus.Processing))
            {
                await UpdateFileStatusAsync(job.Id, file.FileId, FileImportStatus.Failed,
                    errorReason: "Processing timed out. Please re-upload this file.", processedAt: DateTime.UtcNow);
            }
            await UpdateJobStatusAsync(job.Id, ImportJobStatus.Failed);
        }
    }
}
