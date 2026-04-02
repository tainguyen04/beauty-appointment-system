namespace BeautyBooking.DTO.Response
{
    public class WorkScheduleResponse
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string? StaffName { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public int StartTime { get; set; }
        public int EndTime { get; set; }
    }
}
