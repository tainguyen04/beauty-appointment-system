namespace BeautyBooking.DTO.Filter
{
    public class WorkScheduleFilter : BaseFilter
    {
        public string? Keyword { get; set; }
        public DayOfWeek? Date { get; set; }
    }
}
