using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Models;
using BeautyBooking.Entities;

namespace BeautyBooking.AI.Interfaces
{
    public interface IConversationSummary
    {
        Task<string> GetSummaryAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        );
        Task<string> GenerateSummaryAsync(
            List<ChatMessage> messages,
            CancellationToken cancellationToken = default
        );
        Task<string> SaveSummaryAsync(
            int conversationId,
            List<ChatMessage> messages,
            int lastSummarizedMessageId,
            CancellationToken cancellationToken = default
        );
        Task<ConversationSummary?> GetByConversationIdAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        );
    }
}
