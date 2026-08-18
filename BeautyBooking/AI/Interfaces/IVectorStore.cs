using BeautyBooking.AI.Models;
using BeautyBooking.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Interfaces
{
    public interface IVectorStore
    {
        Task<IReadOnlyList<RagSource>> SearchEmbeddingsAsync(
            float[] queryEmbedding,
            int topK = 3,
            CancellationToken cancellationToken = default
        );
    }
}