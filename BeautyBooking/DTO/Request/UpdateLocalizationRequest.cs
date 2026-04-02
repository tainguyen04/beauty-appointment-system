namespace BeautyBooking.DTO.Request
{
    public class UpdateLocalizationRequest
    {
        public string Localization { get; set; } = null!;
        public bool IsActived { get; set; } = true;
    }
}
