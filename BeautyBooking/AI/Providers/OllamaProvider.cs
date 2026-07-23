using BeautyBooking.AI.Interfaces;
using CloudinaryDotNet;
using System.Text.Json;

namespace BeautyBooking.AI.Providers
{
    public class OllamaProvider: IAIProvider
    {
        private readonly HttpClient _httpClient;
        public OllamaProvider(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }
        public async Task<string> GenerateResponseAsync(
            string prompt,
            CancellationToken cancellationToken = default
            )
        {
            var requestBody = new
            {
                model = "llama3.2:3b",
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = prompt
                    }
                },
                stream = false
            };
            var json = JsonSerializer.Serialize(requestBody);
            using var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            using var response = await _httpClient.PostAsync("api/chat",content, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if(!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"Ollama API request failed. " +
                    $"Status Code: {response.StatusCode}. " +
                    $"Response: {responseContent}"
                    );
            }
            using var document = JsonDocument.Parse(responseContent);
            if(document.RootElement.TryGetProperty("message", out var message) && message.TryGetProperty("content", out var contents))
                return contents.GetString() ?? string.Empty;

            throw new InvalidOperationException("Ollama response did not contain response text");
        }
    }
}
