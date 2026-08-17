using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel.ChatCompletion;

namespace BeautyBooking.AI.Providers
{
    public class GeminiProvider : IAIProvider
    {
        private readonly IChatCompletionService _chatCompletionService;
        private readonly GeminiOptions _options;

        public GeminiProvider(
            IChatCompletionService chatCompletionService,
            IOptions<GeminiOptions> options
        )
        {
            _chatCompletionService = chatCompletionService;
            _options = options.Value;
        }

        public AIProviderType ProviderType => AIProviderType.Gemini;

        public async Task<string> GenerateResponseAsync(
            List<ChatMessage> messages,
            CancellationToken cancellationToken = default
        )
        {
            EnsureConfigured();

            var history = new ChatHistory();
            foreach (var message in messages)
            {
                var content = message.Content ?? string.Empty;
                switch (message.Role)
                {
                    case ChatRole.System:
                        history.AddSystemMessage(content);
                        break;
                    case ChatRole.Assistant:
                        history.AddAssistantMessage(content);
                        break;
                    case ChatRole.User:
                        history.AddUserMessage(content);
                        break;
                    case ChatRole.Tool:
                        history.AddUserMessage($"Kết quả công cụ: {content}");
                        break;
                }
            }

            var response = await _chatCompletionService.GetChatMessageContentAsync(
                history,
                cancellationToken: cancellationToken
            );
            return response.Content?.Trim() ?? string.Empty;
        }

        private void EnsureConfigured()
        {
            if (string.IsNullOrWhiteSpace(_options.ApiKey) || string.IsNullOrWhiteSpace(_options.ChatModel))
            {
                throw new InvalidOperationException(
                    "Gemini chưa được cấu hình. Hãy thêm Gemini:ApiKey và Gemini:ChatModel."
                );
            }
        }
    }
}