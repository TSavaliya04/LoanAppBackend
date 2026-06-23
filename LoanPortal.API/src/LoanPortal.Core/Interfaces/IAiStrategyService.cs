using System.Threading.Tasks;
using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Interfaces
{
    public interface IAiStrategyService
    {
        Task<AiStrategySummary> GenerateSummaryAsync(ScenarioComparisonRequest request);
    }
}
