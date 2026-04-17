using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Response
{
    public class DashboardResponse
    {
        public int NewCustomers { get; set; }
        public int ToDayAppointments { get; set; }
        public decimal ToDayRevenue { get; set; }
    }
    public class DashboardAppointmentResponse
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string StaffName { get; set; }
        public List<string> ServicesName { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public AppointmentStatus Status { get; set; }
    }
}
