namespace BeautyBooking.DTO.Filter
{
    public class StaffDayOffFilter : BaseFilter
    {
        public string? Keyword { get; set; }
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
    }
}
