namespace BeautyBooking.DTO.Request
{
    public class CreateStaffProfileRequest
    {
        public int UserId { get; set; }
        public string? Bio { get; set; }
        public List<int> ServiceIds { get; set; } = new();
    }
}
