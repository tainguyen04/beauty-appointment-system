using BeautyBooking.EF;
using BeautyBooking.Infrastructure;
using BeautyBooking.MappingProfiles;
using Microsoft.EntityFrameworkCore;
using BeautyBooking.Services;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using BeautyBooking.Entities;
using Microsoft.Identity.Client;
using System.Security.Principal;
using CloudinaryDotNet;
using BeautyBooking.Interface.Repository;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.JsonWebTokens;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpContextAccessor();
//Connect to DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString).UseSnakeCaseNamingConvention()
);
// DbContext infrastructure layer uses ApplicationDbContext, so we need to register it as well
builder.Services.AddScoped<DbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
//AutoMapper
builder.Services.AddAutoMapper(cfg => cfg.AddMaps(typeof(UserProfile).Assembly));

// Add services to the container.
builder.Services.AddScoped(typeof(IRepository<,>),typeof(Repository<,>));
// Scan repositories in Repository layer
builder.Services.Scan(scan => scan
    .FromAssembliesOf(typeof(Program))
    .AddClasses(classes => classes.InNamespaces("BeautyBooking.Repository"))
        .AsImplementedInterfaces()
        .WithScopedLifetime()
);
// Scan services in Service layer
builder.Services.Scan(scan => scan
    .FromAssembliesOf(typeof(Program))
    .AddClasses(classes => classes.InNamespaces("BeautyBooking.Services"))
        .AsImplementedInterfaces()
        .WithScopedLifetime()
);

builder.Services.AddControllers()
    .AddJsonOptions(option =>
    {
        option.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtOptions>();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var key = Encoding.UTF8.GetBytes(jwtSettings.Key);
var securityKey = new SymmetricSecurityKey(key);
builder.Services.AddSingleton(securityKey);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(option =>
    {
        option.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = securityKey,

            ClockSkew = TimeSpan.Zero
        };
    }
);
builder.Services.AddAuthorization(option =>
{
    option.AddPolicy("AdminOnly", policy => policy.RequireRole(nameof(UserRole.Admin)));
    option.AddPolicy("StaffOnly", policy => policy.RequireRole(nameof(UserRole.Staff)));
    option.AddPolicy("CustomerOnly", policy => policy.RequireRole(nameof(UserRole.Customer)));
    option.AddPolicy("StaffOrAdmin", policy => policy.RequireRole(nameof(UserRole.Staff), nameof(UserRole.Admin)));
    option.AddPolicy("CustomerOrAdmin", policy => policy.RequireRole(nameof(UserRole.Customer), nameof(UserRole.Admin)));
});
builder.Services.AddSingleton(sp =>
{
    var cloudinarySettings = builder.Configuration.GetSection("CloudinarySettings").Get<CloudinarySettings>()!;
    var account = new Account(cloudinarySettings.CloudName, cloudinarySettings.ApiKey, cloudinarySettings.ApiSecret);
    return new Cloudinary(account);
});

builder.Services.AddSingleton(sp =>
{
    var settings = builder.Configuration.GetSection("AvatarDefaultSettings").Get<AvatarDefaultSettings>()!;
    return settings;
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "365 AI Beauty API", Version = "v1" });

    // 1. Định nghĩa chuẩn bảo mật JWT cho Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập Token của bạn vào đây"
    });

    // 2. Áp dụng bảo mật này cho tất cả các Request trên giao diện Swagger
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFE",
        policy => policy
            .WithOrigins("https://beauty-appointment-system-ui.onrender.com", 
            "http://localhost:5173", "https://beauty-booking-7gd4.onrender.com") // FE của bạn
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

app.UseHttpsRedirection();
app.UseCors("AllowFE");
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
