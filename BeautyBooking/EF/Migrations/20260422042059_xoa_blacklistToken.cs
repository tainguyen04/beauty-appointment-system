using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class xoa_blacklistToken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_refresh_token_users_user_id",
                table: "refresh_token");

            migrationBuilder.DropTable(
                name: "blacklist_tokens");

            migrationBuilder.DropPrimaryKey(
                name: "pk_refresh_token",
                table: "refresh_token");

            migrationBuilder.RenameTable(
                name: "refresh_token",
                newName: "refresh_tokens");

            migrationBuilder.RenameIndex(
                name: "ix_refresh_token_user_id",
                table: "refresh_tokens",
                newName: "ix_refresh_tokens_user_id");

            migrationBuilder.RenameIndex(
                name: "ix_refresh_token_token",
                table: "refresh_tokens",
                newName: "ix_refresh_tokens_token");

            migrationBuilder.AddPrimaryKey(
                name: "pk_refresh_tokens",
                table: "refresh_tokens",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_refresh_tokens_users_user_id",
                table: "refresh_tokens",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_refresh_tokens_users_user_id",
                table: "refresh_tokens");

            migrationBuilder.DropPrimaryKey(
                name: "pk_refresh_tokens",
                table: "refresh_tokens");

            migrationBuilder.RenameTable(
                name: "refresh_tokens",
                newName: "refresh_token");

            migrationBuilder.RenameIndex(
                name: "ix_refresh_tokens_user_id",
                table: "refresh_token",
                newName: "ix_refresh_token_user_id");

            migrationBuilder.RenameIndex(
                name: "ix_refresh_tokens_token",
                table: "refresh_token",
                newName: "ix_refresh_token_token");

            migrationBuilder.AddPrimaryKey(
                name: "pk_refresh_token",
                table: "refresh_token",
                column: "id");

            migrationBuilder.CreateTable(
                name: "blacklist_tokens",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    expiry_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    jti = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_blacklist_tokens", x => x.id);
                });

            migrationBuilder.AddForeignKey(
                name: "fk_refresh_token_users_user_id",
                table: "refresh_token",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
