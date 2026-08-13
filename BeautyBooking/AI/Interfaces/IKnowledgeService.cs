using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.Entities;

namespace BeautyBooking.AI.Interfaces
{
    public interface IKnowledgeService
    {
        Task<KnowledgeDocumentResponse> CreateKnowledgeDocumentAsync(string title, string content);
        Task UpdateKnowledgeDocumentAsync(int documentId, string title, string content);
        Task DeleteKnowledgeDocumentAsync(int documentId);
    }
}
