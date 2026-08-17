using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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

        public async Task<Conversation> CreateAsync(
            int userId,
            CancellationToken cancellationToken = default
        )
        {
            var conversation = new Conversation { UserId = userId };
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

        public async Task<Conversation?> GetOwnedByIdAsync(
            int conversationId,
            int userId,
            CancellationToken cancellationToken = default
        )
        {
            return await _conversationRepository
                .Query()
                .FirstOrDefaultAsync(
                    c => c.Id == conversationId && c.UserId == userId,
                    cancellationToken
                );
        }

        public async Task<List<ConversationResponse>> GetConversationsAsync(
            int userId,
            CancellationToken cancellationToken = default
        )
        {
            return await _conversationRepository
                .Query()
                .Where(c => c.UserId == userId)
                .Select(c => new ConversationResponse
                {
                    Id = c.Id,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => (DateTime?)m.CreatedAt)
                        .FirstOrDefault() ?? c.UpdatedAt,
                    LastMessage = c.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.Content)
                        .FirstOrDefault(),
                })
                .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Message>> GetMessagesAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        )
        {
            return await _messageRepository
                .Query()
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public Task<int> CountMessagesAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        ) => _messageRepository.Query().CountAsync(m => m.ConversationId == conversationId, cancellationToken);

        public async Task<List<Message>> GetRecentMessagesAsync(
            int conversationId,
            int count,
            CancellationToken cancellationToken = default
        )
        {
            var messages = await _messageRepository
                .Query()
                .Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.Id)
                .Take(count)
                .ToListAsync(cancellationToken);
            messages.Reverse();
            return messages;
        }

        public Task<List<Message>> GetMessagesAfterAsync(
            int conversationId,
            int lastMessageId,
            int count,
            CancellationToken cancellationToken = default
        ) => _messageRepository
            .Query()
            .Where(m => m.ConversationId == conversationId && m.Id > lastMessageId)
            .OrderBy(m => m.Id)
            .Take(count)
            .ToListAsync(cancellationToken);
    }
}