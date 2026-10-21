using System.Threading.Channels;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Constants;

namespace LoanPortal.Infrastructure.Services;

public class ImportQueue : IImportQueue
{
    private readonly Channel<ImportWorkItem> _channel = Channel.CreateBounded<ImportWorkItem>(
        new BoundedChannelOptions(ImportConstants.QueueCapacity)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleWriter = false,
            SingleReader = false
        });

    public ValueTask EnqueueAsync(ImportWorkItem item, CancellationToken cancellationToken = default) =>
        _channel.Writer.WriteAsync(item, cancellationToken);

    public ValueTask<ImportWorkItem> DequeueAsync(CancellationToken cancellationToken) =>
        _channel.Reader.ReadAsync(cancellationToken);

    public int Count => _channel.Reader.Count;
}
