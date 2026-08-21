using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Models;
using BeautyBooking.Entities;

namespace BeautyBooking.AI.Prompt
{
    public class PromptContext
    {
        public UserRole? UserRole { get; set; }
        public string? ConversationSummary { get; set; }
        public List<string> KnowledgeBase { get; set; } = [];
    }
}
