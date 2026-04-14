using System.ComponentModel.DataAnnotations;

namespace BeautyBooking.Entities
{
    public class WebsiteLocalization
    {
        
        public string KeyLocalization { get; set; }
        
        public string Localization { get; set; }  = null!;
        public bool IsActived { get; set; } = true;
        public ICollection<WebsiteLocalizationWard> WebsiteLocalizationWards { get; set; } = new List<WebsiteLocalizationWard>();
    }
}
