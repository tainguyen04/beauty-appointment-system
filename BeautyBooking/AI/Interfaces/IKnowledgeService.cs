using BeautyBooking.AI.DTO;
using BeautyBooking.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Interfaces
{
    public interface IKnowledgeService
    {
        Task<KnowledgeDocumentResponse> CreateKnowledgeDocumentAsync(string title, string content, CancellationToken cancellationToken = default);
        Task UpdateKnowledgeDocumentAsync(int documentId, string title, string content, CancellationToken cancellationToken = default);
        Task DeleteKnowledgeDocumentAsync(int documentId, CancellationToken cancellationToken = default);
        Task<int> ReindexSystemKnowledgeAsync(CancellationToken cancellationToken = default);
    }
}