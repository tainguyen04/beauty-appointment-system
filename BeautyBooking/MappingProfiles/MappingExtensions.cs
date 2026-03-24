using AutoMapper;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public static class MappingExtensions
    {
        public static IMappingExpression<TSource, TDestination> IgnoreAuditFields<TSource, TDestination>(
            this IMappingExpression<TSource, TDestination> mapping)
            where TDestination : BaseEntity
        {
            return mapping
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore());
        }
    }
}
