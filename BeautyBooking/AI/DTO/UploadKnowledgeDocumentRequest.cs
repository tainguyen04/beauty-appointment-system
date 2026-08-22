using Microsoft.AspNetCore.Http;

namespace BeautyBooking.AI.DTO
{
    public class UploadKnowledgeDocumentRequest
    {
        public string? Title { get; set; }
        public IFormFile File { get; set; } = null!;
    }
}
