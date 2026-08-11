using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Interfaces
{
    public interface IChunkService
    {
        List<string> SplitTextIntoChunks(string content);
    }
}
