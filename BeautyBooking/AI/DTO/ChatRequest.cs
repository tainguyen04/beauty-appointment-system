namespace BeautyBooking.AI.DTO
{
    public class ChatRequest
    {
        public int? ConversationId { get; set; }
        public string Prompt { get; set; } = string.Empty;
        public List<GuestChatMessage> GuestMessages { get; set; } = [];
    }

    public class GuestChatMessage
    {
        public GuestChatRole Role { get; set; } = GuestChatRole.User;
        public string Content { get; set; } = string.Empty;
    }

    public enum GuestChatRole
    {
        User,
        Assistant,
    }
}