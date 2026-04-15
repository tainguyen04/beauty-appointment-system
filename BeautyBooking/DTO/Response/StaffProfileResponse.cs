namespace BeautyBooking.DTO.Response
{
    public class StaffProfileResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public int WardId { get; set; }
        public string? WardName { get; set; }
        public List<ServiceResponse> Services { get; set; } = new();
    }
}
