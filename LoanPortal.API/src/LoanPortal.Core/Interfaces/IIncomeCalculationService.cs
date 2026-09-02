using LoanPortal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Core.Interfaces
{
    public interface IIncomeCalculationService
    {
        Task<IncomeCalculationDocument?> GetById(Guid id);
        Task<List<IncomeCalculationDocument>> GetByScenarioId(Guid scenarioId);
        Task<IncomeCalculationDocument> Save(IncomeCalculationDocument doc);
        Task<IncomeCalculationDocument> Update(Guid id, IncomeCalculationDocument doc);
        Task DeleteById(Guid id);
        Task DeleteByScenarioId(Guid scenarioId);
        Task DeleteByPreApprovalId(Guid preApprovalId);
    }
}
