using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class CategoryProfile: Profile
    {
        public CategoryProfile()
        {
            CreateMap<Category, CategoryResponse>();
            CreateMap<CategoryRequest, Category>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.Services, opt => opt.Ignore());

            CreateMap<CategoryRequest, Category>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.Services, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
