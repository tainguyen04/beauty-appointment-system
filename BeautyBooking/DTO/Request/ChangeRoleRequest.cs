using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Request
{
    public class ChangeRoleRequest
    {
        public int UserId { get; set; }
        public UserRole NewRole { get; set; }
    }
}
