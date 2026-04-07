using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IStaffProfileRepository : IRepository<StaffProfile, int>
    {
        Task<StaffProfile?> GetByUserIdAsync(int userId);
        Task<StaffProfile?> GetByUserIdWithUserAsync(int userId);
        IQueryable<StaffProfile> QueryDetailed();
        IQueryable<StaffProfile> GetByServiceIds(List<int> serviceIds);
        IQueryable<StaffProfile> GetByServiceId(int serviceId);
        Task<IEnumerable<int>> GetServiceIdsByIdAsync(int id);
        IQueryable<StaffProfile> GetWorkingByDate(DateOnly date);
        IQueryable<StaffProfile> GetActive();
        IQueryable<StaffProfile> GetAvailableByTimeSlot(DateOnly date, int? startTime = null, int? endTime = null);

    }
}
