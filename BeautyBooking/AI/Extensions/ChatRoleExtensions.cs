using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;

namespace BeautyBooking.AI.Helper
{
    public static class ChatRoleExtensions
    {
        public static string ToOllamaRole(this ChatRole role)
        {
            return role switch
            {
                ChatRole.System => "system",
                ChatRole.User => "user",
                ChatRole.Assistant => "assistant",
                ChatRole.Tool => "tool",
                _ => throw new InvalidOperationException($"Unsupported role: {role}"),
            };
        }
    }
}
