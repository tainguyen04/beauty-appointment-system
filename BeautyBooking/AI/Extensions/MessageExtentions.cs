using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Models;
using BeautyBooking.Entities;

namespace BeautyBooking.AI.Extensions
{
    public static class MessageExtentions
    {
        public static ChatMessage ToChatMessage(this Message message)
        {
            return new ChatMessage { Role = message.Role, Content = message.Content };
        }
    }
}
