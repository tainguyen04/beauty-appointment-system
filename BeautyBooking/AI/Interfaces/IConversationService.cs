using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.Entities;

namespace BeautyBooking.AI.Interfaces
{
    public interface IConversationService
    {
        Task<Conversation> CreateAsync(CancellationToken cancellationToken = default);
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
    }
}
