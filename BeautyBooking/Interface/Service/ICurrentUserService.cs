using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;

namespace BeautyBooking.Interface.Service
{
    public interface ICurrentUserService
    {
        int UserId { get; }
        string Email { get; }
        UserRole Role { get; }
        int StaffId { get; }
    }
}
