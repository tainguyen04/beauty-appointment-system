using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;

namespace BeautyBooking.AI.Services
{
    public class PythonAIService : IPythonAIService
    {
        private readonly HttpClient _httpClient;

        public PythonAIService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task DeleteKnowledgeAsync(
            int documentId,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _httpClient.DeleteAsync(
                $"/gemini/knowledge/{documentId}",
                cancellationToken
            );

            response.EnsureSuccessStatusCode();
        }

        public async Task<bool> HealthCheckAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync("/gemini/health", cancellationToken);
            return response.IsSuccessStatusCode;
        }

        public async Task IngestKnowledgeAsync(
            PythonKnowledgeRequest request,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/gemini/knowledge/ingest",
                request,
                cancellationToken
            );

            response.EnsureSuccessStatusCode();
        }

        public async Task UpdateKnowledgeAsync(
            PythonKnowledgeRequest request,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _httpClient.PutAsJsonAsync(
                $"/gemini/knowledge/{request.DocumentId}",
                request,
                cancellationToken
            );

            response.EnsureSuccessStatusCode();
        }

        public async Task<string> AskAsync(
            string question,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/gemini/rag",
                new { Question = question },
                cancellationToken
            );

            response.EnsureSuccessStatusCode();

            var answer = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>(
                cancellationToken: cancellationToken
            );
            return answer?["response"] ?? string.Empty;
        }
    }
}
