using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Models;

namespace BeautyBooking.AI.Interfaces
{
    public interface IContextWindowService
    {
        Task<List<ChatMessage>> BuildContextWindowAsync(
            int conversationId,
            string systemPrompt,
            CancellationToken cancellationToken = default
        );
    }
}
