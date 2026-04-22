using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.Interface.Service;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace BeautyBooking.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;
        private readonly IRefreshTokenRepository _tokenRepository;
        private readonly AvatarDefaultSettings _avatarSettings;
        private readonly JwtOptions _jwtOptions;
        private readonly SymmetricSecurityKey _securityKey;

        public AuthService(IUserRepository userRepo, IMapper mapper, IOptions<JwtOptions> jwtOptions, 
            SymmetricSecurityKey securityKey, AvatarDefaultSettings avatarSettings, IRefreshTokenRepository tokenRepository)
        {
            _userRepo = userRepo;
            _mapper = mapper;
            _jwtOptions = jwtOptions.Value;
            _securityKey = securityKey;
            _avatarSettings = avatarSettings;
            _tokenRepository = tokenRepository;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepo.GetByEmailAsync(request.Email);
            if (user == null || user.IsDeleted || !user.IsActive)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return null;

            var tokenString = GenerateToken(user);
            var refreshTokenString = GenerateRefreshToken();
            var refreshEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshTokenString,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
            };
            await _tokenRepository.CreateAsync(refreshEntity);
            await _tokenRepository.SaveChangesAsync();
            var userResponse = _mapper.Map<UserResponse>(user);

            return new LoginResponse
            {
                User = userResponse,
                AccessToken = tokenString,
                RefreshToken = refreshTokenString,
            };
        }

        public async Task<UserResponse> RegisterAsync(RegisterRequest request)
        {
            // 1. Check if email is unique
            if (!await _userRepo.IsEmailUniqueAsync(request.Email))
                throw new InvalidOperationException("Email đã được sử dụng.");

            // 2. Map request to User entity
            var user = _mapper.Map<User>(request);
            string avatarUrl = _avatarSettings.DefaultAvatarUrl;
            string safeName = Uri.EscapeDataString(user.FullName);
            user.AvatarUrl = string.Format(avatarUrl,safeName);
            user.AvatarPublicId = null;
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
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            if(user.StaffProfile != null)
            {
                claims.Add(new Claim("staffId", user.StaffProfile.Id.ToString()));
            }
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
        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<bool> LogoutAsync(string refreshToken)
        {
            var storedToken = await _tokenRepository.GetByTokenAsync(refreshToken);
            if(storedToken == null)
                return false;
            storedToken.IsRevoked = true;
            await _tokenRepository.SaveChangesAsync();
            return true;
        }

        public async Task<LoginResponse?> RefreshtokenAsync(string refreshToken)
        {
            var storedToken = await _tokenRepository.GetByTokenAsync(refreshToken);
            if(storedToken == null || storedToken.IsRevoked || storedToken.ExpiryDate < DateTime.UtcNow)
                return null;
            var user = await _userRepo.GetByIdAsync(storedToken.UserId);
            if(user == null || !user.IsActive)
                return null;
            storedToken.IsRevoked = true;
            await _tokenRepository.SaveChangesAsync();
            var newAccessToken = GenerateToken(user);
            var newRefreshToken = GenerateRefreshToken();
            var RefreshEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
            };
            await _tokenRepository.CreateAsync(RefreshEntity);
            await _tokenRepository.SaveChangesAsync();
            return new LoginResponse
            {
                User = _mapper.Map<UserResponse>(user),
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            };
        }
    }
}
