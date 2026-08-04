using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Extensions;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using Microsoft.Extensions.Options;

namespace BeautyBooking.AI.Services
{
    public class ContextWindowService : IContextWindowService
    {
        private readonly ContextWindowOptions _options;
        private readonly IConversationService _conversationService;

        public ContextWindowService(
            IOptions<ContextWindowOptions> options,
            IConversationService conversationService
        )
        {
            _options = options.Value;
            _conversationService = conversationService;
        }

        public async Task<List<ChatMessage>> BuildContextWindowAsync(
            int conversationId,
            string systemPrompt,
            CancellationToken cancellationToken = default
        )
        {
            var context = CreateSystemMessage(systemPrompt);
            var conversationHistory = await BuildConversationHistoryAsync(
                conversationId,
                cancellationToken
            );
            context.AddRange(conversationHistory);
            return context;
        }

        private static List<ChatMessage> CreateSystemMessage(string systemPrompt)
        {
            return new List<ChatMessage>
            {
                new() { Role = ChatRole.System, Content = systemPrompt },
            };
        }

        private async Task<List<ChatMessage>> BuildConversationHistoryAsync(
            int conversationId,
            CancellationToken cancellationToken
        )
        {
            var historyMessages = await _conversationService.GetMessagesAsync(
                conversationId,
                cancellationToken
            );
            return historyMessages
                .TakeLast(_options.MaxMessages)
                .Select(m => m.ToChatMessage())
                .ToList();
        }
    }
}
