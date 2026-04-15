namespace BeautyBooking.DTO.Filter
{
    public class StaffProfileFilter : BaseFilter
    {
        public string? Keyword { get; set; }
        public int? WardId { get; set; }
        public int? ServiceId { get; set; }
    }
}
