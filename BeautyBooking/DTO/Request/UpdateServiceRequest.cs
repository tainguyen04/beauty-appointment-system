namespace BeautyBooking.DTO.Request
{
    public class UpdateServiceRequest
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int Duration { get; set; }
        public string ImageUrl { get; set; }
    }
}
