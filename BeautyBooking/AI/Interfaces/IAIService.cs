using BeautyBooking.AI.DTO;

namespace BeautyBooking.AI.Interfaces
{
    public interface IAIService
    {
        Task<ChatResponse> ChatAsync(ChatRequest request,CancellationToken cancellationToken = default);
    }
}
