using System.Text.Json;

namespace BeautyBooking.AI.Interfaces
{
    public interface ITool
    {
        string Name { get; }
        string Description { get; }
        object Parameters { get; }
        Task<string> ExecuteAsync(
            JsonElement parameters,
            CancellationToken cancellationToken = default
        );
    }
}
