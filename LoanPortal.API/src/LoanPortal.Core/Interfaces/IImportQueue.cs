namespace LoanPortal.Core.Interfaces;

public interface IImportQueue
{
    ValueTask EnqueueAsync(ImportWorkItem item, CancellationToken cancellationToken = default);
    ValueTask<ImportWorkItem> DequeueAsync(CancellationToken cancellationToken);
    int Count { get; }
}

public record ImportWorkItem(Guid JobId, Guid FileId, string FileName, byte[] Content, Guid UserId);
