using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly IMongoCollection<CompanyEntity> _collection;

        public CompanyRepository(MongoDbContext context)
        {
            _collection = context.Companies;
        }

        public async Task CreateCompanyAsync(CompanyEntity company)
        {
            try
            {
                await _collection.InsertOneAsync(company);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in CompanyRepository.CreateCompanyAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task<CompanyEntity> GetCompanyByIdAsync(Guid id)
        {
            try
            {
                return await _collection.Find(c => c.Id == id).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in CompanyRepository.GetCompanyByIdAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task<List<CompanyEntity>> GetAllCompaniesAsync()
        {
            try
            {
                return await _collection.Find(_ => true).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in CompanyRepository.GetAllCompaniesAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task UpdateCompanyAsync(Guid id, CompanyEntity company)
        {
            try
            {
                var filter = Builders<CompanyEntity>.Filter.Eq(c => c.Id, id);
                await _collection.ReplaceOneAsync(filter, company);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in CompanyRepository.UpdateCompanyAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task DeleteCompanyAsync(Guid id)
        {
            try
            {
                var filter = Builders<CompanyEntity>.Filter.Eq(c => c.Id, id);
                await _collection.DeleteOneAsync(filter);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in CompanyRepository.DeleteCompanyAsync -> " + ex.Message);
                throw;
            }
        }
    }
}
