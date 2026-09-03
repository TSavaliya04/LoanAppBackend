using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Core.Services
{
    public class IncomeCalculationService : IIncomeCalculationService
    {
        private readonly IIncomeCalculationRepository _repository;

        public IncomeCalculationService(IIncomeCalculationRepository repository)
        {
            _repository = repository;
        }

        public async Task<IncomeCalculationDocument?> GetById(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<List<IncomeCalculationDocument>> GetByScenarioId(Guid scenarioId)
        {
            return await _repository.GetByScenarioIdAsync(scenarioId);
        }

        public async Task<IncomeCalculationDocument> Save(IncomeCalculationDocument doc)
        {
            doc.Id = Guid.NewGuid();
            doc.CreatedAt = DateTime.UtcNow;
            doc.UpdatedAt = DateTime.UtcNow;
            await _repository.InsertAsync(doc);
            return doc;
        }

        public async Task<IncomeCalculationDocument> Update(Guid id, IncomeCalculationDocument doc)
        {
            doc.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(id, doc);
            return doc;
        }

        public async Task DeleteById(Guid id)
        {
            await _repository.DeleteByIdAsync(id);
        }

        public async Task DeleteByScenarioId(Guid scenarioId)
        {
            await _repository.DeleteByScenarioIdAsync(scenarioId);
        }

        public async Task DeleteByPreApprovalId(Guid preApprovalId)
        {
            await _repository.DeleteByPreApprovalIdAsync(preApprovalId);
        }
    }
}
