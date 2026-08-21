using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Configuration
{
    public class RAGOptions
    {
        public int ChunkSize { get; set; } = 800;
        public int Overlap { get; set; } = 100;
        public int TopK { get; set; } = 3;
    }
}