namespace BeautyBooking.Entities
{
    public class HelpdeskCatalog
    {
        public int CatalogId { get; set; }
        public string KeyCatalog { get; set; }
        public string NameVn { get; set; }
        public string url { get; set; }
        public bool IsActived { get; set; }
        public ICollection<HelpdeskContent> HelpdeskContents { get; set; } = new List<HelpdeskContent>();
    }
}
