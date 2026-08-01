using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;

namespace BeautyBooking.AI.Models
{
    public class ChatMessage
    {
        public ChatRole Role { get; set; }

        public string? Content { get; set; }
    }
}
