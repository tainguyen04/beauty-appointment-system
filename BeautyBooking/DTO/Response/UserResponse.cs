using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Response
{
    public class UserResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public UserRole Role { get; set; }
        public string? AvatarUrl { get; set; }
        public WardResponse? Ward { get; set; }
        public bool IsActived { get; set; }
        public int? StaffProfileId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
