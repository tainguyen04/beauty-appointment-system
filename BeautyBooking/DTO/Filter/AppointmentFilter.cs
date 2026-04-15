using BeautyBooking.Entities;

namespace BeautyBooking.DTO.Filter
{
    public class AppointmentFilter: BaseFilter
    {
        public int? UserId { get; set; }
        public int? StaffId { get; set; }
        public int? WardId { get; set; }
        public string? Keyword { get; set; }
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
        public AppointmentStatus? Status { get; set; }
    }
}
