using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
namespace BeautyBooking.MappingProfiles
{
            public class UserProfile : Profile
            {
                public UserProfile()
                {

                    // Map from User entity to UserResponse
                    CreateMap<User, UserResponse>()
                        .ForMember(dest => dest.Ward, opt => opt.MapFrom(src => src.Ward))
                        .ForMember(dest => dest.IsActived, opt => opt.MapFrom(src => !src.IsDeleted))
                        .ForMember(dest => dest.StaffProfileId, opt => opt.MapFrom(src => src.StaffProfile != null ? (int?)src.StaffProfile.Id : null));
                    // Map from CreateUserRequest to User entity
                    CreateMap<CreateUserRequest, User>()
                            .IgnoreAuditFields()
                            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserRole.Customer)) // Default role
                            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                            .ForMember(dest => dest.Ward, opt => opt.Ignore())
                            .ForMember(dest => dest.AvatarUrl, opt => opt.Ignore());

                    // Map from UpdateUserRequest to User entity
                    CreateMap<UpdateUserRequest, User>()
                        .IgnoreAuditFields()
                        .ForMember(dest => dest.Role, opt => opt.Ignore());
                }
            }
    }

