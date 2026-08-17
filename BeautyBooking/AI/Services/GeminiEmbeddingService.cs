using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.Interfaces;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;

namespace BeautyBooking.AI.Services
{
    public class GeminiEmbeddingService : IEmBeddingService
    {
        private readonly IEmbeddingGenerator<string, Embedding<float>> _embeddingService;
        private readonly GeminiOptions _options;

        public GeminiEmbeddingService(
            IEmbeddingGenerator<string, Embedding<float>> embeddingService,
            IOptions<GeminiOptions> options
        )
        {
            _embeddingService = embeddingService;
            _options = options.Value;
        }

        public async Task<float[]> GenerateEmbeddingAsync(
            string text,
            CancellationToken cancellationToken = default
        )
        {
            if (string.IsNullOrWhiteSpace(_options.ApiKey) || string.IsNullOrWhiteSpace(_options.EmbeddingModel))
            {
                throw new InvalidOperationException(
                    "Gemini embedding chưa được cấu hình. Hãy thêm Gemini:ApiKey và Gemini:EmbeddingModel."
                );
            }

            if (string.IsNullOrWhiteSpace(text))
                throw new ArgumentException("Nội dung tạo embedding không được để trống.", nameof(text));

            var embedding = await _embeddingService.GenerateAsync(text, cancellationToken: cancellationToken);
            return embedding.Vector.ToArray();
        }
    }
}