using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Mapper for Localization
            CreateMap<CreateLocalizationRequest,WebsiteLocalization>()
                .ForMember(dest => dest.WebsiteLocalizationWards,
                    opt => opt.MapFrom(src => src.Wards)); 
            CreateMap<WebsiteLocalization, LocalizationResponse>()
                .ForMember(dest => dest.Wards,
                    opt => opt.MapFrom(src => src.WebsiteLocalizationWards));
            CreateMap<UpdateLocalizationRequest,WebsiteLocalization>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Mapper for Ward
            CreateMap<CreateWardRequest, WebsiteLocalizationWard>();
            CreateMap<WebsiteLocalizationWard, WardResponse>();

            // Mapper for HelpdeskCatalog
            CreateMap<CreateCatalogRequest, HelpdeskCatalog>()
                .ForMember(dest => dest.HelpdeskContents, opt => opt.MapFrom(src => 
                    src.Contents.Select(detail => new HelpdeskContent {ContentDetail = detail })));
            CreateMap<HelpdeskCatalog, HelpdeskCatalogResponse>()
                .ForMember(dest => dest.Contents,opt => opt.MapFrom(src => 
                    src.HelpdeskContents));
            CreateMap<UpdateCatalogRequest, HelpdeskCatalog>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            // Mapper for HelpdeskContent
            CreateMap<HelpdeskContent, HelpdeskContentResponse>();
        }
    }
}
