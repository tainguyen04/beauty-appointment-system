using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BeautyBooking.EF.Migrations
{
    /// <inheritdoc />
    public partial class AddConversationOwnershipAndIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_messages_conversation_id",
                table: "messages");

            migrationBuilder.AddColumn<int>(
                name: "user_id",
                table: "conversations",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_messages_conversation_id_created_at",
                table: "messages",
                columns: new[] { "conversation_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_conversations_user_id_updated_at",
                table: "conversations",
                columns: new[] { "user_id", "updated_at" });

            migrationBuilder.AddForeignKey(
                name: "fk_conversations_users_user_id",
                table: "conversations",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_conversations_users_user_id",
                table: "conversations");

            migrationBuilder.DropIndex(
                name: "ix_messages_conversation_id_created_at",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "ix_conversations_user_id_updated_at",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "conversations");

            migrationBuilder.CreateIndex(
                name: "ix_messages_conversation_id",
                table: "messages",
                column: "conversation_id");
        }
    }
}
