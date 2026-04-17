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

        public async Task<IEnumerable<Appointment>> GetAppointmentsByStaffIdAsync(int staffId, DateOnly date)
        {
            return await _entities
                .Where(a => a.StaffId == staffId &&
                            a.AppointmentDate == date &&
                            a.AppointmentStatus != AppointmentStatus.Cancelled)
                .Include(a => a.User)
                .Include(a => a.AppointmentServices)
                    .ThenInclude(a => a.Service)
                .ToListAsync();
        }

        public async Task<PagedResult<Appointment>> GetAppointmentsByUserIdAsync(int userId, int pageNumber, int pageSize)
        {
            return await _entities
                .Where(a => a.UserId == userId)
                .Include(a => a.Staff)
                .Include(a => a.AppointmentServices)
                    .ThenInclude(a => a.Service)
                .OrderBy(a => a.AppointmentDate)
                .AsSplitQuery()
                .ToPagedResultAsync(pageNumber, pageSize);
        }


        public async Task<bool> HasOverlapAsync(int staffId, DateOnly appointmentDate, int startTime, int endTime, int? excludeId = null)
        {
           return await _entities.AnyAsync(a =>
                a.StaffId == staffId &&
                a.AppointmentDate == appointmentDate &&
                a.AppointmentStatus != AppointmentStatus.Cancelled &&
                ((startTime < a.EndTime && endTime > a.StartTime) && (!excludeId.HasValue || a.Id != excludeId.Value)));
        }
        public async Task<bool> HasAnyAppointmentsAsync(int staffId, DateOnly date)
        {
            return await _entities.AnyAsync(a =>
                a.StaffId == staffId &&
                a.AppointmentDate == date &&
                a.AppointmentStatus != AppointmentStatus.Cancelled);
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

        public async Task<PagedResult<Appointment>> GetPagedAsync(int pageNumber, int pageSize)
        {
            return await _entities
                .Include(a => a.User)
                .Include(a => a.Staff)
                .Include(a => a.AppointmentServices)
                    .ThenInclude(a => a.Service)
                .OrderByDescending(a => a.AppointmentDate)
                .AsSplitQuery()
                .ToPagedResultAsync(pageNumber, pageSize);
        }


        public async Task<IEnumerable<int>> GetBusyStaffIdsAsync(DateOnly date, int startTime, int endTime)
        {
            return await _entities
                .Where(a => a.AppointmentDate == date &&
                            a.AppointmentStatus != AppointmentStatus.Cancelled &&
                            ((startTime < a.EndTime && endTime > a.StartTime)))
                .Select(a => a.StaffId)
                .Distinct()
                .ToListAsync();
        }

        public async Task<int> GetAppointmentsCountByDateAsync(DateTime date)
        {
            return await _entities.CountAsync(a => 
                                a.AppointmentDate == DateOnly.FromDateTime(date) && 
                                a.AppointmentStatus != AppointmentStatus.Cancelled);
        }

        public async Task<decimal> GetTotalRevenueByDateAsync(DateTime date)
        {
            return await _entities
                .Where(a => a.AppointmentDate == DateOnly.FromDateTime(date) &&
                            a.AppointmentStatus != AppointmentStatus.Cancelled)
                .SelectMany(a => a.AppointmentServices)
                .SumAsync(a => (decimal?)a.Service.Price) ?? 0;
        }

        public async Task<IEnumerable<Appointment>> GetTopUpcomingAsync(int count)
        {
            return await _entities
                .Where(a => a.AppointmentDate >= DateOnly.FromDateTime(DateTime.UtcNow) &&
                            a.AppointmentStatus != AppointmentStatus.Cancelled)
                .Include(a => a.User)
                .Include(a => a.Staff)
                    .ThenInclude(s => s.User)
                .Include(a => a.AppointmentServices)
                    .ThenInclude(a => a.Service)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.StartTime)
                .Take(count)
                .AsSplitQuery()
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
