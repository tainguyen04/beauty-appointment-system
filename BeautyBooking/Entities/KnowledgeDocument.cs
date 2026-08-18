using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.Entities
{
    public class KnowledgeDocument : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string EmbeddingModel { get; set; } = string.Empty;
        public int EmbeddingDimensions { get; set; }
        public DateTime? IndexedAt { get; set; }
        public ICollection<KnowledgeChunk> Chunks { get; set; } = [];
    }
}