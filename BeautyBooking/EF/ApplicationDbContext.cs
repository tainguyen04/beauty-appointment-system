using BeautyBooking.Entities;
using Microsoft.EntityFrameworkCore;

namespace BeautyBooking.EF
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
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


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}
