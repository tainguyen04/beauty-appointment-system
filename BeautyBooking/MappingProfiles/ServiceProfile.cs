using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class ServiceProfile: Profile
    {
        public ServiceProfile() 
        {
            CreateMap<CreateServiceRequest, Service>()
                .IgnoreAuditFields();

            CreateMap<UpdateServiceRequest, Service>()
                .IgnoreAuditFields()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Service, ServiceResponse>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));

        }
    }
}
