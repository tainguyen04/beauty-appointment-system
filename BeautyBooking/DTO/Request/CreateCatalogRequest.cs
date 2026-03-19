namespace BeautyBooking.DTO.Request
{
    public class CreateCatalogRequest
    {
        public string KeyCatalog { get; set; } = null!;
        public string NameVn { get; set; } = null!;
        public string? Url { get; set; }
        public bool IsActived { get; set; }

        // Danh sách các Content đi kèm
        public List<string> Contents { get; set; } = new();
    }
}
