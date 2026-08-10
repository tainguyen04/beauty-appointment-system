using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Models;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.AI.Services
{
    public class ConversationSummaryService : IConversationSummary
    {
        private const string SummaryPrompt = """
            Bạn là hệ thống tóm tắt hội thoại.

            Hãy tóm tắt cuộc hội thoại dưới đây để một AI khác có thể tiếp tục
            cuộc trò chuyện mà không cần đọc lại toàn bộ lịch sử.

            Chỉ giữ lại những thông tin quan trọng:
            - Thông tin người dùng đã cung cấp.
            - Yêu cầu và mục tiêu của người dùng.
            - Những lựa chọn hoặc quyết định đã được đưa ra.
            - Thông tin dịch vụ đã được đề cập.
            - Những vấn đề chưa được giải quyết.

            Không thêm thông tin không xuất hiện trong cuộc hội thoại.
            Viết ngắn gọn bằng tiếng Việt.

            Hội thoại:
            """;
        private readonly IAIProvider _aiProvider;
        private readonly IRepository<ConversationSummary, int> _conversationSummaryRepository;

        public ConversationSummaryService(
            IAIProvider aiProvider,
            IRepository<ConversationSummary, int> conversationSummaryRepository
        )
        {
            _aiProvider = aiProvider;
            _conversationSummaryRepository = conversationSummaryRepository;
        }

        public async Task<string> GenerateSummaryAsync(
            List<ChatMessage> messages,
            CancellationToken cancellationToken = default
        )
        {
            var conversationText = string.Join(
                "\n",
                messages.Select(m => $"{m.Role}: {m.Content}")
            );
            var prompt = new ChatMessage
            {
                Role = ChatRole.System,
                Content = SummaryPrompt + conversationText,
            };
            var response = await _aiProvider.GenerateResponseAsync([prompt], cancellationToken);
            return response;
        }

        public async Task<string> SaveSummaryAsync(
            int conversationId,
            List<ChatMessage> messages,
            int lastSummarizedMessageId,
            CancellationToken cancellationToken = default
        )
        {
            var summary = await GetSummaryAsync(conversationId, cancellationToken);
            var summaryMessages = new List<ChatMessage>();

            if (!string.IsNullOrWhiteSpace(summary))
            {
                summaryMessages.Add(new ChatMessage { Role = ChatRole.System, Content = summary });
            }
            summaryMessages.AddRange(messages);
            var newSummary = await GenerateSummaryAsync(summaryMessages, cancellationToken);
            var existingSummary = await _conversationSummaryRepository
                .Query()
                .FirstOrDefaultAsync(cs => cs.ConversationId == conversationId, cancellationToken);
            if (existingSummary != null)
            {
                existingSummary.Summary = newSummary;
                existingSummary.LastSummarizedMessageId = lastSummarizedMessageId;
                await _conversationSummaryRepository.SaveChangesAsync();
                return newSummary;
            }
            else
            {
                var summaryEntity = new ConversationSummary
                {
                    ConversationId = conversationId,
                    Summary = newSummary,
                    LastSummarizedMessageId = lastSummarizedMessageId,
                };
                await _conversationSummaryRepository.CreateAsync(summaryEntity);
                await _conversationSummaryRepository.SaveChangesAsync();
                return newSummary;
            }
        }

        public async Task<string> GetSummaryAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        )
        {
            var summary = await _conversationSummaryRepository
                .Query()
                .FirstOrDefaultAsync(cs => cs.ConversationId == conversationId, cancellationToken);
            return summary?.Summary ?? string.Empty;
        }

        public async Task<ConversationSummary?> GetByConversationIdAsync(
            int conversationId,
            CancellationToken cancellationToken = default
        )
        {
            return await _conversationSummaryRepository
                .Query()
                .FirstOrDefaultAsync(cs => cs.ConversationId == conversationId, cancellationToken);
        }
    }
}
