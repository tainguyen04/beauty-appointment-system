using BeautyBooking.EF;
using BeautyBooking.Infrastructure;
using BeautyBooking.MappingProfiles;
using Microsoft.EntityFrameworkCore;
using BeautyBooking.Services;

var builder = WebApplication.CreateBuilder(args);
//Connect to DB
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString).UseSnakeCaseNamingConvention()
);
// DbContext infrastructure layer uses ApplicationDbContext, so we need to register it as well
builder.Services.AddScoped<DbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
//AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<MappingProfile>();
});

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

builder.Services.AddControllers();
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
