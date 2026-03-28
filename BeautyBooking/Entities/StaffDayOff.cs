namespace BeautyBooking.Entities
{
    public class StaffDayOff : BaseEntity
    {
        public int StaffId { get; set; }
        public DateOnly Date { get; set; }
        public string Reason { get; set; } = null!;
        public StaffDayOffStatus Status { get; set; } = StaffDayOffStatus.Pending;
        public StaffProfile Staff { get; set; }
    }
    public enum StaffDayOffStatus
    {
        Pending,
        Approved,
        Rejected
    }
}
