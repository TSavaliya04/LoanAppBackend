using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public class IncomeCalculationRepository : IIncomeCalculationRepository
    {
        private readonly IMongoCollection<IncomeCalculationDocument> _collection;

        public IncomeCalculationRepository(MongoDbContext context)
        {
            _collection = context.IncomeCalculations;
        }

        public async Task<IncomeCalculationDocument?> GetByIdAsync(Guid id)
        {
            return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<IncomeCalculationDocument>> GetByScenarioIdAsync(Guid scenarioId)
        {
            return await _collection.Find(x => x.ScenarioId == scenarioId).ToListAsync();
        }

        public async Task InsertAsync(IncomeCalculationDocument doc)
        {
            await _collection.InsertOneAsync(doc);
        }

        public async Task UpdateAsync(Guid id, IncomeCalculationDocument doc)
        {
            var filter = Builders<IncomeCalculationDocument>.Filter.Eq(x => x.Id, id);
            await _collection.ReplaceOneAsync(filter, doc);
        }

        public async Task DeleteByIdAsync(Guid id)
        {
            var filter = Builders<IncomeCalculationDocument>.Filter.Eq(x => x.Id, id);
            await _collection.DeleteOneAsync(filter);
        }

        public async Task DeleteByScenarioIdAsync(Guid scenarioId)
        {
            var filter = Builders<IncomeCalculationDocument>.Filter.Eq(x => x.ScenarioId, scenarioId);
            await _collection.DeleteManyAsync(filter);
        }

        public async Task DeleteByPreApprovalIdAsync(Guid preApprovalId)
        {
            var filter = Builders<IncomeCalculationDocument>.Filter.Eq(x => x.PreApprovalId, preApprovalId);
            await _collection.DeleteManyAsync(filter);
        }
    }
}
