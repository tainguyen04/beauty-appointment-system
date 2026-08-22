using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace BeautyBooking.AI.Providers
{
    public class GeminiProvider : IAIProvider
    {
        private readonly IChatCompletionService _chatCompletionService;
        private readonly Kernel _kernel;
        private readonly GeminiOptions _options;

        public GeminiProvider(
            IChatCompletionService chatCompletionService,
            Kernel kernel,
            IOptions<GeminiOptions> options
        )
        {
            _chatCompletionService = chatCompletionService;
            _kernel = kernel;
            _options = options.Value;
        }

        public AIProviderType ProviderType => AIProviderType.Gemini;

        public async Task<string> GenerateResponseAsync(
            List<ChatMessage> messages,
            CancellationToken cancellationToken = default,
            bool enableTools = false
        )
        {
            EnsureConfigured();

            var history = BuildChatHistory(messages);
            PromptExecutionSettings? executionSettings = null;
            Kernel? kernel = null;
            if (enableTools)
            {
                executionSettings = new PromptExecutionSettings
                {
                    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
                };
                kernel = _kernel;
            }

            var response = await _chatCompletionService.GetChatMessageContentAsync(
                history,
                executionSettings,
                kernel,
                cancellationToken: cancellationToken
            );
            return response.Content?.Trim() ?? string.Empty;
        }

        private static ChatHistory BuildChatHistory(IEnumerable<ChatMessage> messages)
        {
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
            return history;
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
