using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public class BorrowerEmploymentRepository : IBorrowerEmploymentRepository
    {
        private readonly IMongoCollection<BorrowerEmploymentDocument> _collection;

        public BorrowerEmploymentRepository(MongoDbContext context)
        {
            _collection = context.BorrowerEmployments;

            EnsureIndexes();
        }

        private void EnsureIndexes()
        {
            // Unique index on linkId — one employment document per invite link
            var linkIdIndex = Builders<BorrowerEmploymentDocument>.IndexKeys.Ascending(x => x.LinkId);
            _collection.Indexes.CreateOne(
                new CreateIndexModel<BorrowerEmploymentDocument>(
                    linkIdIndex,
                    new CreateIndexOptions { Unique = true, Background = true }
                )
            );
        }

        public async Task<BorrowerEmploymentDocument?> GetByLinkIdAsync(Guid linkId)
        {
            return await _collection.Find(x => x.LinkId == linkId).FirstOrDefaultAsync();
        }

        public async Task InsertAsync(BorrowerEmploymentDocument doc)
        {
            await _collection.InsertOneAsync(doc);
        }

        public async Task UpdateAsync(Guid id, BorrowerEmploymentDocument doc)
        {
            var filter = Builders<BorrowerEmploymentDocument>.Filter.Eq(x => x.Id, id);
            await _collection.ReplaceOneAsync(filter, doc);
        }
    }
}

