using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Extensions;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
            var summaryEntity = await _conversationSummaryService.GetByConversationIdAsync(
                conversationId,
                cancellationToken
            );
            var messageCount = await _conversationService.CountMessagesAsync(
                conversationId,
                cancellationToken
            );
            if (messageCount > _options.MaxMessages)
            {
                var lastSummarizedMessageId = summaryEntity?.LastSummarizedMessageId ?? 0;
                var summarizeCount = Math.Max(1, _options.MaxMessages - _options.RecentMessages);
                var chatMessagesToSummarize = await _conversationService.GetMessagesAfterAsync(
                    conversationId,
                    lastSummarizedMessageId,
                    summarizeCount,
                    cancellationToken
                );
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

            var recentEntities = await _conversationService.GetRecentMessagesAsync(
                conversationId,
                Math.Max(1, _options.RecentMessages),
                cancellationToken
            );
            var recentMessages = recentEntities
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