namespace BeautyBooking.DTO.Filter
{
    public class ServiceFilter : BaseFilter
    {
        public string? Keyword { get; set; }
        public int? CategoryId { get; set; }
    }
}
