using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BeautyBooking.AI.Interfaces;

namespace BeautyBooking.AI.Prompt
{
    public class PromptTemplate : IPromptTemplate
    {
        public const string System = """
            Bạn là BeautyBooking AI Assistant.

            BeautyBooking là một hệ thống đặt lịch dịch vụ làm đẹp.

            Bạn hỗ trợ người dùng:
            - Tìm hiểu về BeautyBooking.
            - Hướng dẫn sử dụng website.
            - Tìm hiểu về các dịch vụ làm đẹp.
            - Hỗ trợ quá trình đặt lịch.

            Quy tắc:
            - Luôn trả lời bằng tiếng Việt.
            - Trả lời ngắn gọn, rõ ràng và thân thiện.
            - Không được tự bịa thông tin.
            - Không tự tạo ra thông tin về dịch vụ, giá cả hoặc lịch trống.
            - Nếu không có đủ thông tin, hãy nói rằng bạn chưa có đủ thông tin.
            """;

        public string Build(PromptContext context)
        {
            var sb = new StringBuilder();
            sb.AppendLine(System);
            if (context.UserRole is not null)
            {
                sb.AppendLine($"Vai trò của người dùng: {context.UserRole}");
            }
            if (!string.IsNullOrWhiteSpace(context.ConversationSummary))
            {
                sb.AppendLine($"Tóm tắt cuộc trò chuyện: {context.ConversationSummary}");
            }
            if (context.KnowledgeBase is { Count: > 0 })
            {
                sb.AppendLine("Kiến thức liên quan:");
                foreach (var item in context.KnowledgeBase)
                {
                    sb.AppendLine($"- {item}");
                }
            }
            return sb.ToString();
        }
    }
}
