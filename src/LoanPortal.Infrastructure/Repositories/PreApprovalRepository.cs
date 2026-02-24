using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using MongoDB.Driver;
using Newtonsoft.Json.Converters;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Repositories;
using LoanPortal.Infrastructure;
using LoanPortal.Shared.Constants;
using LoanPortal.Shared.Enum;
using static Dapper.SqlMapper;

namespace LoanPortal.Infrastructure.Repositories
{
    public class PreApprovalRepository : IPreApprovalRepository
    {
        private readonly IMongoCollection<PreApprovalDocument> _collection;

        public PreApprovalRepository(MongoDbContext context)
        {
            _collection = context.PreApprovals;
        }

        public async Task<PreApprovalDocument> GetByIdAsync(Guid id)
        {
            return await _collection.Find(p => p.Id == id).FirstOrDefaultAsync();
        }

        public async Task InsertAsync(PreApprovalDocument doc)
        {
            await _collection.InsertOneAsync(doc);
        }

        public async Task UpdateAsync(Guid id, PreApprovalDocument doc)
        {
            var filter = Builders<PreApprovalDocument>.Filter.Eq(p => p.Id, id);
            await _collection.ReplaceOneAsync(filter, doc);
        }

        public async Task DeleteAsync(Guid id)
        {
            try
            {
                var filter = Builders<PreApprovalDocument>.Filter.Eq(p => p.Id, id);
                await _collection.DeleteOneAsync(filter);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.DeleteAsync: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteManyAsync(List<Guid> ids)
        {
            try
            {
                var filter = Builders<PreApprovalDocument>.Filter.In(p => p.Id, ids);
                await _collection.DeleteManyAsync(filter);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.DeleteManyAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<List<PreApprovalDocument>> GetAllAsync(Guid userId)
        {
            try
            {
                return await _collection.Find(doc => doc.UserId == userId).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.GetAllAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<List<PreApprovalDocument>> GetByMonth(Guid userId, int month, int year)
        {
            try
            {
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1);

                var filter = Builders<PreApprovalDocument>.Filter.And(
                    Builders<PreApprovalDocument>.Filter.Eq(doc => doc.UserId, userId),
                    Builders<PreApprovalDocument>.Filter.Gte(doc => doc.CreatedAt, startDate),
                    Builders<PreApprovalDocument>.Filter.Lt(doc => doc.CreatedAt, endDate)
                );

                return await _collection.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.GetByMonth: {ex.Message}");
                throw;
            }
        }

        public async Task<List<PreApprovalDocument>> GetByDateRange(Guid userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var filter = Builders<PreApprovalDocument>.Filter.And(
                    Builders<PreApprovalDocument>.Filter.Eq(doc => doc.UserId, userId),
                    Builders<PreApprovalDocument>.Filter.Gte(doc => doc.CreatedAt, startDate),
                    Builders<PreApprovalDocument>.Filter.Lt(doc => doc.CreatedAt, endDate)
                );

                return await _collection.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.GetByDateRange: {ex.Message}");
                throw;
            }
        }

        public async Task<List<PreApprovalDocument>> GetByDateRangeAdmin(DateTime startDate, DateTime endDate)
        {
            try
            {
                var filter = Builders<PreApprovalDocument>.Filter.And(
                    Builders<PreApprovalDocument>.Filter.Gte(doc => doc.CreatedAt, startDate),
                    Builders<PreApprovalDocument>.Filter.Lt(doc => doc.CreatedAt, endDate)
                );

                return await _collection.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.GetByDateRange: {ex.Message}");
                throw;
            }
        }

        public async Task<List<PreApprovalDocument>> GetByPreApprovedDateRange(Guid userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var filter = Builders<PreApprovalDocument>.Filter.And(
                    Builders<PreApprovalDocument>.Filter.Eq(doc => doc.UserId, userId),
                    Builders<PreApprovalDocument>.Filter.Eq(doc => doc.Status, (int)ApplicationStatus.PreApproved),
                    Builders<PreApprovalDocument>.Filter.Gte(doc => doc.StatusUpdatedAt, startDate),
                    Builders<PreApprovalDocument>.Filter.Lt(doc => doc.StatusUpdatedAt, endDate)
                );

                return await _collection.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.GetByPreApprovedDateRange: {ex.Message}");
                throw;
            }
        }

        public async Task<List<PreApprovalDocument>> GetByStatusChangeDateRange(DateTime startDate, DateTime endDate)
        {
            try
            {
                var filter = Builders<PreApprovalDocument>.Filter.And(
                    Builders<PreApprovalDocument>.Filter.Gte(doc => doc.StatusUpdatedAt, startDate),
                    Builders<PreApprovalDocument>.Filter.Lt(doc => doc.StatusUpdatedAt, endDate)
                );

                return await _collection.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.GetByPreApprovedDateRange: {ex.Message}");
                throw;
            }
        }

    }
}
