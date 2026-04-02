namespace BeautyBooking.Entities
{
    public class StaffProfile : BaseEntity
    {
        public int UserId { get; set; }
        public string Bio { get; set; }
        public User User { get; set; } = null!;
        public ICollection<Service> Services { get; set; } = new List<Service>();
        public ICollection<StaffDayOff> StaffDayOffs { get; set; } = new List<StaffDayOff>();
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
