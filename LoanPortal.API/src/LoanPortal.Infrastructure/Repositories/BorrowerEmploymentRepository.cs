using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public class BorrowerEmploymentRepository : IBorrowerEmploymentRepository
    {
        private readonly IMongoCollection<BorrowerEmploymentDetails> _collection;

        public BorrowerEmploymentRepository(MongoDbContext context)
        {
            _collection = context.BorrowerEmployments; // Wait, I should rename context.BorrowerEmployments to BorrowerEmploymentDetails later. Keep it as context.BorrowerEmployments for now or context.BorrowerEmploymentDetails.

            EnsureIndexes();
        }

        private void EnsureIndexes()
        {
            // Unique index on LoanOfficerId + BorrowerId
            var indexKeys = Builders<BorrowerEmploymentDetails>.IndexKeys
                .Ascending(x => x.LoanOfficerId)
                .Ascending(x => x.BorrowerId);

            _collection.Indexes.CreateOne(
                new CreateIndexModel<BorrowerEmploymentDetails>(
                    indexKeys,
                    new CreateIndexOptions { Unique = true, Background = true }
                )
            );
        }

        public async Task<BorrowerEmploymentDetails?> GetByIdAsync(Guid draftId)
        {
            return await _collection.Find(x => x.Id == draftId).FirstOrDefaultAsync();
        }

        public async Task<List<BorrowerEmploymentDetails>> GetAllByBorrowerIdAsync(Guid borrowerId)
        {
            return await _collection.Find(x => x.BorrowerId == borrowerId).ToListAsync();
        }

        public async Task InsertAsync(BorrowerEmploymentDetails doc)
        {
            await _collection.InsertOneAsync(doc);
        }

        public async Task UpdateAsync(Guid id, BorrowerEmploymentDetails doc)
        {
            var filter = Builders<BorrowerEmploymentDetails>.Filter.Eq(x => x.Id, id);
            await _collection.ReplaceOneAsync(filter, doc);
        }
    }
}

