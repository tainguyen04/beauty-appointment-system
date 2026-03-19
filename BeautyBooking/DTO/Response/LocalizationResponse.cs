namespace BeautyBooking.DTO.Response
{
    public class LocalizationResponse
    {
        public string KeyLocalization { get; set; } = null!;
        public string Localization { get; set; } = null!;
        public bool IsActived { get; set; } = true;
        public List<WardResponse> Wards { get; set; } = new();
    }
}
