namespace BeautyBooking.AI.DTO
{
    public class ChatRequest
    {
        public int? ConversationId { get; set; }
        public string Prompt { get; set; } = string.Empty;
    }
}
