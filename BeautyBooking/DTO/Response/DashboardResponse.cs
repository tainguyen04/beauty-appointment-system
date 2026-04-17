using BeautyBooking.Entities;
using BeautyBooking.Helper;

namespace BeautyBooking.DTO.Response
{
    public class DashboardResponse
    {
        public int NewCustomers { get; set; }
        public int todayAppointments { get; set; }
        public decimal todayRevenue { get; set; }
    }
    public class DashboardAppointmentResponse
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string StaffName { get; set; }
        public List<string> ServicesName { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public int StartTime { get; set; }
        public int EndTime { get; set; }
        public string TimeRange => TimeHelper.FormatToTimeRange(StartTime, EndTime);
        public AppointmentStatus Status { get; set; }
    }
}
