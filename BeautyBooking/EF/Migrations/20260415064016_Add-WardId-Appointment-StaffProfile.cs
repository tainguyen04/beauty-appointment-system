using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class AddWardIdAppointmentStaffProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_appointments_staff_profiles_staff_id",
                table: "appointments");

            migrationBuilder.AddColumn<int>(
                name: "ward_id",
                table: "staff_profiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ward_id",
                table: "appointments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "ix_staff_profiles_ward_id",
                table: "staff_profiles",
                column: "ward_id");

            migrationBuilder.CreateIndex(
                name: "ix_appointments_ward_id",
                table: "appointments",
                column: "ward_id");

            migrationBuilder.AddForeignKey(
                name: "fk_appointments_staff_profiles_staff_id",
                table: "appointments",
                column: "staff_id",
                principalTable: "staff_profiles",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_appointments_website_localization_wards_ward_id",
                table: "appointments",
                column: "ward_id",
                principalTable: "website_localization_wards",
                principalColumn: "ward_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_staff_profiles_website_localization_wards_ward_id",
                table: "staff_profiles",
                column: "ward_id",
                principalTable: "website_localization_wards",
                principalColumn: "ward_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_appointments_staff_profiles_staff_id",
                table: "appointments");

            migrationBuilder.DropForeignKey(
                name: "fk_appointments_website_localization_wards_ward_id",
                table: "appointments");

            migrationBuilder.DropForeignKey(
                name: "fk_staff_profiles_website_localization_wards_ward_id",
                table: "staff_profiles");

            migrationBuilder.DropIndex(
                name: "ix_staff_profiles_ward_id",
                table: "staff_profiles");

            migrationBuilder.DropIndex(
                name: "ix_appointments_ward_id",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "ward_id",
                table: "staff_profiles");

            migrationBuilder.DropColumn(
                name: "ward_id",
                table: "appointments");

            migrationBuilder.AddForeignKey(
                name: "fk_appointments_staff_profiles_staff_id",
                table: "appointments",
                column: "staff_id",
                principalTable: "staff_profiles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
