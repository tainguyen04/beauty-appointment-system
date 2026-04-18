using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Request
{
    public class UpdateUserRequest
    {   
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public IFormFile? AvatarUrl { get; set; }
        public string? Address { get; set; }
        public int? WardId { get; set; }

    }
}
