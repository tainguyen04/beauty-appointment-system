using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.DTO
{
    public class KnowledgeDocumentResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<KnowledgeChunkResponse> Chunks { get; set; } = [];
    }

    public class KnowledgeChunkResponse
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int ChunkIndex { get; set; }
    }
}
