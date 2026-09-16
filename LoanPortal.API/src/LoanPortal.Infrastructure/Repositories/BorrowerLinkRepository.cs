using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Enum;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public class BorrowerLinkRepository : IBorrowerLinkRepository
    {
        private readonly IMongoCollection<BorrowerLinkDocument> _collection;

        public BorrowerLinkRepository(MongoDbContext context)
        {
            _collection = context.BorrowerLinks;

            // Ensure indexes exist (no-op if already created)
            EnsureIndexes();
        }

        private void EnsureIndexes()
        {
            // Unique index on tokenHash for O(1) token resolution
            var tokenHashIndex = Builders<BorrowerLinkDocument>.IndexKeys.Ascending(x => x.TokenHash);
            _collection.Indexes.CreateOne(
                new CreateIndexModel<BorrowerLinkDocument>(
                    tokenHashIndex,
                    new CreateIndexOptions { Unique = true, Background = true }
                )
            );

            // Index on loanOfficerId + status for fast active-link lookups
            var loStatusIndex = Builders<BorrowerLinkDocument>.IndexKeys
                .Ascending(x => x.LoanOfficerId)
                .Ascending(x => x.Status);
            _collection.Indexes.CreateOne(
                new CreateIndexModel<BorrowerLinkDocument>(
                    loStatusIndex,
                    new CreateIndexOptions { Background = true }
                )
            );
        }

        public async Task<BorrowerLinkDocument?> GetByIdAsync(Guid id)
        {
            return await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();
        }

        public async Task<BorrowerLinkDocument?> GetByTokenHashAsync(string tokenHash)
        {
            return await _collection.Find(x => x.TokenHash == tokenHash).FirstOrDefaultAsync();
        }

        public async Task<BorrowerLinkDocument?> GetActiveByLoanOfficerIdAsync(Guid loanOfficerId)
        {
            return await _collection
                .Find(x => x.LoanOfficerId == loanOfficerId && x.Status == BorrowerLinkStatus.Active)
                .FirstOrDefaultAsync();
        }

        public async Task InsertAsync(BorrowerLinkDocument doc)
        {
            await _collection.InsertOneAsync(doc);
        }

        public async Task UpdateAsync(Guid id, BorrowerLinkDocument doc)
        {
            var filter = Builders<BorrowerLinkDocument>.Filter.Eq(x => x.Id, id);
            await _collection.ReplaceOneAsync(filter, doc);
        }
    }
}

