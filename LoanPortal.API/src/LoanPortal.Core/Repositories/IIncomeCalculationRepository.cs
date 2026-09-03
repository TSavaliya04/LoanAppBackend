using LoanPortal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Core.Repositories
{
    public interface IIncomeCalculationRepository
    {
        Task<IncomeCalculationDocument?> GetByIdAsync(Guid id);
        Task<List<IncomeCalculationDocument>> GetByScenarioIdAsync(Guid scenarioId);
        Task InsertAsync(IncomeCalculationDocument doc);
        Task UpdateAsync(Guid id, IncomeCalculationDocument doc);
        Task DeleteByIdAsync(Guid id);
        Task DeleteByScenarioIdAsync(Guid scenarioId);
        Task DeleteByPreApprovalIdAsync(Guid preApprovalId);
    }
}
