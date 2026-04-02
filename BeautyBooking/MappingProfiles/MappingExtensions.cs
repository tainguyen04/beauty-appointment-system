using AutoMapper;
using BeautyBooking.DTO.Response;
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

        public static PagedResult<TDestination> ToPagedResult<TSource, TDestination>(
            this PagedResult<TSource> source, IMapper mapper)
        {
            var mappedItems = mapper.Map<IEnumerable<TDestination>>(source.Items);
            return new PagedResult<TDestination>(mappedItems, source.TotalCount, source.PageSize, source.CurrentPage);
        }
    }
}
