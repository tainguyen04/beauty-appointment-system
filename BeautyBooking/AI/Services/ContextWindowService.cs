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
        private readonly IConversationSummary _conversationSummaryService;

        public ContextWindowService(
            IOptions<ContextWindowOptions> options,
            IConversationService conversationService,
            IConversationSummary conversationSummaryService
        )
        {
            _options = options.Value;
            _conversationService = conversationService;
            _conversationSummaryService = conversationSummaryService;
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
            return [new() { Role = ChatRole.System, Content = systemPrompt }];
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
            var summaryEntity = await _conversationSummaryService.GetByConversationIdAsync(
                conversationId,
                cancellationToken
            );
            if (historyMessages.Count > _options.MaxMessages)
            {
                var lastSummarizedMessageId = summaryEntity?.LastSummarizedMessageId ?? 0;
                var chatMessagesToSummarize = historyMessages
                    .Where(m => m.Id > lastSummarizedMessageId)
                    .TakeLast(_options.MaxMessages - _options.RecentMessages)
                    .ToList();
                if (chatMessagesToSummarize.Count > 0)
                {
                    var newLastSummarizedMessageId = chatMessagesToSummarize.Last().Id;
                    await _conversationSummaryService.SaveSummaryAsync(
                        conversationId,
                        chatMessagesToSummarize.Select(m => m.ToChatMessage()).ToList(),
                        newLastSummarizedMessageId,
                        cancellationToken
                    );
                }
            }
            var summary = await _conversationSummaryService.GetSummaryAsync(
                conversationId,
                cancellationToken
            );

            var recentMessages = historyMessages
                .TakeLast(_options.RecentMessages)
                .Select(m => m.ToChatMessage())
                .ToList();
            if (!string.IsNullOrWhiteSpace(summary))
            {
                recentMessages.Insert(
                    0,
                    new ChatMessage { Role = ChatRole.System, Content = summary }
                );
            }
            return recentMessages;
        }
    }
}
