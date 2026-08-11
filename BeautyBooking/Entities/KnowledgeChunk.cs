using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.Entities
{
    public class KnowledgeChunk
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public string Content { get; set; } = string.Empty;
        public int ChunkIndex { get; set; }
        public float[]? Embedding { get; set; }
        public KnowledgeDocument Document { get; set; } = null!;
    }
}
