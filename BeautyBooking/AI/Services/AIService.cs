using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Providers;

namespace BeautyBooking.AI.Services
{
    public class AIService : IAIService
    {
        private readonly IAIProvider _aiProvider;
        public AIService(IAIProvider aiProvider)
        {
            _aiProvider = aiProvider;
        }
        public async Task<ChatResponse> ChatAsync(ChatRequest request,CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
                throw new ArgumentException("Prompt cannot be empty.");
            var response = await _aiProvider.GenerateResponseAsync(request.Prompt);
            return new ChatResponse
            {
                Message = response
            };
        }
    }
}
