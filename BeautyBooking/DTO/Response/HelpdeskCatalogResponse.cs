namespace BeautyBooking.DTO.Response
{
    public class HelpdeskCatalogResponse
    {
        public int CatalogId { get; set; }
        public string KeyCatalog { get; set; } = null!;
        public string NameVn { get; set; } = null!;
        public string? Url { get; set; }
        public List<HelpdeskContentResponse> Contents { get; set; } = new();
    }
}
