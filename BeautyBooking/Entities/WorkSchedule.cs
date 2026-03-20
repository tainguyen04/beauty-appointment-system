namespace BeautyBooking.Entities
{
    public class WorkSchedule : BaseEntity
    {
        public int StaffId { get; set; }
        public int DayOfWeek { get; set; } // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        public int StartTime { get; set; } // Time in minutes from midnight (e.g., 540 for 9:00 AM)
        public int EndTime { get; set; } // Time in minutes from midnight (e.g., 1020 for 5:00 PM)
        public StaffProfile Staff { get; set; } 
    }
}
