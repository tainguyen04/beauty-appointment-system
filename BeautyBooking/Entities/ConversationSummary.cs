using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.Entities
{
    public class ConversationSummary : BaseEntity
    {
        public int ConversationId { get; set; }
        public string Summary { get; set; } = string.Empty;
        public int LastSummarizedMessageId { get; set; }
        public Conversation Conversation { get; set; } = null!;
    }
}
