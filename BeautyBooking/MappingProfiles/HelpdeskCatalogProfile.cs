using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class HelpdeskCatalogProfile : Profile
    {
        public HelpdeskCatalogProfile()
        {
            // Mapper for HelpdeskCatalog
            CreateMap<CreateCatalogRequest, HelpdeskCatalog>()
                .ForMember(dest => dest.HelpdeskContents, opt => opt.Ignore());
            CreateMap<HelpdeskCatalog, HelpdeskCatalogResponse>()
                .ForMember(dest => dest.Contents, opt => opt.MapFrom(src =>
                    src.HelpdeskContents));
            CreateMap<UpdateCatalogRequest, HelpdeskCatalog>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            // Mapper for HelpdeskContent
            CreateMap<HelpdeskContent, HelpdeskContentResponse>();
            CreateMap<CreateContentRequest, HelpdeskContent>()
                .ForMember(dest => dest.CatalogId, opt => opt.Ignore());
        }
    }
}
