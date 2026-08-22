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
            Bạn là hệ thống tóm tắt lịch sử hội thoại cho một AI Assistant.

            Nhiệm vụ:
            Tóm tắt cuộc hội thoại dưới đây để AI Assistant có thể tiếp tục
            cuộc trò chuyện một cách chính xác mà không cần đọc lại toàn bộ lịch sử.

            Chỉ giữ lại những thông tin có giá trị cho các lượt trò chuyện tiếp theo:

            - Thông tin người dùng đã cung cấp.
            - Yêu cầu, mục tiêu và ý định của người dùng.
            - Các lựa chọn, quyết định hoặc xác nhận đã được đưa ra.
            - Các dịch vụ, sản phẩm hoặc đối tượng đã được đề cập.
            - Các thông tin quan trọng liên quan đến ngữ cảnh hội thoại.
            - Những vấn đề hoặc yêu cầu chưa được giải quyết.

            Quy tắc:
            - Không thêm thông tin không xuất hiện trong cuộc hội thoại.
            - Không suy đoán hoặc tự tạo thông tin.
            - Không lặp lại những nội dung không còn giá trị.
            - Giữ nguyên các thông tin quan trọng như tên, số lượng, ngày giờ,
            giá tiền, mã hoặc lựa chọn của người dùng nếu chúng xuất hiện.
            - Nếu có yêu cầu chưa được giải quyết, phải ghi rõ.
            - Viết ngắn gọn, rõ ràng bằng tiếng Việt.

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
            var response = await _aiProvider.GenerateResponseAsync(
                [prompt],
                cancellationToken,
                enableTools: false
            );
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
