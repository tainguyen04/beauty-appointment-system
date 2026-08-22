using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Models;

namespace BeautyBooking.AI.Interfaces
{
    public interface IAIProvider
    {
        AIProviderType ProviderType { get; }
        Task<string> GenerateResponseAsync(
            List<ChatMessage> messages,
            CancellationToken cancellationToken = default,
            bool enableTools = false
        );
    }
}
