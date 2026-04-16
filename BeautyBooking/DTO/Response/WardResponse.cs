namespace BeautyBooking.DTO.Response
{
    public class WardResponse
    {
        public int WardId { get; set; }
        public int WardPid { get; set; }
        public string Name { get; set; } = null!;
        public string NameEn { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string FullNameEn { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool IsActived { get; set; }
    }
}
