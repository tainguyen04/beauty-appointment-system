using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Request
{
    public class UpdateUserRequest
    {   
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? AvatarUrl { get; set; }

    }
}
