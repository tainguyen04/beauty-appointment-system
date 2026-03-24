using BeautyBooking.EF;
using BeautyBooking.Infrastructure;
using BeautyBooking.MappingProfiles;
using Microsoft.EntityFrameworkCore;
using BeautyBooking.Services;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

// With this line:
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

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
