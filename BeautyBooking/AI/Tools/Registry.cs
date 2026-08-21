using BeautyBooking.AI.Interfaces;

namespace BeautyBooking.AI.Tools
{
    public class ToolRegistry : IToolRegistry
    {
        private readonly Dictionary<string, ITool> _tools;

        public ToolRegistry(IEnumerable<ITool> tools)
        {
            _tools = tools.ToDictionary(t => t.Name, StringComparer.OrdinalIgnoreCase);
        }

        public IReadOnlyCollection<ITool> GetAll()
        {
            return _tools.Values.ToList();
        }

        public ITool Get(string name)
        {
            return _tools.GetValueOrDefault(name)
                ?? throw new KeyNotFoundException(
                    $"Tool with name '{name}' not found in the registry."
                );
        }
    }
}
