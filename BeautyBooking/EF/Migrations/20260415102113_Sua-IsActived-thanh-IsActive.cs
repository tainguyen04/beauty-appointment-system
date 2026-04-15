using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class SuaIsActivedthanhIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "is_actived",
                table: "work_schedules",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "is_actived",
                table: "users",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "is_actived",
                table: "staff_profiles",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "is_actived",
                table: "staff_day_offs",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "is_actived",
                table: "services",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "is_actived",
                table: "categories",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "is_actived",
                table: "appointments",
                newName: "is_active");

            migrationBuilder.RenameColumn(
                name: "is_actived",
                table: "appointment_services",
                newName: "is_active");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "work_schedules",
                newName: "is_actived");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "users",
                newName: "is_actived");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "staff_profiles",
                newName: "is_actived");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "staff_day_offs",
                newName: "is_actived");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "services",
                newName: "is_actived");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "categories",
                newName: "is_actived");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "appointments",
                newName: "is_actived");

            migrationBuilder.RenameColumn(
                name: "is_active",
                table: "appointment_services",
                newName: "is_actived");
        }
    }
}
