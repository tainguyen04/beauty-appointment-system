namespace BeautyBooking.Helper
{
    public static class TimeHelper
    {
        //Chuyển đổi số phút từ 00:00 sang định dạng HH:mm
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
