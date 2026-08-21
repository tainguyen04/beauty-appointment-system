using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.DTO;

namespace BeautyBooking.AI.Interfaces
{
    public interface IAIProviderFactory
    {
        public IAIProvider GetProvider(AIProviderType providerType);
    }
}
