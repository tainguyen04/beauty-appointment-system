using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.Entities;

namespace BeautyBooking.AI.Interfaces
{
    public interface IVectorStore
    {
        Task<List<KnowledgeChunk>> SearchEmbeddingsAsync(
            float[] queryEmbedding,
            int topK = 3,
            CancellationToken cancellationToken = default
        );
    }
}
