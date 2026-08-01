using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;

namespace BeautyBooking.Entities
{
    public class Conversation : BaseEntity
    {
        public ICollection<Message> Messages { get; set; } = [];
    }

    public class Message : BaseEntity
    {
        public string Content { get; set; } = string.Empty;
        public ChatRole Role { get; set; }
        public int ConversationId { get; set; }
        public Conversation Conversation { get; set; } = null!;
    }
}
