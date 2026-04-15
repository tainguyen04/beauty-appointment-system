    using BeautyBooking.DTO.Filter;
    using BeautyBooking.DTO.Request;
    using BeautyBooking.DTO.Response;
    using BeautyBooking.Entities;

    namespace BeautyBooking.Interface.Service
    {
        public interface IAppointmentService
        {
            
            Task<int> CreateAsync(CreateAppointmentRequest request);
            Task<bool> UpdateAsync(int id, UpdateAppointmentRequest request);
            Task<bool> UpdateStatusAsync(int id, AppointmentStatus status);
            Task<bool> DeleteAsync(int id);

            Task<AppointmentResponse?> GetByIdWithDetailsAsync(int id);
            Task<PagedResult<AppointmentResponse>> GetAppointmentsAsync(AppointmentFilter filter);
        }
    }
