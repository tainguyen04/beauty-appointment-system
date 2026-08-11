using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.Interfaces;
using Microsoft.Extensions.Options;

namespace BeautyBooking.AI.Services
{
    public class ChunkService : IChunkService
    {
        private readonly RAGOptions _ragOptions;

        public ChunkService(IOptions<RAGOptions> ragOptions)
        {
            _ragOptions = ragOptions.Value;
        }

        public List<string> SplitTextIntoChunks(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                return [];

            var chunks = new List<string>();
            var chunkSize = _ragOptions.ChunkSize;
            var overlap = _ragOptions.Overlap;
            var i = 0;
            while (i < content.Length)
            {
                var length = Math.Min(chunkSize, content.Length - i);
                var chunk = content.Substring(i, length);
                chunks.Add(chunk);
                if (i + length >= content.Length)
                    break;
                i += length - overlap;
            }

            return chunks;
        }
    }
}
