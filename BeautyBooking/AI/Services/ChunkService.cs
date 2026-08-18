using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.Interfaces;
using Microsoft.Extensions.Options;

namespace BeautyBooking.AI.Services
{
    public class ChunkService : IChunkService
    {
        private readonly RAGOptions _options;

        public ChunkService(IOptions<RAGOptions> options)
        {
            _options = options.Value;
        }

        public List<string> SplitTextIntoChunks(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return [];
            if (_options.ChunkSize <= 0)
                throw new InvalidOperationException("RAG ChunkSize phải lớn hơn 0.");
            if (_options.Overlap < 0 || _options.Overlap >= _options.ChunkSize)
                throw new InvalidOperationException("RAG Overlap phải từ 0 đến nhỏ hơn ChunkSize.");

            // Legacy: cắt tuần tự theo ChunkSize, không giữ lại nội dung giữa hai chunk.
            // Hiện tại: chunk kế tiếp bắt đầu sớm hơn một khoảng Overlap.
            var chunks = new List<string>();
            var step = _options.ChunkSize - _options.Overlap;
            for (var start = 0; start < content.Length; start += step)
            {
                var length = Math.Min(_options.ChunkSize, content.Length - start);
                var chunk = content.Substring(start, length).Trim();
                if (chunk.Length > 0)
                    chunks.Add(chunk);

                if (start + length >= content.Length)
                    break;
            }
            return chunks;
        }
    }
}