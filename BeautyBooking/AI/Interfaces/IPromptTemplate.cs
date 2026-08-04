using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BeautyBooking.AI.Prompt;

namespace BeautyBooking.AI.Interfaces
{
    public interface IPromptTemplate
    {
        string Build(PromptContext context);
    }
}
