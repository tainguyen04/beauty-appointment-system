using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class AddNavigationPropertyAppointmentforStaffProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_appointments_staff_profiles_staff_id",
                table: "appointments");

            migrationBuilder.AddForeignKey(
                name: "fk_appointments_staff_profiles_staff_id",
                table: "appointments",
                column: "staff_id",
                principalTable: "staff_profiles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_appointments_staff_profiles_staff_id",
                table: "appointments");

            migrationBuilder.AddForeignKey(
                name: "fk_appointments_staff_profiles_staff_id",
                table: "appointments",
                column: "staff_id",
                principalTable: "staff_profiles",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
