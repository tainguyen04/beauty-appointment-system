using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;

namespace BeautyBooking.AI.Services
{
    public class OllamaEmbeddingService : IEmBeddingService
    {
        private readonly HttpClient _httpClient;

        public OllamaEmbeddingService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<float[]> GenerateEmbeddingAsync(
            string text,
            CancellationToken cancellationToken = default
        )
        {
            var requestBody = new { model = "nomic-embed-text", input = text };
            var response = await _httpClient.PostAsJsonAsync(
                "/api/embed",
                requestBody,
                cancellationToken
            );
            var result = await response.Content.ReadFromJsonAsync<OllamaEmbeddingResponse>(
                cancellationToken: cancellationToken
            );
            return result?.Embeddings?.FirstOrDefault() ?? [];
        }
    }
}
