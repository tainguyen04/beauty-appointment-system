using Azure;
using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.Interfaces;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace BeautyBooking.AI.Providers
{
    public class OpenAIProvider : IAIProvider
    {
        private readonly HttpClient _httpClient;
        private readonly OpenAIOptions _openAIOptions;
        public OpenAIProvider(HttpClient httpClient, IOptions<OpenAIOptions> openAIOptions)
        {
            _httpClient = httpClient;
            _openAIOptions = openAIOptions.Value;
        }
        public async Task<string> GenerateResponseAsync(
            string prompt,
            CancellationToken cancellationToken = default)
        {
            // Tạo request body cho API của OpenAI
            var requestBody = new
            {
                model = _openAIOptions.Model,
                input = prompt,
                max_output_tokens = 300
            };
            // Serialize request body to JSON
            var json = JsonSerializer.Serialize(requestBody);
            // Gửi request đến OpenAI API
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/responses")
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            };
            // Thêm header Authorization với API key của OpenAI
            request.Headers.Add("Authorization", $"Bearer {_openAIOptions.ApiKey}");
            // Gửi request và nhận response
            using var response  = await _httpClient.SendAsync(request, cancellationToken);
            // Kiểm tra xem response có thành công hay không
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"OpenAI API request failed. " +
                    $"Status Code: {response.StatusCode}. " +
                    $"Response: {responseContent}"
                    );
            }
            // Parse response content thành text
            using var document = JsonDocument.Parse(responseContent);
            // Kiểm tra nếu JSON trả về có chứa trường "output_text" thì lấy giá trị chuỗi
            if (document.RootElement.TryGetProperty(
                "output_text",
                out var outputText
                ))
                return outputText.GetString() ?? string.Empty;

            throw new InvalidOperationException("OpenAI response did not contain output_texts");
        }
    }
}
