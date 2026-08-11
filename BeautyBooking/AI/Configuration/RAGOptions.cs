using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Configuration
{
    public class RAGOptions
    {
        public int ChunkSize { get; set; }
        public int Overlap { get; set; }
    }
}
