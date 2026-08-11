using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Extensions;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.AI.Services
{
    public class SqlServerVectorStore : IVectorStore
    {
        private readonly ApplicationDbContext _dbContext;

        public SqlServerVectorStore(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<KnowledgeChunk>> SearchEmbeddingsAsync(
            float[] queryEmbedding,
            int topK = 3,
            CancellationToken cancellationToken = default
        )
        {
            var vectorString = VectorHelper.Serialize(queryEmbedding);
            return await _dbContext
                .KnowledgeChunks.FromSqlInterpolated(
                    $"""
                    SELECT TOP ({topK}) *
                    FROM knowledge_chunks
                    WHERE embedding IS NOT NULL
                    ORDER BY VECTOR_DISTANCE(
                        'cosine',
                        embedding,
                        CAST({vectorString} AS VECTOR(768))
                    )
                    """
                )
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }
    }
}
