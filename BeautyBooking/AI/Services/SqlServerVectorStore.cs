using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.Extensions;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using BeautyBooking.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using System.Globalization;

namespace BeautyBooking.AI.Services
{
    public class SqlServerVectorStore : IVectorStore
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly GeminiOptions _geminiOptions;

        public SqlServerVectorStore(ApplicationDbContext dbContext, IOptions<GeminiOptions> geminiOptions)
        {
            _dbContext = dbContext;
            _geminiOptions = geminiOptions.Value;
        }

        public async Task<IReadOnlyList<RagSource>> SearchEmbeddingsAsync(
            float[] queryEmbedding,
            int topK = 3,
            CancellationToken cancellationToken = default)
        {
            if (_geminiOptions.EmbeddingDimensions != EmbeddingConstants.StorageDimensions)
                throw new InvalidOperationException(
                    $"Gemini:EmbeddingDimensions phải bằng {EmbeddingConstants.StorageDimensions} để khớp schema vector hiện tại.");
            if (queryEmbedding.Length != _geminiOptions.EmbeddingDimensions)
                throw new ArgumentException("Kích thước query embedding không hợp lệ.", nameof(queryEmbedding));
            if (topK <= 0)
                return [];

            // Legacy: FromSqlInterpolated SELECT * chỉ trả KnowledgeChunk và làm mất distance/source metadata.
            var connection = _dbContext.Database.GetDbConnection();
            var shouldClose = connection.State != ConnectionState.Open;
            if (shouldClose)
                await connection.OpenAsync(cancellationToken);

            try
            {
                await using var command = connection.CreateCommand();
                command.CommandText = $$"""
                    SELECT TOP (@top_k)
                        kc.id,
                        kc.document_id,
                        kc.chunk_index,
                        kc.content,
                        kd.title,
                        VECTOR_DISTANCE(
                            'cosine',
                            kc.embedding,
                            CAST(@query_vector AS VECTOR({{EmbeddingConstants.StorageDimensions}}))
                        ) AS distance
                    FROM knowledge_chunks AS kc
                    INNER JOIN knowledge_documents AS kd ON kd.id = kc.document_id
                    WHERE kc.embedding IS NOT NULL
                        AND kd.is_deleted = 0
                        AND kd.embedding_model = @embedding_model
                        AND kd.embedding_dimensions = @embedding_dimensions
                    ORDER BY distance
                    """;
                AddParameter(command, "@top_k", topK, DbType.Int32);
                AddParameter(command, "@query_vector", VectorHelper.Serialize(queryEmbedding), DbType.String);
                AddParameter(command, "@embedding_model", _geminiOptions.EmbeddingModel, DbType.String);
                AddParameter(command, "@embedding_dimensions", _geminiOptions.EmbeddingDimensions, DbType.Int32);

                var results = new List<RagSource>();
                await using var reader = await command.ExecuteReaderAsync(cancellationToken);
                while (await reader.ReadAsync(cancellationToken))
                {
                    results.Add(new RagSource
                    {
                        ChunkId = reader.GetInt32(0),
                        DocumentId = reader.GetInt32(1),
                        ChunkIndex = reader.GetInt32(2),
                        Content = reader.GetString(3),
                        Title = reader.GetString(4),
                        Distance = Convert.ToDouble(reader.GetValue(5), CultureInfo.InvariantCulture),
                    });
                }
                return results;
            }
            finally
            {
                if (shouldClose)
                    await connection.CloseAsync();
            }
        }

        private static void AddParameter(
            System.Data.Common.DbCommand command,
            string name,
            object value,
            DbType type)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value;
            parameter.DbType = type;
            command.Parameters.Add(parameter);
        }
    }
}