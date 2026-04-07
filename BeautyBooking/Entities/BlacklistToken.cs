namespace BeautyBooking.Entities
{
    public class BlacklistToken
    {
        public int Id { get; set; }
        public string Jti { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
    }
}
