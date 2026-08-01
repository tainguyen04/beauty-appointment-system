using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using BeautyBooking.AI.Providers;

namespace BeautyBooking.AI.Services
{
    public class AIService : IAIService
    {
        private readonly IConversationService _conversationService;
        private readonly IAIProvider _aiProvider;
        private const string SystemPrompt = """
            Bạn là BeautyBooking AI Assistant.

            BeautyBooking là một hệ thống đặt lịch dịch vụ làm đẹp.

            Bạn hỗ trợ người dùng:
            - Tìm hiểu về BeautyBooking.
            - Hướng dẫn sử dụng website.
            - Tìm hiểu về các dịch vụ làm đẹp.
            - Hỗ trợ quá trình đặt lịch.

            Quy tắc:
            - Luôn trả lời bằng tiếng Việt.
            - Trả lời ngắn gọn, rõ ràng và thân thiện.
            - Không được tự bịa thông tin.
            - Không tự tạo ra thông tin về dịch vụ, giá cả hoặc lịch trống.
            - Nếu không có đủ thông tin, hãy nói rằng bạn chưa có đủ thông tin.
            """;

        public AIService(IAIProvider aiProvider, IConversationService conversationService)
        {
            _aiProvider = aiProvider;
            _conversationService = conversationService;
        }

        public async Task<ChatResponse> ChatAsync(
            ChatRequest request,
            CancellationToken cancellationToken = default
        )
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
                throw new ArgumentException("Prompt cannot be empty.");
            int conversationId;
            if (request.ConversationId is null or 0)
            {
                var conversation = await _conversationService.CreateAsync(cancellationToken);
                conversationId = conversation.Id;
            }
            else
            {
                var conversation =
                    await _conversationService.GetByIdAsync(
                        request.ConversationId.Value,
                        cancellationToken
                    )
                    ?? throw new ArgumentException(
                        $"Conversation with ID {request.ConversationId} not found."
                    );
                conversationId = conversation.Id;
            }
            await _conversationService.AddMessageAsync(
                conversationId,
                request.Prompt,
                ChatRole.User,
                cancellationToken
            );
            var historyMessages = await _conversationService.GetMessagesAsync(
                conversationId,
                cancellationToken
            );
            var messages = new List<ChatMessage>
            {
                new() { Role = ChatRole.System, Content = SystemPrompt },
            };
            messages.AddRange(
                historyMessages.Select(m => new ChatMessage { Role = m.Role, Content = m.Content })
            );

            var response = await _aiProvider.GenerateResponseAsync(messages, cancellationToken);

            await _conversationService.AddMessageAsync(
                conversationId,
                response,
                ChatRole.Assistant,
                cancellationToken
            );
            return new ChatResponse { ConversationId = conversationId, Message = response };
        }
    }
}
