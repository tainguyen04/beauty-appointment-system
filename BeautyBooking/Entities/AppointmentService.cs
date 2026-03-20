namespace BeautyBooking.Entities
{
    public class AppointmentService : BaseEntity
    {
        public int AppointmentId { get; set; }
        public int ServiceId { get; set; }
        public decimal PriceAtBooking { get; set; }
        public int DurationAtBooking { get; set; }
        public Appointment Appointment { get; set; } = null!;
        public Service Service { get; set; } = null!;

    }
}
