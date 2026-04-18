namespace BeautyBooking.Entities
{
    public class User : BaseEntity
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; } 
        public string PasswordHash { get; set; } = null!;
        public UserRole Role { get; set; } = UserRole.Customer;
        public string? AvatarUrl { get; set; }
        public string? AvatarPublicId { get; set; }
        public string? Address { get; set; }
        public int? WardId { get; set; }
        public WebsiteLocalizationWard? Ward { get; set; } 
        public StaffProfile? StaffProfile { get; set; }
    }
    public enum UserRole
    {
        Customer,
        Admin,
        Staff
    }
}
