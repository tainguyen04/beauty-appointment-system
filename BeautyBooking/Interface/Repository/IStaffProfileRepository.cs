using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;

namespace BeautyBooking.Interface.Repository
{
    public interface IStaffProfileRepository : IRepository<StaffProfile, int>
    {
        Task<StaffProfile?> GetByUserIdAsync(int userId);
        Task<StaffProfile?> GetByUserIdWithUserAsync(int userId);
        Task<PagedResult<StaffProfile>> GetPagedWithUserAndServicesAsync(int pageNumber, int pageSize);
        Task<PagedResult<StaffProfile>> GetByServiceIdsAsync(
            List<int> serviceIds, int pageNumber, int pageSize, int? wardId = null);
        Task<IEnumerable<StaffProfile>> GetByServiceIdAsync(int serviceId);
        Task<IEnumerable<StaffProfile>> GetByWardIdAsync(int wardId);
        Task<StaffProfile?> GetByIdWithUserAndServicesAsync(int id);
        Task<StaffProfile?> GetByIdWithServicesAsync(int id);
        Task<IEnumerable<int>> GetServiceIdsByIdAsync(int id);
        Task<IEnumerable<StaffProfile>> GetWorkingByDateAsync(DateOnly date, int? wardId = null);
        Task<IEnumerable<StaffProfile>> GetActiveAsync(int? wardId = null);
        Task<IEnumerable<StaffProfile>> GetAvailableByTimeSlotAsync(
            DateOnly date, int startTime, int endTime, List<int> serviceIds, int? wardId = null);

    }
}
