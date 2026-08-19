using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public class CountyLoanLimitRepository : ICountyLoanLimitRepository
    {
        private readonly IMongoCollection<CountyLoanLimitEntity> _collection;

        public CountyLoanLimitRepository(MongoDbContext context)
        {
            _collection = context.CountyLoanLimits;
        }

        public async Task<List<CountyLoanLimitEntity>> SearchCountiesAsync(string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return await _collection.Find(_ => true).ToListAsync();
                }

                // Create a case-insensitive regular expression for matching the county name
                var filter = Builders<CountyLoanLimitEntity>.Filter.Regex(c => c.County, new BsonRegularExpression(searchTerm, "i"));
                return await _collection.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in CountyLoanLimitRepository.SearchCountiesAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task<CountyLoanLimitEntity> GetByIdAsync(Guid id)
        {
            try
            {
                return await _collection.Find(c => c.Id == id).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in CountyLoanLimitRepository.GetByIdAsync -> " + ex.Message);
                throw;
            }
        }
    }
}
