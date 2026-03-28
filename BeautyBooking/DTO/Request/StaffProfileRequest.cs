namespace BeautyBooking.DTO.Request
{
    public class StaffProfileRequest
    {
        public int UserId { get; set; }
        public string? Bio { get; set; }
        public List<int> ServiceIds { get; set; } = new();
    }
}
