namespace BeautyBooking.DTO.Request
{
    public class UpdateAppointmentRequest
    {
        public int UserId { get; set; }
        public int StaffId { get; set; }
        public DateOnly? AppointmentDate { get; set; }
        public int StartTime { get; set; } // Số phút từ 00:00
        public List<int> ServiceIds { get; set; } = new();
    }
}
