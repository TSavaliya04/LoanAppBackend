using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Enum;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public class LOEmploymentLinkRepository : ILOEmploymentLinkRepository
    {
        private readonly IMongoCollection<LOEmploymentLinkDocument> _collection;

        public LOEmploymentLinkRepository(MongoDbContext context)
        {
            _collection = context.LOEmploymentLinks;

            EnsureIndexes();
        }

        private void EnsureIndexes()
        {
            var loIndex = Builders<LOEmploymentLinkDocument>.IndexKeys.Ascending(x => x.LoanOfficerId);
            _collection.Indexes.CreateOne(
                new CreateIndexModel<LOEmploymentLinkDocument>(
                    loIndex,
                    new CreateIndexOptions { Unique = true, Background = true }
                )
            );
        }

        public async Task<LOEmploymentLinkDocument?> GetByLoanOfficerIdAsync(Guid loanOfficerId)
        {
            return await _collection.Find(x => x.LoanOfficerId == loanOfficerId).FirstOrDefaultAsync();
        }

        public async Task InsertAsync(LOEmploymentLinkDocument doc)
        {
            await _collection.InsertOneAsync(doc);
        }

        public async Task UpdateAsync(Guid id, LOEmploymentLinkDocument doc)
        {
            var filter = Builders<LOEmploymentLinkDocument>.Filter.Eq(x => x.Id, id);
            await _collection.ReplaceOneAsync(filter, doc);
        }
    }
}

