using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class AuthProfile: Profile
    {
        public AuthProfile()
        {
            CreateMap<LoginRequest, User>();
            CreateMap<User, LoginResponse>();
        }
    }
}
