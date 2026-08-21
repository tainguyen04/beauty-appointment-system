using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;
using BeautyBooking.AI.Helper;
using BeautyBooking.AI.Models;

namespace BeautyBooking.AI.Extensions
{
    public static class OllamaMessageExtensions
    {
        public static OllamaChatMessage ToOllamaChatMessage(this ChatMessage chatMessage)
        {
            return new OllamaChatMessage
            {
                Role = chatMessage.Role.ToOllamaRole(),
                Content = chatMessage.Content,
            };
        }

        public static List<OllamaChatMessage> ToOllamaChatMessages(
            this IEnumerable<ChatMessage> chatMessages
        )
        {
            return chatMessages.Select(m => m.ToOllamaChatMessage()).ToList();
        }

        public static ChatMessage ToChatMessage(this OllamaChatMessage ollamaChatMessage)
        {
            return new ChatMessage
            {
                Role = ollamaChatMessage.Role switch
                {
                    "system" => ChatRole.System,
                    "user" => ChatRole.User,
                    "assistant" => ChatRole.Assistant,
                    "tool" => ChatRole.Tool,
                    _ => throw new InvalidOperationException(
                        $"Unknown role: {ollamaChatMessage.Role}"
                    ),
                },
                Content = ollamaChatMessage.Content,
            };
        }
    }
}
