using BeautyBooking.AI.Models;

namespace BeautyBooking.AI.Interfaces
{
    public interface IAIProvider
    {
        Task<string> GenerateResponseAsync(
            string SystemPrompt,
            List<OllamaChatMessage> messages,
            CancellationToken cancellationToken = default
        );
    }
}
