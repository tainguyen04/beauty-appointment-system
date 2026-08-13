using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BeautyBooking.AI.DTO
{
    public sealed class PythonKnowledgeRequest
    {
        [JsonPropertyName("document_id")]
        public int DocumentId { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;
    }
}
