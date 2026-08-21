namespace BeautyBooking.AI.DTO
{
    public class ConversationResponse
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? LastMessage { get; set; }
    }

    public class ConversationMessagesResponse
    {
        public int ConversationId { get; set; }
        public string? Summary { get; set; }
        public List<ConversationMessageResponse> Messages { get; set; } = [];
    }

    public class ConversationMessageResponse
    {
        public int Id { get; set; }
        public ChatRole Role { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}