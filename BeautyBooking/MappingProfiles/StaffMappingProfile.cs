using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class StaffMappingProfile: Profile
    {
        public StaffMappingProfile()
        {
            CreateMap<StaffProfileRequest, StaffProfile>()
                .ForMember(dest => dest.Services, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
            
            CreateMap<StaffProfile, StaffProfileResponse>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.ServiceNames, opt => opt.MapFrom(src => src.Services.Select(s => s.Name)));

        }
    }
}
