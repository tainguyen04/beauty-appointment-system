using BeautyBooking.AI.DTO;
using BeautyBooking.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Interfaces
{
    public interface IConversationService
    {
        Task<Conversation> CreateAsync(int userId, CancellationToken cancellationToken = default);
        Task<Conversation?> GetByIdAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        );
        Task AddMessageAsync(
            int conversationId,
            string content,
            ChatRole role,
            CancellationToken cancellationToken = default
        );
        Task<List<Message>> GetMessagesAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        );
        Task<Conversation?> GetOwnedByIdAsync(
            int conversationId,
            int userId,
            CancellationToken cancellationToken = default
        );
        Task<List<ConversationResponse>> GetConversationsAsync(
            int userId,
            CancellationToken cancellationToken = default
        );
        Task<int> CountMessagesAsync(int conversationId, CancellationToken cancellationToken = default);
        Task<List<Message>> GetRecentMessagesAsync(
            int conversationId,
            int count,
            CancellationToken cancellationToken = default
        );
        Task<List<Message>> GetMessagesAfterAsync(
            int conversationId,
            int lastMessageId,
            int count,
            CancellationToken cancellationToken = default
        );
    }
}