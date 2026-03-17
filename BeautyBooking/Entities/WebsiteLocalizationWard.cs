using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.CompilerServices;

namespace BeautyBooking.Entities
{
    public class WebsiteLocalizationWard
    {
        
        public int WardId { get; set; }
        public int? WardPid { get; set; }
        
        public string Name { get; set; } = null!;
        
        public string NameEn { get; set; } = null!;
        
        public string FullName { get; set; } = null!;
        
        public string FullNameEn { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
       
        public string KeyLocalization { get; set; } = null!;
        public bool IsActived { get; set; } = true;

        public WebsiteLocalization WebsiteLocalization { get; set; }
    }
}
