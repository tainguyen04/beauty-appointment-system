namespace BeautyBooking.DTO.Request
{
    public class UpdateWorkScheduleRequest
    {
        public DayOfWeek DayOfWeek { get; set; }
        public int StartTime { get; set; }
        public int EndTime { get; set; }
    }
}
