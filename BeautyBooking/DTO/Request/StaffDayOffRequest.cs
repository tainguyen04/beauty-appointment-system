namespace BeautyBooking.DTO.Request
{
    public class StaffDayOffRequest
    {
        public int StaffId { get; set; }
        public DateOnly Date { get; set; }
        public string? Reason { get; set; }
    }
}
