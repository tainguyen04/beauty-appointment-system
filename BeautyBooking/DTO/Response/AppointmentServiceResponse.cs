namespace BeautyBooking.DTO.Response
{
    public class AppointmentServiceResponse
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal PriceAtBooking { get; set; }
        public int DurationAtBooking { get; set; }
    }
}
