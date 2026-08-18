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
            // Legacy: mỗi chunk gọi thẳng GenerateAsync(text), tạo một HTTP request riêng.
            var embeddings = await GenerateEmbeddingsAsync([text], cancellationToken);
            return embeddings[0];
        }

        public async Task<IReadOnlyList<float[]>> GenerateEmbeddingsAsync(
            IReadOnlyList<string> texts,
            CancellationToken cancellationToken = default
        )
        {
            EnsureConfigured();
            if (texts.Count == 0)
                return [];
            if (texts.Any(string.IsNullOrWhiteSpace))
                throw new ArgumentException("Nội dung tạo embedding không được để trống.", nameof(texts));

            var generated = await _embeddingService.GenerateAsync(
                texts,
                cancellationToken: cancellationToken
            );
            var vectors = generated.Select(item => item.Vector.ToArray()).ToList();
            if (vectors.Count != texts.Count)
                throw new InvalidOperationException("Gemini không trả về đủ embedding cho batch.");

            foreach (var vector in vectors)
            {
                if (vector.Length != _options.EmbeddingDimensions)
                {
                    throw new InvalidOperationException(
                        $"Embedding phải có {_options.EmbeddingDimensions} chiều nhưng Gemini trả về {vector.Length}."
                    );
                }
            }
            return vectors;
        }

        private void EnsureConfigured()
        {
            if (string.IsNullOrWhiteSpace(_options.ApiKey)
                || string.IsNullOrWhiteSpace(_options.EmbeddingModel)
                || _options.EmbeddingDimensions <= 0)
            {
                throw new InvalidOperationException(
                    "Gemini embedding chưa được cấu hình đầy đủ."
                );
            }
        }
    }
}