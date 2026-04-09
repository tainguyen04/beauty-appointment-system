namespace BeautyBooking.DTO.Request
{
    public class CreateUserRequest
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string ComfirmPassword { get; set; } = null!;
    }
}
