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
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
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

        public async Task<List<PreApprovalDocument>> GetByDateRange(Guid? teamId, Guid? userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var matchDoc = new BsonDocument
                {
                    { "createdAt", new BsonDocument { { "$gte", startDate }, { "$lt", endDate } } }
                };
                return await ExecuteLookupPipeline(teamId, userId, matchDoc);
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

        public async Task<List<PreApprovalDocument>> GetByPreApprovedDateRange(Guid? teamId, Guid? userId, DateTime startDate, DateTime endDate)
        {
            try
            {
                var matchDoc = new BsonDocument
                {
                    { "status", (int)ApplicationStatus.PreApproved },
                    { "statusUpdatedAt", new BsonDocument { { "$gte", startDate }, { "$lt", endDate } } }
                };
                return await ExecuteLookupPipeline(teamId, userId, matchDoc);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in PreApprovalRepository.GetByPreApprovedDateRange: {ex.Message}");
                throw;
            }
        }

        private async Task<List<PreApprovalDocument>> ExecuteLookupPipeline(Guid? teamId, Guid? userId, BsonDocument matchConditions)
        {
            var pipeline = new List<BsonDocument>();
            
            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Users" },
                { "localField", "userId" },
                { "foreignField", "_id" },
                { "as", "user" }
            }));
            
            pipeline.Add(new BsonDocument("$unwind", "$user"));

            if (teamId.HasValue)
            {
                matchConditions.Add("user.teamId", new BsonBinaryData(teamId.Value, GuidRepresentation.Standard));
            }
            else if (userId.HasValue)
            {
                matchConditions.Add("userId", new BsonBinaryData(userId.Value, GuidRepresentation.Standard));
            }

            pipeline.Add(new BsonDocument("$match", matchConditions));

            // MongoDB aggregation drops the c# type mapping if we don't project properly, 
            // but for just filtering it's easier to use the strongly typed aggregation:
            // Since we need to return PreApprovalDocument, we can project back to the root document.
            // Or just use BsonSerializer.
            pipeline.Add(new BsonDocument("$project", new BsonDocument
            {
                { "user", 0 } // exclude the joined user data
            }));

            var results = await _collection.Aggregate<PreApprovalDocument>(pipeline).ToListAsync();
            return results;
        }



        public async Task<(List<PreApprovalDocument> Items, int TotalCount)> GetRecentQuotesAsync(Guid? teamId, Guid? userId, GetContinueWorkingRequest request)
        {
            var matchDoc = new BsonDocument();
            var pipeline = new List<BsonDocument>();

            pipeline.Add(new BsonDocument("$lookup", new BsonDocument
            {
                { "from", "Users" },
                { "localField", "userId" },
                { "foreignField", "_id" },
                { "as", "user" }
            }));

            pipeline.Add(new BsonDocument("$unwind", "$user"));

            if (teamId.HasValue)
            {
                matchDoc.Add("user.teamId", new BsonBinaryData(teamId.Value, GuidRepresentation.Standard));
            }
            else if (userId.HasValue)
            {
                matchDoc.Add("userId", new BsonBinaryData(userId.Value, GuidRepresentation.Standard));
            }

            if (request.Status.HasValue && request.Status.Value != 0)
            {
                matchDoc.Add("status", request.Status.Value);
            }

            if (matchDoc.ElementCount > 0)
            {
                pipeline.Add(new BsonDocument("$match", matchDoc));
            }

            // Add a computed field for searching: borrower name from latest scenario, and owner full name
            pipeline.Add(new BsonDocument("$addFields", new BsonDocument
            {
                {
                    "searchBorrowerName", new BsonDocument("$let", new BsonDocument
                    {
                        { "vars", new BsonDocument("latestScenario", new BsonDocument("$arrayElemAt", new BsonArray
                            {
                                new BsonDocument("$sortArray", new BsonDocument
                                {
                                    { "input", "$scenarios" },
                                    { "sortBy", new BsonDocument("createdAt", -1) }
                                }),
                                0
                            }))
                        },
                        { "in", new BsonDocument("$cond", new BsonArray
                            {
                                new BsonDocument("$eq", new BsonArray { "$loanType", 1 }),
                                "$$latestScenario.refinance.borrowerInfo.borrowerName",
                                "$$latestScenario.purchase.borrowerInfo.borrowerName"
                            })
                        }
                    })
                },
                {
                    "ownerFullName", new BsonDocument("$concat", new BsonArray
                    {
                        new BsonDocument("$ifNull", new BsonArray { "$user.firstName", "" }),
                        " ",
                        new BsonDocument("$ifNull", new BsonArray { "$user.lastName", "" })
                    })
                }
            }));

            // Apply SearchText filter if provided
            if (!string.IsNullOrWhiteSpace(request.SearchText))
            {
                var searchRegex = new BsonRegularExpression(request.SearchText.Trim(), "i");
                pipeline.Add(new BsonDocument("$match", new BsonDocument("$or", new BsonArray
                {
                    new BsonDocument("searchBorrowerName", new BsonDocument("$regex", searchRegex)),
                    new BsonDocument("ownerFullName", new BsonDocument("$regex", searchRegex))
                })));
            }

            pipeline.Add(new BsonDocument("$sort", new BsonDocument("createdAt", -1)));

            var pageNumber = request.PageNumber < 0 ? 0 : request.PageNumber;
            var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

            var facetStage = new BsonDocument("$facet", new BsonDocument
            {
                { "metadata", new BsonArray { new BsonDocument("$count", "total") } },
                { "data", new BsonArray 
                    { 
                        new BsonDocument("$skip", (pageNumber - 1 >= 0 ? pageNumber - 1 : 0) * pageSize), 
                        new BsonDocument("$limit", pageSize),
                        new BsonDocument("$project", new BsonDocument { { "user", 0 } })
                    } 
                }
            });

            pipeline.Add(facetStage);

            var result = await _collection.Aggregate<BsonDocument>(pipeline).FirstOrDefaultAsync();

            int totalCount = 0;
            var items = new List<PreApprovalDocument>();

            if (result != null)
            {
                var metadataArray = result.GetValue("metadata", new BsonArray()).AsBsonArray;
                if (metadataArray.Count > 0)
                {
                    totalCount = metadataArray[0].AsBsonDocument.GetValue("total", 0).AsInt32;
                }

                var dataArray = result.GetValue("data", new BsonArray()).AsBsonArray;
                items = dataArray.Select(d => BsonSerializer.Deserialize<PreApprovalDocument>(d.AsBsonDocument)).ToList();
            }

            return (items, totalCount);
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
