using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using BeautyBooking.AI.Configuration;
using BeautyBooking.AI.Factories;
using BeautyBooking.AI.Interfaces;
using BeautyBooking.AI.Prompt;
using BeautyBooking.AI.Providers;
using BeautyBooking.AI.Tools;
using BeautyBooking.EF;
using BeautyBooking.Entities;
using BeautyBooking.Infrastructure;
using BeautyBooking.Interface.Repository;
using BeautyBooking.MappingProfiles;
using BeautyBooking.Services;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpContextAccessor();

//Connect to DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString).UseSnakeCaseNamingConvention()
);

// DbContext infrastructure layer uses ApplicationDbContext, so we need to register it as well
builder.Services.AddScoped<DbContext>(provider =>
    provider.GetRequiredService<ApplicationDbContext>()
);

//AutoMapper
builder.Services.AddAutoMapper(cfg => cfg.AddMaps(typeof(UserProfile).Assembly));

// Add services to the container.
builder.Services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));

// Scan repositories in Repository layer
builder.Services.Scan(scan =>
    scan.FromAssembliesOf(typeof(Program))
        .AddClasses(classes => classes.InNamespaces("BeautyBooking.Repository"))
        .AsImplementedInterfaces()
        .WithScopedLifetime()
);

// Scan services in Service layer
builder.Services.Scan(scan =>
    scan.FromAssembliesOf(typeof(Program))
        .AddClasses(classes => classes.InNamespaces("BeautyBooking.Services"))
        .AsImplementedInterfaces()
        .WithScopedLifetime()
);

//Scan services in AI layer
builder.Services.Scan(scan =>
    scan.FromAssembliesOf(typeof(Program))
        .AddClasses(classes => classes.InNamespaces("BeautyBooking.AI.Services"))
        .AsImplementedInterfaces()
        .WithScopedLifetime()
);

//Scan tools in AI layer
builder.Services.Scan(scan =>
    scan.FromAssembliesOf(typeof(Program))
        .AddClasses(classes => classes.AssignableTo<ITool>())
        .AsImplementedInterfaces()
        .WithScopedLifetime()
);

//Scan prompt templates in AI layer
builder.Services.Scan(scan =>
    scan.FromAssembliesOf(typeof(Program))
        .AddClasses(classes => classes.AssignableTo<IPromptTemplate>())
        .AsImplementedInterfaces()
        .WithScopedLifetime()
);
builder.Services.AddScoped<IToolRegistry, ToolRegistry>();
builder.Services.AddScoped<ToolExecutor>();

//Scan providers in AI layer
// builder.Services.Scan(scan =>
//     scan.FromAssembliesOf(typeof(Program))
//         .AddClasses(c => c.AssignableTo<IAIProvider>())
//         .AsImplementedInterfaces()
//         .WithScopedLifetime()
// );
builder.Services.AddHttpClient<OpenAIProvider>(provider =>
{
    provider.BaseAddress = new Uri("https://api.openai.com/v1/");
});
builder.Services.AddHttpClient<OllamaProvider>(provider =>
{
    var olalmaBaseUrl =
        builder.Configuration["Ollama:BaseUrl"]
        ?? throw new InvalidOperationException("Ollama base URL is not configured.");
    provider.BaseAddress = new Uri(olalmaBaseUrl);
});

// Register the AIProviderFactory
builder.Services.AddScoped<IAIProviderFactory, AIProviderFactory>();
builder
    .Services.AddControllers()
    .AddJsonOptions(option =>
    {
        option.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddSingleton(
    new JsonSerializerOptions
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    }
);

builder.Services.Configure<ContextWindowOptions>(
    builder.Configuration.GetSection("AI:ContextWindow")
);

builder.Services.Configure<AIOptions>(builder.Configuration.GetSection("AI"));

builder.Services.Configure<OpenAIOptions>(builder.Configuration.GetSection("OpenAI"));

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();

var key = Encoding.UTF8.GetBytes(jwtSettings.Key);
var securityKey = new SymmetricSecurityKey(key);
builder.Services.AddSingleton(securityKey);
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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

            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role,
        };
    });
builder.Services.AddAuthorization(option =>
{
    option.AddPolicy("AdminOnly", policy => policy.RequireRole(nameof(UserRole.Admin)));
    option.AddPolicy("StaffOnly", policy => policy.RequireRole(nameof(UserRole.Staff)));
    option.AddPolicy("CustomerOnly", policy => policy.RequireRole(nameof(UserRole.Customer)));
    option.AddPolicy(
        "StaffOrAdmin",
        policy => policy.RequireRole(nameof(UserRole.Staff), nameof(UserRole.Admin))
    );
    option.AddPolicy(
        "CustomerOrAdmin",
        policy => policy.RequireRole(nameof(UserRole.Customer), nameof(UserRole.Admin))
    );
});
builder.Services.AddSingleton(sp =>
{
    var cloudinarySettings = new CloudinarySettings();
    builder.Configuration.GetSection("CloudinarySettings").Bind(cloudinarySettings);
    var account = new Account(
        cloudinarySettings.CloudName,
        cloudinarySettings.ApiKey,
        cloudinarySettings.ApiSecret
    );
    return new Cloudinary(account);
});

builder.Services.AddSingleton(sp =>
{
    var settings = new AvatarDefaultSettings();
    builder.Configuration.GetSection("AvatarDefaultSettings").Bind(settings);
    return settings;
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "365 AI Beauty API", Version = "v1" });

    // 1. Định nghĩa chuẩn bảo mật JWT cho Swagger
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Nhập Token của bạn vào đây",
        }
    );

    // 2. Áp dụng bảo mật này cho tất cả các Request trên giao diện Swagger
    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                new string[] { }
            },
        }
    );
});
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowFE",
        policy =>
            policy
                .WithOrigins(
                    "https://beauty-appointment-system-ui.onrender.com",
                    "http://localhost:5173",
                    "https://beauty-booking-7gd4.onrender.com"
                ) // FE của bạn
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
