using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using System.Globalization;

namespace BeautyBooking.MappingProfiles
{
    public class StaffMappingProfile: Profile
    {
        public StaffMappingProfile()
        {
            CreateMap<CreateStaffProfileRequest, StaffProfile>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.Services, opt => opt.Ignore())
                .ForMember(dest => dest.User.AvatarUrl, opt => opt.Ignore());
            CreateMap<UpdateStaffProfileRequest, StaffProfile>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.Services, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User.AvatarUrl, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<StaffProfile, StaffProfileResponse>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.ServiceNames, opt => opt.MapFrom(src => src.Services.Select(s => s.Name)))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.User.AvatarUrl));

        }
    }
}
