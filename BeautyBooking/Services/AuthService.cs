using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BeautyBooking.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;
        private readonly JwtOptions _jwtOptions;
        private readonly SymmetricSecurityKey _securityKey;

        public AuthService(IUserRepository userRepo, IMapper mapper, IOptions<JwtOptions> jwtOptions, SymmetricSecurityKey securityKey)
        {
            _userRepo = userRepo;
            _mapper = mapper;
            _jwtOptions = jwtOptions.Value;
            _securityKey = securityKey;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepo.GetByEmailAsync(request.Email);
            if (user == null || user.IsDeleted || !user.IsActived)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            var tokenString = GenerateToken(user);
            var userResponse = _mapper.Map<UserResponse>(user);

            return new LoginResponse
            {
                User = userResponse,
                Token = tokenString
            };
        }

        public async Task<UserResponse> RegisterAsync(CreateUserRequest request)
        {
            // 1. Check if email is unique
            if (!await _userRepo.IsEmailUniqueAsync(request.Email))
                throw new InvalidOperationException("Email đã được sử dụng.");

            // 2. Map request to User entity
            var user = _mapper.Map<User>(request);

            // 3. Hash password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 5. Save user
            await _userRepo.CreateAsync(user);
            await _userRepo.SaveChangesAsync();

            // 6. Map to UserResponse and return
            return _mapper.Map<UserResponse>(user);
        }

        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var credentials = new SigningCredentials(_securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
