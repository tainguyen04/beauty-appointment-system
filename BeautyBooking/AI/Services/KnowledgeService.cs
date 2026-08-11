using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.AI.Services
{
    public class KnowledgeService : IKnowledgeService
    {
        private readonly IChunkService _chunkService;
        private readonly IEmBeddingService _embeddingService;
        private readonly IRepository<KnowledgeDocument, int> _knowledgeDocumentRepository;

        public KnowledgeService(
            IChunkService chunkService,
            IEmBeddingService embeddingService,
            IRepository<KnowledgeDocument, int> knowledgeDocumentRepository
        )
        {
            _chunkService = chunkService;
            _embeddingService = embeddingService;
            _knowledgeDocumentRepository = knowledgeDocumentRepository;
        }

        public async Task<KnowledgeDocumentResponse> CreateKnowledgeDocumentAsync(
            string title,
            string content
        )
        {
            var document = new KnowledgeDocument { Title = title, Content = content };
            var chunks = _chunkService.SplitTextIntoChunks(content);
            document.Chunks = chunks
                .Select(
                    (chunk, index) => new KnowledgeChunk { Content = chunk, ChunkIndex = index }
                )
                .ToList();
            foreach (var chunk in document.Chunks)
            {
                chunk.Embedding = await _embeddingService.GenerateEmbeddingAsync(chunk.Content);
            }
            await _knowledgeDocumentRepository.CreateAsync(document);
            await _knowledgeDocumentRepository.SaveChangesAsync();
            return new KnowledgeDocumentResponse
            {
                Id = document.Id,
                Title = document.Title,
                Content = document.Content,
                Chunks = document
                    .Chunks.Select(c => new KnowledgeChunkResponse
                    {
                        Id = c.Id,
                        Content = c.Content,
                        ChunkIndex = c.ChunkIndex,
                    })
                    .ToList(),
            };
        }
    }
}
