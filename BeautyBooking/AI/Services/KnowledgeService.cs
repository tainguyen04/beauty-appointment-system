using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
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
        private readonly IPythonAIService _pythonAIService;

        public KnowledgeService(
            IChunkService chunkService,
            IEmBeddingService embeddingService,
            IRepository<KnowledgeDocument, int> knowledgeDocumentRepository,
            IPythonAIService pythonAIService
        )
        {
            _chunkService = chunkService;
            _embeddingService = embeddingService;
            _knowledgeDocumentRepository = knowledgeDocumentRepository;
            _pythonAIService = pythonAIService;
        }

        public async Task<KnowledgeDocumentResponse> CreateKnowledgeDocumentAsync(
            string title,
            string content
        )
        {
            var document = new KnowledgeDocument { Title = title, Content = content };
            /* pipelined rather than doing it in the service, we will send the document to the python service for ingestion
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
            */

            await _knowledgeDocumentRepository.CreateAsync(document);
            await _knowledgeDocumentRepository.SaveChangesAsync();
            var pythonRequest = new PythonKnowledgeRequest
            {
                DocumentId = document.Id,
                Content = content,
            };
            await _pythonAIService.IngestKnowledgeAsync(pythonRequest);
            return new KnowledgeDocumentResponse
            {
                Id = document.Id,
                Title = document.Title,
                Content = document.Content,
            };
        }

        public async Task DeleteKnowledgeDocumentAsync(int documentId)
        {
            var document =
                await _knowledgeDocumentRepository.GetByIdAsync(documentId)
                ?? throw new ArgumentException(
                    $"Knowledge document with ID {documentId} not found."
                );
            _knowledgeDocumentRepository.Delete(document);
            await _knowledgeDocumentRepository.SaveChangesAsync();
            await _pythonAIService.DeleteKnowledgeAsync(documentId);
        }

        public async Task UpdateKnowledgeDocumentAsync(int documentId, string title, string content)
        {
            var document =
                await _knowledgeDocumentRepository.GetByIdAsync(documentId)
                ?? throw new ArgumentException(
                    $"Knowledge document with ID {documentId} not found."
                );
            document.Title = title;
            document.Content = content;
            await _knowledgeDocumentRepository.SaveChangesAsync();
            var pythonRequest = new PythonKnowledgeRequest
            {
                DocumentId = documentId,
                Content = content,
            };
            await _pythonAIService.UpdateKnowledgeAsync(pythonRequest);
        }
    }
}
