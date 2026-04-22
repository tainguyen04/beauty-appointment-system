using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.EF
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IHttpContextAccessor httpContextAccessor) 
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public DbSet<WebsiteLocalization> WebsiteLocalizations { get; set; }
        public DbSet<WebsiteLocalizationWard> WebsiteLocalizationWards { get; set; }
        public DbSet<HelpdeskCatalog> HelpdeskCatalogs { get; set; }
        public DbSet<HelpdeskContent> HelpdeskContents { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<StaffProfile> StaffProfiles { get; set; }
        public DbSet<StaffDayOff> StaffDayOffs { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<AppointmentService> AppointmentServices { get; set; }
        public DbSet<WorkSchedule> WorkSchedules { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));
            foreach (var entry in entries)
            {
                var entity = (BaseEntity)entry.Entity;
                var now = DateTime.UtcNow;
                if (entry.State == EntityState.Added)
                {
                    entity.CreatedAt = now;
                    entity.CreatedBy = _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "System";
                }
                else
                {
                    entry.Property(nameof(BaseEntity.CreatedAt)).IsModified = false;
                    entity.UpdatedAt = now;
                    entity.UpdatedBy = _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "System";
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}
