using System.Text.Json;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Extensions;
using BeautyBooking.AI.Helper;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using BeautyBooking.AI.Tools;
using CloudinaryDotNet;

namespace BeautyBooking.AI.Providers
{
    public class OllamaProvider : IAIProvider
    {
        public AIProviderType ProviderType => AIProviderType.Ollama;
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
            Console.WriteLine(responseContent);
            return JsonDocument.Parse(responseContent);
        }

        public async Task<List<ChatMessage>> ExecuteToolCallAsync(
            OllamaChatMessage message,
            CancellationToken cancellationToken = default
        )
        {
            if (message.ToolCalls == null || message.ToolCalls.Count == 0)
            {
                throw new InvalidOperationException("No tool calls found in the message.");
            }
            var tasks = message.ToolCalls.Select(async toolCall =>
            {
                var result = await _toolExecutor.ExecuteAsync(
                    toolCall.Function.Name,
                    toolCall.Function.Arguments,
                    cancellationToken
                );
                return new ChatMessage { Role = ChatRole.Tool, Content = result };
            });
            return (await Task.WhenAll(tasks)).ToList();
        }

        public async Task<string> GenerateResponseAsync(
            List<ChatMessage> messages,
            CancellationToken cancellationToken = default
        )
        {
            var ollamaMessages = messages.ToOllamaChatMessages();

            var requestBody = new
            {
                model = "llama3.2:3b",
                messages = ollamaMessages,
                tools = GetToolsForOllama(),
                stream = false,
            };
            Console.WriteLine(
                JsonSerializer.Serialize(
                    requestBody,
                    new JsonSerializerOptions { WriteIndented = true }
                )
            );
            using var document = await CallOllamaApiAsync(
                "api/chat",
                requestBody,
                cancellationToken
            );

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
                messages.Add(message.ToChatMessage());
                var toolResults = await ExecuteToolCallAsync(message, cancellationToken);
                messages.AddRange(toolResults);
                ollamaMessages = messages.ToOllamaChatMessages();
                var finalRequestBody = new
                {
                    model = "llama3.2:3b",
                    messages = ollamaMessages,
                    stream = false,
                };

                using var finalDocument = await CallOllamaApiAsync(
                    "api/chat",
                    finalRequestBody,
                    cancellationToken
                );
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
