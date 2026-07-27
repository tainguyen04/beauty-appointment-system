using System.Text.Json;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Tools;
using CloudinaryDotNet;

namespace BeautyBooking.AI.Providers
{
    public class OllamaProvider : IAIProvider
    {
        private readonly HttpClient _httpClient;
        private readonly ToolExecutor _toolExecutor;

        public OllamaProvider(HttpClient httpClient, ToolExecutor toolExecutor)
        {
            _httpClient = httpClient;
            _toolExecutor = toolExecutor;
        }

        public async Task<string> GenerateResponseAsync(
            string SystemPrompt,
            string UserPrompt,
            CancellationToken cancellationToken = default
        )
        {
            var requestBody = new
            {
                model = "llama3.2:3b",
                messages = new[]
                {
                    new { role = "system", content = SystemPrompt },
                    new { role = "user", content = UserPrompt },
                },
                tools = new[]
                {
                    new
                    {
                        type = "function",
                        function = new
                        {
                            name = "search_services",
                            description = "Tìm kiếm các dịch vụ làm đẹp trong BeautyBooking theo từ khóa hoặc danh mục.",
                            parameters = new
                            {
                                type = "object",
                                properties = new
                                {
                                    keyword = new
                                    {
                                        type = "string",
                                        description = "Từ khóa tìm kiếm dịch vụ.",
                                    },
                                    categoryId = new
                                    {
                                        type = "integer",
                                        description = "ID danh mục tùy chọn để lọc tìm kiếm.",
                                    },
                                },
                                required = Array.Empty<string>(),
                            },
                        },
                    },
                },
                stream = false,
            };
            var json = JsonSerializer.Serialize(requestBody);
            using var content = new StringContent(
                json,
                System.Text.Encoding.UTF8,
                "application/json"
            );
            using var response = await _httpClient.PostAsync(
                "api/chat",
                content,
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
            using var document = JsonDocument.Parse(responseContent);
            if (document.RootElement.TryGetProperty("message", out var message))
            {
                if (message.TryGetProperty("tool_calls", out var toolCalls))
                {
                    foreach (var toolCall in toolCalls.EnumerateArray())
                    {
                        var function = toolCall.GetProperty("function");

                        var toolName = function.GetProperty("name").GetString();

                        var parameters = function.GetProperty("arguments");

                        var result = await _toolExecutor.ExecuteAsync(toolName!, parameters);
                        return result;
                    }
                }

                if (message.TryGetProperty("content", out var contents))
                    return contents.GetString() ?? string.Empty;
            }
            ;
            throw new InvalidOperationException("Ollama response did not contain response text");
        }
    }
}
