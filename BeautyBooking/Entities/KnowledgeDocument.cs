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
        public ICollection<KnowledgeChunk> Chunks { get; set; } = [];
    }
}
