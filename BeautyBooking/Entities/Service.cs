namespace BeautyBooking.Entities
{
    public class Service : BaseEntity
    {
        public int CategoryId { get; set; }

        public string Name { get; set; }

        public decimal Price { get; set; }

        public int Duration { get; set; }

        public string? ImageUrl { get; set; }
        public Category Category { get; set; } = null!;
        public ICollection<AppointmentService> AppointmentServices { get; set; } = new List<AppointmentService>();
        public ICollection<StaffProfile> StaffProfiles { get; set; } = new List<StaffProfile>();
    }
}
