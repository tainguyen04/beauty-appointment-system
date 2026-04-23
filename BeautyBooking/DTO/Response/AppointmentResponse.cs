using BeautyBooking.Entities;
using BeautyBooking.Helper;

namespace BeautyBooking.DTO.Response
{
    public class AppointmentResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? StaffId { get; set; }
        public int WardId { get; set; }
        public string? UserName { get; set; }
        public string? StaffName { get; set; }
        public string? WardName { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public int StartTime { get; set; }
        public int EndTime { get; set; }
        public string TimeRange => TimeHelper.FormatToTimeRange(StartTime, EndTime);
        public AppointmentStatus AppointmentStatus { get; set; }
        public decimal TotalPrice { get; set; }
        public List<AppointmentServiceResponse> AppointmentServices { get; set; } = new();
    }
}
