using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;

namespace BeautyBooking.AI.Interfaces
{
    public interface IPythonAIService
    {
        Task<bool> HealthCheckAsync(CancellationToken cancellationToken = default);
        Task IngestKnowledgeAsync(
            PythonKnowledgeRequest request,
            CancellationToken cancellationToken = default
        );
        Task UpdateKnowledgeAsync(
            PythonKnowledgeRequest request,
            CancellationToken cancellationToken = default
        );
        Task DeleteKnowledgeAsync(int documentId, CancellationToken cancellationToken = default);
        Task<string> AskAsync(string question, CancellationToken cancellationToken = default);
    }
}
