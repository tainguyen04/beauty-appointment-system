using BeautyBooking.DTO.Response;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.Helper
{
    public static class PagedResultExtensions
    {
        public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
            this IQueryable<T> query, int pageNumber, int pageSize) where T : class
        {
            var count = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => Microsoft.EntityFrameworkCore.EF.Property<int>(x, "Id"))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize).ToListAsync();
            return new PagedResult<T>(items, count, pageSize, pageNumber);
        }
    }
}
