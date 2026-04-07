using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Filter
{
    public class AppointmentFilter: BaseFilter
    {
        public string? Keyword { get; set; }
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
        public AppointmentStatus? Status { get; set; }
    }
}
