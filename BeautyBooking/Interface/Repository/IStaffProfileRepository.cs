using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IStaffProfileRepository : IRepository<StaffProfile, int>
    {
        Task<StaffProfile?> GetByUserIdAsync(int userId, bool includeUser = false);
        Task<StaffProfile?> GetByIdWithDetailsAsync(int id);
        Task<IEnumerable<StaffProfile?>> GetAllStaffWithDetailsAsync();
        

    }
}
