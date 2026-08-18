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

        public async Task<IReadOnlyList<float[]>> GenerateEmbeddingsAsync(
            IReadOnlyList<string> texts,
            CancellationToken cancellationToken = default
        )
        {
            // Legacy compatibility: Ollama provider is disabled; keep sequential behavior for comparison.
            var embeddings = new List<float[]>(texts.Count);
            foreach (var text in texts)
                embeddings.Add(await GenerateEmbeddingAsync(text, cancellationToken));
            return embeddings;
        }
    }
}
