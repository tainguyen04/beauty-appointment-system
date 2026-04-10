namespace BeautyBooking.DTO.Request
{
    public class UpdateStaffProfileRequest
    {
        public string? Bio { get; set; }
        public IFormFile? AvatarUrl { get; set; }
        public List<int> ServiceIds { get; set; } = new();
    }
}
