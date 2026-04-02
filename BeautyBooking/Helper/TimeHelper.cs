namespace BeautyBooking.Helper
{
    public static class TimeHelper
    {
        //Chuyển đổi DateTime sang phút để dễ dàng tính toán
        public static int ToMinutes(DateTime dt) => dt.Hour * 60 + dt.Minute;
        public static string FormatMinutesToTime(int minutes)
        {
            int hours = minutes / 60;
            int mins = minutes % 60;
            return $"{hours:D2}:{mins:D2}";
        }

        // Chuyen đổi khoảng thời gian từ phút sang chuỗi định dạng HH:mm - HH:mm
        public static string FormatToTimeRange(int start, int end)
        {
            string startTime = FormatMinutesToTime(start);
            string endTime = FormatMinutesToTime(end);
            return $"{startTime} - {endTime}";
        }
    }
}
