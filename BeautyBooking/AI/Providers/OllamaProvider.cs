using System.Text.Json;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using BeautyBooking.AI.Tools;
using CloudinaryDotNet;

namespace BeautyBooking.AI.Providers
{
    public class OllamaProvider : IAIProvider
    {
        private readonly HttpClient _httpClient;
        private readonly ToolExecutor _toolExecutor;
        private readonly IToolRegistry _toolRegistry;

        public OllamaProvider(
            HttpClient httpClient,
            ToolExecutor toolExecutor,
            IToolRegistry toolRegistry
        )
        {
            _httpClient = httpClient;
            _toolExecutor = toolExecutor;
            _toolRegistry = toolRegistry;
        }

        private object GetToolsForOllama()
        {
            return _toolRegistry
                .GetAll()
                .Select(tool => new
                {
                    type = "function",
                    function = new
                    {
                        name = tool.Name,
                        description = tool.Description,
                        parameters = tool.Parameters,
                    },
                })
                .ToList();
        }

        public async Task<JsonDocument> CallOllamaApiAsync(
            string endpoint,
            object requestBody,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _httpClient.PostAsJsonAsync(
                endpoint,
                requestBody,
                cancellationToken
            );
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Ollama API request failed. "
                        + $"Status Code: {response.StatusCode}. "
                        + $"Response: {responseContent}"
                );
            }
            return JsonDocument.Parse(responseContent);
        }

        public async Task<string> ExecuteToolCallAsync(
            OllamaChatMessage message,
            CancellationToken cancellationToken = default
        )
        {
            if (message.ToolCalls == null || message.ToolCalls.Count == 0)
            {
                throw new InvalidOperationException("No tool calls found in the message.");
            }

            foreach (var toolCall in message.ToolCalls)
            {
                var function = toolCall.Function;
                var toolName = function.Name;
                var parameters = function.Arguments;

                var result = await _toolExecutor.ExecuteAsync(
                    toolName!,
                    parameters,
                    cancellationToken
                );
                return result;
            }
            throw new InvalidOperationException("No valid tool calls found.");
        }

        public async Task<string> GenerateResponseAsync(
            string SystemPrompt,
            string UserPrompt,
            CancellationToken cancellationToken = default
        )
        {
            var messages = new List<OllamaChatMessage>
            {
                new() { Role = "system", Content = SystemPrompt },
                new() { Role = "user", Content = UserPrompt },
            };

            var requestBody = new
            {
                model = "llama3.2:3b",
                messages,
                tools = GetToolsForOllama(),
                stream = false,
            };
            Console.WriteLine("========== OLLAMA CALL #1 START ==========");
            using var document = await CallOllamaApiAsync(
                "api/chat",
                requestBody,
                cancellationToken
            );
            Console.WriteLine("========== OLLAMA CALL #1 END ==========");
            if (!document.RootElement.TryGetProperty("message", out var messageElement))
            {
                throw new InvalidOperationException("Ollama response did not contain a message.");
            }
            var message =
                messageElement.Deserialize<OllamaChatMessage>()
                ?? throw new InvalidOperationException(
                    "Failed to deserialize the message from Ollama response."
                );
            if (message.ToolCalls?.Count > 0)
            {
                var toolResult = await ExecuteToolCallAsync(message, cancellationToken);
                messages.Add(message);
                messages.Add(new OllamaChatMessage { Role = "tool", Content = toolResult });
                var finalRequestBody = new
                {
                    model = "llama3.2:3b",
                    messages,
                    stream = false,
                };
                Console.WriteLine("========== OLLAMA CALL #2 START ==========");
                using var finalDocument = await CallOllamaApiAsync(
                    "api/chat",
                    finalRequestBody,
                    cancellationToken
                );
                Console.WriteLine("========== OLLAMA CALL #2 END ==========");
                if (
                    !finalDocument.RootElement.TryGetProperty(
                        "message",
                        out var finalMessageElement
                    )
                )
                {
                    throw new InvalidOperationException(
                        "Ollama response did not contain a message after tool execution."
                    );
                }
                var finalMessage =
                    finalMessageElement.Deserialize<OllamaChatMessage>()
                    ?? throw new InvalidOperationException(
                        "Failed to deserialize the message from Ollama response after tool execution."
                    );
                return finalMessage.Content ?? string.Empty;
            }
            return message.Content ?? string.Empty;
        }
    }
}
