using BeautyBooking.AI.DTO;

namespace BeautyBooking.AI.Interfaces
{
    public interface IAIService
    {
        Task<ChatResponse> ChatAsync(ChatRequest request, CancellationToken cancellationToken = default);
        Task<List<ConversationResponse>> GetConversationsAsync(CancellationToken cancellationToken = default);
        Task<ConversationMessagesResponse> GetMessagesAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        );
    }
}