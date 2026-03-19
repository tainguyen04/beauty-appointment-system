namespace BeautyBooking.DTO.Request
{
    public class UpdateWardRequest
    {
        public int? WardId { get; set; }
        public string? Name { get; set; } 
        public string? NameEn { get; set; } 
        public string? FullName { get; set; }
        public string? FullNameEn { get; set; } 
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
