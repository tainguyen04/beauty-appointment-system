namespace BeautyBooking.Entities
{
    public class Category: BaseEntity
    {
        public string Name { get; set; } = null!;
        public ICollection<Service> Services { get; set; } = new List<Service>();
    }
}
