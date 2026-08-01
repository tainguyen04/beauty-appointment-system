using BeautyBooking.AI.Models;

namespace BeautyBooking.AI.Interfaces
{
    public interface IAIProvider
    {
        Task<string> GenerateResponseAsync(
            List<ChatMessage> messages,
            CancellationToken cancellationToken = default
        );
    }
}
