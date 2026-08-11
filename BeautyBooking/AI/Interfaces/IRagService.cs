using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Interfaces
{
    public interface IRagService
    {
        Task<string> BuildContextAsync(
            string query,
            int topK = 3,
            CancellationToken cancellationToken = default
        );
    }
}
