namespace BeautyBooking.DTO.Response
{
    public class StaffProfileResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public List<string> ServiceNames { get; set; } = new();
    }
}
