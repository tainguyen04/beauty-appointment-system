using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using Microsoft.Extensions.Options;

namespace BeautyBooking.AI.Services
{
    public class RagService : IRagService
    {
        private readonly IEmBeddingService _embeddingService;
        private readonly IVectorStore _vectorStore;
        private readonly RAGOptions _options;

        public RagService(
            IEmBeddingService embeddingService,
            IVectorStore vectorStore,
            IOptions<RAGOptions> options
        )
        {
            _embeddingService = embeddingService;
            _vectorStore = vectorStore;
            _options = options.Value;
        }

        public async Task<RagContext> RetrieveAsync(
            string query,
            string? conversationContext = null,
            CancellationToken cancellationToken = default
        )
        {
            if (string.IsNullOrWhiteSpace(query))
                return new RagContext();

            // Legacy: chỉ embedding request.Prompt nên câu hỏi nối tiếp như "còn cái thứ hai?" thiếu ngữ cảnh.
            var retrievalQuery = string.IsNullOrWhiteSpace(conversationContext)
                ? query.Trim()
                : $"Ngữ cảnh hội thoại:\n{conversationContext.Trim()}\n\nCâu hỏi hiện tại:\n{query.Trim()}";
            var queryEmbedding = await _embeddingService.GenerateEmbeddingAsync(
                retrievalQuery,
                cancellationToken
            );
            var candidates = await _vectorStore.SearchEmbeddingsAsync(
                queryEmbedding,
                Math.Max(1, _options.TopK),
                cancellationToken
            );

            // Legacy: lọc thêm bằng MaxDistance. Hiện tại chỉ lấy TopK để cấu hình đơn giản.
            return new RagContext { Sources = candidates.OrderBy(item => item.Distance).ToList() };
        }
    }
}