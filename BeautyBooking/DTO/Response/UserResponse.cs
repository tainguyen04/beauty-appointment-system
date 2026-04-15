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
        public int? WardId { get; set; }
        public string? WardName { get; set; }
        public int? StaffId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }
}
