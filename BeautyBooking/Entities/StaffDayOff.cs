namespace BeautyBooking.Entities
{
    public class StaffDayOff : BaseEntity
    {
        public int StaffId { get; set; }
        public DateTime Date { get; set; }
        public string Reason { get; set; } = null!;
        public StaffProfile Staff { get; set; }
    }
}
