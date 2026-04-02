namespace BeautyBooking.DTO.Request
{
    public class CreateWorkScheduleRequest
    {
        public int StaffId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public int StartTime { get; set; }
        public int EndTime { get; set; }
    }
}
