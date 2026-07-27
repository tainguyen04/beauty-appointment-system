namespace BeautyBooking.AI.Interfaces
{
    public interface IAIProvider
    {
        Task<string> GenerateResponseAsync(string SystemPrompt, string UserPrompt, CancellationToken cancellationToken = default);
    }
}
