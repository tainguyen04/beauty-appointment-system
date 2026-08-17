using BeautyBooking.AI.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.Entities
{
    public class Conversation : BaseEntity
    {
        public int? UserId { get; set; }
        public User? User { get; set; }
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