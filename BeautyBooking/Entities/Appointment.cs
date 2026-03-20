namespace BeautyBooking.Entities
{
    public class Appointment : BaseEntity
    {
        public int UserId { get; set; }
        public int StaffId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public int StartTime { get; set; }
        public int EndTime { get; set; }
        public AppointmentStatus AppointmentStatus { get; set; } = AppointmentStatus.Pending;
        public decimal TotalPrice { get; set; }
        public User User { get; set; }
        public StaffProfile Staff { get; set; }
        public ICollection<AppointmentService> AppointmentServices { get; set; } = new List<AppointmentService>();

    }
    public enum AppointmentStatus
    {
        Pending,
        Completed,
        Confirmed,
        Cancelled
    }
}
