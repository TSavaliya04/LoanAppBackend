using MongoDB.Bson;
using MongoDB.Driver;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IMongoCollection<UserEntity> _collection;

        public UserRepository(MongoDbContext context)
        {
            _collection = context.Users;
        }

        public async Task CreateUser(UserEntity user)
        {
            try
            {
                await _collection.InsertOneAsync(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.CreateUser -> " + ex.Message);
                throw;
            }
        }

        public async Task<UserEntity> GetUserByEmail(string email)
        {
            try
            {
                return await _collection.Find(u => u.Email.ToLower() == email.ToLower()).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetUserByEmail -> " + ex.Message);
                throw;
            }
        }

        public async Task<UserEntity> GetUserByPhone(string phone)
        {
            try
            {
                return await _collection.Find(u => u.Phone == phone).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetUserByPhone -> " + ex.Message);
                throw;
            }
        }

        public async Task<UserEntity> GetUserById(Guid id)
        {
            try
            {
                return await _collection.Find(u => u.Id == id).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetUserById -> " + ex.Message);
                throw;
            }
        }

        /*public async Task UpdateUserProfile(UpdateProfileRequest request)
        {
            try
            {
                string query = @"update ""users"".user set address = @Address, profile = @Profile, jobtitle = @JobTitle, updatedat = @UpdatedAt where id = @UserId";
                await QuerySingleAsync<UserDTO>(query, request);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.UpdateUserProfile -> " + ex.Message);
                throw ex;
            }
        }*/

        public async Task UpdateUserProfileAsync(Guid id, UserEntity doc)
        {
            var filter = Builders<UserEntity>.Filter.Eq(u => u.Id, id);
            await _collection.ReplaceOneAsync(filter, doc);
        }

        public async Task<UserEntity> GetUserByUserName(string userName)
        {
            try
            {
                //return await _collection.Find(u => u.UserName == userName).FirstOrDefaultAsync();
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetUserById -> " + ex.Message);
                throw;
            }
        }

        public async Task<UserEntity> GetUserByFirebaseId(string firebaseId)
        {
            try
            {
                return await _collection.Find(u => u.FirebaseId == firebaseId).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetUserByFirebaseId -> " + ex.Message);
                throw;
            }
        }

        public async Task<List<UserEntity>> GetUsersActiveInRange(DateTime startDate, DateTime endDate)
        {
            try
            {
                var filter = Builders<UserEntity>.Filter.And(
                    Builders<UserEntity>.Filter.Gte(u => u.LastLoginDate, startDate),
                    Builders<UserEntity>.Filter.Lt(u => u.LastLoginDate, endDate)
                );
                return await _collection.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetUsersActiveInRange -> " + ex.Message);
                throw;
            }
        }

        public async Task UpdateUserLoginActivity(Guid userId, DateTime loginTime)
        {
            try
            {
                var filter = Builders<UserEntity>.Filter.Eq(u => u.Id, userId);
                var update = Builders<UserEntity>.Update
                    .Set(u => u.LastLoginDate, loginTime);
                    //.Push(u => u.LoginHistory, loginTime);

                await _collection.UpdateOneAsync(filter, update);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.UpdateUserLoginActivity -> " + ex.Message);
                throw;
            }
        }

        public async Task<List<UserEntity>> GetUsersByIds(List<Guid> userIds)
        {
            try
            {
                var filter = Builders<UserEntity>.Filter.In(u => u.Id, userIds);
                return await _collection.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetUsersByIds -> " + ex.Message);
                throw;
            }
        }

        public async Task<List<UserEntity>> GetAll() 
        {
            try
            {
                return await _collection.Find(_ => true).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetAll -> " + ex.Message);
                throw;
            }
        }

        public async Task<(List<UserEntity> Users, Dictionary<Guid, int> QuotesThisWeek, int TotalCount)> GetUsersWithFiltersAsync(GetUsersRequest request, Shared.Enum.UserRole loginRole, Guid? loginCompanyId)
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
                var endOfWeek = startOfWeek.AddDays(7);
                var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

                var filter = Builders<UserEntity>.Filter.Nin(u => u.Role, new[] { Shared.Enum.UserRole.SuperAdmin, Shared.Enum.UserRole.CompanyAdmin });

                if (loginRole == Shared.Enum.UserRole.CompanyAdmin && loginCompanyId.HasValue)
                {
                    filter &= Builders<UserEntity>.Filter.Eq(u => u.CompanyId, loginCompanyId.Value);
                }

                if (request.CompanyId.HasValue)
                {
                    filter &= Builders<UserEntity>.Filter.Eq(u => u.CompanyId, request.CompanyId.Value);
                }

                var aggregate = _collection.Aggregate().Match(filter);

                var lookupCompanies = new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "Companies" },
                    { "localField", "companyId" },
                    { "foreignField", "_id" },
                    { "as", "companyInfo" }
                });

                var lookupQuotes = new BsonDocument("$lookup", new BsonDocument
                {
                    { "from", "PreApprovals" },
                    { "let", new BsonDocument("uid", "$_id") },
                    { "pipeline", new BsonArray
                        {
                            new BsonDocument("$match", new BsonDocument("$expr", new BsonDocument("$eq", new BsonArray { "$userId", "$$uid" })))
                        }
                    },
                    { "as", "quotes" }
                });

                var addFields = new BsonDocument("$addFields", new BsonDocument
                {
                    { "companyName", new BsonDocument("$arrayElemAt", new BsonArray { "$companyInfo.name", 0 }) },
                    { "agentName", new BsonDocument("$concat", new BsonArray { "$firstName", " ", "$lastName" }) },
                    { "quotesThisWeek", new BsonDocument("$size", new BsonDocument("$filter", new BsonDocument
                        {
                            { "input", "$quotes" },
                            { "as", "q" },
                            { "cond", new BsonDocument("$and", new BsonArray
                                {
                                    new BsonDocument("$gte", new BsonArray { "$$q.createdAt", startOfWeek }),
                                    new BsonDocument("$lt", new BsonArray { "$$q.createdAt", endOfWeek })
                                })
                            }
                        }))
                    },
                    { "quotesLast7Days", new BsonDocument("$size", new BsonDocument("$filter", new BsonDocument
                        {
                            { "input", "$quotes" },
                            { "as", "q" },
                            { "cond", new BsonDocument("$gte", new BsonArray { "$$q.createdAt", sevenDaysAgo }) }
                        }))
                    }
                });

                var bsonAggregate = aggregate.AppendStage<BsonDocument>(lookupCompanies)
                                     .AppendStage<BsonDocument>(lookupQuotes)
                                     .AppendStage<BsonDocument>(addFields);

                var secondFilters = new List<FilterDefinition<BsonDocument>>();

                if (!string.IsNullOrWhiteSpace(request.SearchText))
                {
                    var searchRegex = new BsonRegularExpression(request.SearchText.Trim(), "i");
                    var searchFilter = Builders<BsonDocument>.Filter.Or(
                        Builders<BsonDocument>.Filter.Regex("agentName", searchRegex),
                        Builders<BsonDocument>.Filter.Regex("companyName", searchRegex),
                        Builders<BsonDocument>.Filter.Regex("email", searchRegex)
                    );
                    secondFilters.Add(searchFilter);
                }

                if (!string.IsNullOrWhiteSpace(request.FilterBy))
                {
                    var filterByStr = request.FilterBy.ToLower();
                    if (filterByStr == "recentlyactive")
                    {
                        secondFilters.Add(Builders<BsonDocument>.Filter.Or(
                            Builders<BsonDocument>.Filter.Gte("lastLoginDate", sevenDaysAgo),
                            Builders<BsonDocument>.Filter.Gt("quotesLast7Days", 0)
                        ));
                    }
                    else if (filterByStr == "nologin")
                    {
                        secondFilters.Add(Builders<BsonDocument>.Filter.Or(
                            Builders<BsonDocument>.Filter.Lt("lastLoginDate", sevenDaysAgo),
                            Builders<BsonDocument>.Filter.Eq("lastLoginDate", BsonNull.Value)
                        ));
                    }
                    else if (filterByStr == "noquotes")
                    {
                        secondFilters.Add(Builders<BsonDocument>.Filter.Eq("quotesLast7Days", 0));
                    }
                    else if (filterByStr == "topproducers")
                    {
                        secondFilters.Add(Builders<BsonDocument>.Filter.Gt("quotesThisWeek", 0));
                    }
                    else if (filterByStr == "newusers")
                    {
                        secondFilters.Add(Builders<BsonDocument>.Filter.Gte("createdAt", sevenDaysAgo));
                    }
                }

                if (request.Status.HasValue)
                {
                    bool isActive = request.Status.Value == Shared.Enum.UserStatus.Active;
                    secondFilters.Add(Builders<BsonDocument>.Filter.Eq("isActive", isActive));
                }

                if (request.LastLoginFrom.HasValue)
                {
                    secondFilters.Add(Builders<BsonDocument>.Filter.Gte("lastLoginDate", request.LastLoginFrom.Value));
                }

                if (request.LastLoginTo.HasValue)
                {
                    secondFilters.Add(Builders<BsonDocument>.Filter.Lte("lastLoginDate", request.LastLoginTo.Value));
                }

                if (request.QuotesThisWeekMin.HasValue)
                {
                    secondFilters.Add(Builders<BsonDocument>.Filter.Gte("quotesThisWeek", request.QuotesThisWeekMin.Value));
                }

                if (request.QuotesThisWeekMax.HasValue)
                {
                    secondFilters.Add(Builders<BsonDocument>.Filter.Lte("quotesThisWeek", request.QuotesThisWeekMax.Value));
                }

                if (request.CreatedAtFrom.HasValue)
                {
                    secondFilters.Add(Builders<BsonDocument>.Filter.Gte("createdAt", request.CreatedAtFrom.Value));
                }

                if (request.CreatedAtTo.HasValue)
                {
                    secondFilters.Add(Builders<BsonDocument>.Filter.Lte("createdAt", request.CreatedAtTo.Value));
                }

                if (secondFilters.Count > 0)
                {
                    bsonAggregate = bsonAggregate.Match(Builders<BsonDocument>.Filter.And(secondFilters));
                }

                var sortFieldMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    { "email", "email" },
                    { "company", "companyName" },
                    { "lastlogin", "lastLoginDate" },
                    { "quotesthisweek", "quotesThisWeek" },
                    { "status", "isActive" },
                    { "agentname", "agentName" },
                    { "createdat", "createdAt" }
                };

                string sortBy = "lastLoginDate";
                if (!string.IsNullOrWhiteSpace(request.SortBy) && sortFieldMap.ContainsKey(request.SortBy))
                {
                    sortBy = sortFieldMap[request.SortBy];
                }

                if (!string.IsNullOrWhiteSpace(request.FilterBy) && request.FilterBy.ToLower() == "topproducers" && string.IsNullOrWhiteSpace(request.SortBy))
                {
                    sortBy = "quotesThisWeek";
                    request.SortByDirection = "desc";
                }

                int sortDir = string.Equals(request.SortByDirection, "desc", StringComparison.OrdinalIgnoreCase) ? -1 : 1;
                var sortDef = sortDir == 1 ? Builders<BsonDocument>.Sort.Ascending(sortBy) : Builders<BsonDocument>.Sort.Descending(sortBy);

                if (!string.IsNullOrWhiteSpace(request.FilterBy) && request.FilterBy.ToLower() == "recentlyactive" && string.IsNullOrWhiteSpace(request.SortBy))
                {
                    sortDef = Builders<BsonDocument>.Sort.Descending("quotesLast7Days").Descending("lastLoginDate");
                }

                bsonAggregate = bsonAggregate.Sort(sortDef);

                var pageNumber = request.PageNumber < 0 ? 0 : request.PageNumber;
                var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

                var facetStage = new BsonDocument("$facet", new BsonDocument
                {
                    { "metadata", new BsonArray { new BsonDocument("$count", "total") } },
                    { "data", new BsonArray { new BsonDocument("$skip", pageNumber * pageSize), new BsonDocument("$limit", pageSize) } }
                });

                var result = await bsonAggregate.AppendStage<BsonDocument>(facetStage).FirstOrDefaultAsync();

                int totalCount = 0;
                var usersList = new List<UserEntity>();
                var quotesDict = new Dictionary<Guid, int>();

                if (result != null)
                {
                    var metaArray = result["metadata"].AsBsonArray;
                    if (metaArray.Count > 0)
                    {
                        totalCount = metaArray[0]["total"].AsInt32;
                    }

                    var dataArray = result["data"].AsBsonArray;
                    foreach (var doc in dataArray)
                    {
                        var userDoc = doc.AsBsonDocument;
                        var userId = userDoc["_id"].AsGuid;
                        var quotesThisWeek = userDoc["quotesThisWeek"].AsInt32;
                        
                        userDoc.Remove("companyInfo");
                        userDoc.Remove("quotes");
                        userDoc.Remove("companyName");
                        userDoc.Remove("agentName");
                        userDoc.Remove("quotesThisWeek");
                        userDoc.Remove("quotesLast7Days");

                        var userEntity = MongoDB.Bson.Serialization.BsonSerializer.Deserialize<UserEntity>(userDoc);
                        usersList.Add(userEntity);
                        quotesDict[userId] = quotesThisWeek;
                    }
                }

                return (usersList, quotesDict, totalCount);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserRepository.GetUsersWithFiltersAsyncc -> " + ex.Message);
                throw;
            }
        }
    }
}
