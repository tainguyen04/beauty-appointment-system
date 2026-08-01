using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.AI.Services
{
    public class ConservationService : IConversationService
    {
        private readonly IRepository<Conversation, int> _conversationRepository;
        private readonly IRepository<Message, int> _messageRepository;

        public ConservationService(
            IRepository<Conversation, int> conversationRepository,
            IRepository<Message, int> messageRepository
        )
        {
            _conversationRepository = conversationRepository;
            _messageRepository = messageRepository;
        }

        public async Task AddMessageAsync(
            int conversationId,
            string content,
            ChatRole role,
            CancellationToken cancellationToken = default
        )
        {
            var conversation =
                await _conversationRepository
                    .Query()
                    .FirstOrDefaultAsync(c => c.Id == conversationId, cancellationToken)
                ?? throw new ArgumentException($"Conversation with ID {conversationId} not found.");
            var message = new Message
            {
                ConversationId = conversationId,
                Content = content,
                Role = role,
            };

            await _messageRepository.CreateAsync(message);
            await _messageRepository.SaveChangesAsync();
        }

        public async Task<Conversation> CreateAsync(CancellationToken cancellationToken = default)
        {
            var conversation = new Conversation();
            await _conversationRepository.CreateAsync(conversation);
            await _conversationRepository.SaveChangesAsync();
            return conversation;
        }

        public async Task<Conversation?> GetByIdAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        )
        {
            return await _conversationRepository
                .Query()
                .FirstOrDefaultAsync(c => c.Id == conversationId, cancellationToken);
        }

        public async Task<List<Message>> GetMessagesAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        )
        {
            return await _messageRepository
                .Query()
                .Where(m => m.ConversationId == conversationId)
                .ToListAsync(cancellationToken);
        }
    }
}
