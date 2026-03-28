using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Response
{
    public class StaffDayOffResponse
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string? StaffName { get; set; }
        public DateOnly Date { get; set; }
        public string? Reason { get; set; }
        public StaffDayOffStatus Status { get; set; }
    }
}
