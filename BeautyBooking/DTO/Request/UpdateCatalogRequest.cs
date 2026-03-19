namespace BeautyBooking.DTO.Request
{
    public class UpdateCatalogRequest
    {
        public string? KeyCatalog { get; set; }
        public string? NameVn { get; set; }
        public string? Url { get; set; }
        public bool? IsActived { get; set; }
        public List<string>? Contents { get; set; }
    }
}
