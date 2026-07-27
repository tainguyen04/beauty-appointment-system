using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Providers;

namespace BeautyBooking.AI.Services
{
    public class AIService : IAIService
    {
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
        public AIService(IAIProvider aiProvider)
        {
            _aiProvider = aiProvider;
        }
        public async Task<ChatResponse> ChatAsync(ChatRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
                throw new ArgumentException("Prompt cannot be empty.");
            var systemPrompt = SystemPrompt;
            var fullPrompt = $"""
            {systemPrompt}
            Câu hỏi của người dùng:
            {request.Prompt}
            """;
            var response = await _aiProvider.GenerateResponseAsync(systemPrompt, request.Prompt, cancellationToken);
            return new ChatResponse
            {
                Message = response
            };
        }
    }
}
