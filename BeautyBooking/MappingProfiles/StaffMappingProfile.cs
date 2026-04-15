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
                .ForMember(dest => dest.User, opt => opt.Ignore());
            CreateMap<UpdateStaffProfileRequest, StaffProfile>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.Services, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.WardId, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<StaffProfile, StaffProfileResponse>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.Services, opt => opt.MapFrom(src => src.Services))
                .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.User.AvatarUrl))
                .ForMember(dest => dest.WardName, opt => opt.MapFrom(src => src.Ward != null ? src.Ward.FullName : null));

        }
    }
}
