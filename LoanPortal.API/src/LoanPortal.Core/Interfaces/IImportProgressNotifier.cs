using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces;

/// <summary>Publishes import progress without coupling the import worker to a delivery technology.</summary>
public interface IImportProgressNotifier
{
    Task BroadcastProgressAsync(ImportJobDocument job, CancellationToken cancellationToken = default);
}
