using BeautyBooking.AI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Interfaces
{
    public interface IRagService
    {
        Task<RagContext> RetrieveAsync(
            string query,
            string? conversationContext = null,
            CancellationToken cancellationToken = default
        );
    }
}