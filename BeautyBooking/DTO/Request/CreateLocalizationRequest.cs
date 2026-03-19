namespace BeautyBooking.DTO.Request
{
    public class CreateLocalizationRequest
    {
        public string KeyLocalization { get; set; } = null!;
        public string Localization { get; set; } = null!;
        public bool IsActived { get; set; } = true;
        public List<CreateWardRequest> Wards { get; set; } = new();
    }
}
