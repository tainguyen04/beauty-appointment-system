using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace BeautyBooking.AI.Extensions
{
    public static class VectorHelper
    {
        public static string Serialize(float[] vector)
        {
            return "["
                + string.Join(",", vector.Select(x => x.ToString(CultureInfo.InvariantCulture)))
                + "]";
        }

        public static float[] Deserialize(string serializedVector)
        {
            if (string.IsNullOrWhiteSpace(serializedVector))
                return [];

            // Remove the square brackets and split the string by commas
            var values = serializedVector
                .Trim('[', ']')
                .Split(',', StringSplitOptions.RemoveEmptyEntries);

            // Convert the string values to float
            return values.Select(v => float.Parse(v, CultureInfo.InvariantCulture)).ToArray();
        }
    }
}
