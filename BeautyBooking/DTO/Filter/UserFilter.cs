using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Filter
{
    public class UserFilter : BaseFilter
    {
        public string? Keyword { get; set; }
        public UserRole? Role { get; set; }
    }
}
