using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class LocalizationProfile: Profile
    {
        public LocalizationProfile() 
        {
            // Mapper for Localization
            CreateMap<CreateLocalizationRequest, WebsiteLocalization>()
                .ForMember(dest => dest.WebsiteLocalizationWards,
                    opt => opt.MapFrom(src => src.Wards));
            CreateMap<WebsiteLocalization, LocalizationResponse>()
                .ForMember(dest => dest.Wards,
                    opt => opt.MapFrom(src => src.WebsiteLocalizationWards));
            CreateMap<UpdateLocalizationRequest, WebsiteLocalization>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Mapper for Ward
            CreateMap<WebsiteLocalizationWard, WardResponse>();

            CreateMap<CreateLocalizationRequest, LocalizationResponse>();
        }
    }
}
