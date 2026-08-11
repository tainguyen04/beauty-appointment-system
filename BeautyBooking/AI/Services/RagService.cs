using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Interfaces;

namespace BeautyBooking.AI.Services
{
    public class RagService : IRagService
    {
        private readonly IEmBeddingService _embeddingService;
        private readonly IVectorStore _vectorStore;

        public RagService(IEmBeddingService embeddingService, IVectorStore vectorStore)
        {
            _embeddingService = embeddingService;
            _vectorStore = vectorStore;
        }

        public async Task<string> BuildContextAsync(
            string query,
            int topK = 3,
            CancellationToken cancellationToken = default
        )
        {
            var queryEmbedding = await _embeddingService.GenerateEmbeddingAsync(
                query,
                cancellationToken
            );
            var topChunks = await _vectorStore.SearchEmbeddingsAsync(
                queryEmbedding,
                topK,
                cancellationToken
            );
            return string.Join("\n\n", topChunks.Select(c => c.Content));
        }
    }
}
