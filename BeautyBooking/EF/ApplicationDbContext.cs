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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}
