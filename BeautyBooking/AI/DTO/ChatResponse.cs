namespace BeautyBooking.AI.DTO
{
    public class ChatResponse
    {
        public int? ConversationId { get; set; }
        public string? Message { get; set; }
        public List<RagSourceResponse> Sources { get; set; } = [];
    }

    public class RagSourceResponse
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int ChunkIndex { get; set; }
        public double Distance { get; set; }
    }
}