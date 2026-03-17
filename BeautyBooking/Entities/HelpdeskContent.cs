namespace BeautyBooking.Entities
{
    public class HelpdeskContent
    {
        public int ContentId { get; set; }
        public string ContentDetail { get; set; }
        public int CatalogId { get; set; }
        
        public HelpdeskCatalog HelpdeskCatalog { get; set; }
    }
}
