using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class StaffDayOffProfile: Profile
    {
        public StaffDayOffProfile()
        {
            CreateMap<StaffDayOff, StaffDayOffResponse>()
                .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff.User.FullName));
            CreateMap<StaffDayOffRequest, StaffDayOff>()
                .ForMember(dest => dest.Status, opt => opt.Ignore());
        }
    }
}
