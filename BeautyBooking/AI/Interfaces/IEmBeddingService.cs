using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Interfaces
{
    public interface IEmBeddingService
    {
        Task<float[]> GenerateEmbeddingAsync(
            string text,
            CancellationToken cancellationToken = default
        );
    }
}
