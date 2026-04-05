using BeautyBooking.Entities;
using BeautyBooking.Interface.Service;
using System.Security.Claims;

namespace BeautyBooking.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public int? UserId
        {
            get
            {
                var userIdClaim = _httpContextAccessor.HttpContext?
                    .User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (int.TryParse(userIdClaim, out var userId))
                {
                    return userId;
                }
                return null;
            }
        }

        public string Email
        {
            get
            {
                var emailClaim = _httpContextAccessor.HttpContext?
                    .User.FindFirstValue(ClaimTypes.Email);
                if (emailClaim != null)
                {
                    return emailClaim;
                }
                throw new UnauthorizedAccessException();
            }
        }

        public UserRole Role
        {
            get
            {
                var roleClaim = _httpContextAccessor.HttpContext?
                    .User.FindFirstValue(ClaimTypes.Role);
                if (roleClaim != null && Enum.TryParse<UserRole>(roleClaim, out var role))
                {
                    return role;
                }
                throw new UnauthorizedAccessException();
            }
        }
        public int? StaffId
        {
            get
            {
                var staffIdClaim = _httpContextAccessor.HttpContext?
                    .User.FindFirstValue("staffId");
                if (staffIdClaim != null && int.TryParse(staffIdClaim, out var staffId))
                {
                    return staffId;
                }
                return null;
            }
        }
    }
}
