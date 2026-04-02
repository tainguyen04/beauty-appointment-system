using BeautyBooking.DTO.Response;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Helper;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Repository
{
    public class AppointmentRepository : Repository<Appointment, int>, IAppointmentRepository
    {
        public AppointmentRepository(ApplicationDbContext dbcontext) : base(dbcontext)
        {
        }
        public async Task<List<int>> GetBusyStaffIdsAsync(DateOnly date, int startTime, int endTime)
        {
            return await _entities
                .Where(a => a.AppointmentDate == date &&
                            a.AppointmentStatus != AppointmentStatus.Cancelled &&
                            ((startTime < a.EndTime && endTime > a.StartTime)) &&
                            !a.IsDeleted)
                .Select(a => a.StaffId)
                .Distinct()
                .ToListAsync();
        }
        
        public async Task<IEnumerable<Appointment>> GetAppointmentsByStaffIdAsync(int staffId, DateOnly date)
        {
            return await _entities
                .Where(a => a.StaffId == staffId &&
                            a.AppointmentDate == date &&
                            a.AppointmentStatus != AppointmentStatus.Cancelled &&
                            !a.IsDeleted)
                .Include(a => a.User)
                .Include(a => a.AppointmentServices)
                    .ThenInclude(a => a.Service)
                .ToListAsync();
        }

        public async Task<PagedResult<Appointment>> GetAppointmentsByUserIdAsync(int userId, int pageNumber, int pageSize)
        {
            return await _entities
                .Where(a => a.UserId == userId && !a.IsDeleted)
                .Include(a => a.Staff)
                .Include(a => a.AppointmentServices)
                    .ThenInclude(a => a.Service)
                .AsSplitQuery()
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<bool> HasAnyAppointmentsAsync(int staffId, DateOnly date)
        {
            return await _entities.AnyAsync(a =>
                a.StaffId == staffId &&
                a.AppointmentDate == date &&
                a.AppointmentStatus != AppointmentStatus.Cancelled &&
                !a.IsDeleted);
        }

        public async Task<bool> HasOverlapAsync(int staffId, DateOnly appointmentDate, int startTime, int endTime, int? excludeId = null)
        {
           return await _entities.AnyAsync(a =>
                a.StaffId == staffId &&
                a.AppointmentDate == appointmentDate &&
                a.AppointmentStatus != AppointmentStatus.Cancelled &&
                ((startTime < a.EndTime && endTime > a.StartTime) && (!excludeId.HasValue || a.Id != excludeId.Value)) &&
                !a.IsDeleted);
        }

        public async Task<PagedResult<Appointment>> GetAllDetailedAsync(int pageNumber, int pageSize)
        {
            return await _entities
                .Where(a => !a.IsDeleted)
                .Include(a => a.User)
                .Include(a => a.Staff)
                .Include(a => a.AppointmentServices)
                    .ThenInclude(a => a.Service)
                .AsSplitQuery()
                .ToPagedResultAsync(pageNumber, pageSize);
        }

        public async Task<Appointment?> GetDetailedByIdAsync(int id)
        {
            return await _entities
                .Where(a => a.Id == id && !a.IsDeleted)
                .Include(a => a.User)
                .Include(a => a.Staff)
                .Include(a => a.AppointmentServices)
                    .ThenInclude(a => a.Service)
                .AsSplitQuery()
                .FirstOrDefaultAsync();
        }

    }
}
