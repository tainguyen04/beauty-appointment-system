namespace BeautyBooking.DTO.Request
{
    public class CreateStaffProfileRequest
    {
        public int UserId { get; set; }
        public string? Bio { get; set; }
        public IFormFile? AvatarUrl { get; set; }
        public int WardId { get; set; }
        public List<int> ServiceIds { get; set; } = new();
    }
}
