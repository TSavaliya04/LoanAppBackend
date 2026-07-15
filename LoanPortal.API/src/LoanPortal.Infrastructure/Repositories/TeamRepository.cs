using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using MongoDB.Bson;
using MongoDB.Driver;

namespace LoanPortal.Infrastructure.Repositories
{
    public class TeamRepository : ITeamRepository
    {
        private readonly IMongoCollection<TeamEntity> _collection;
        private readonly IMongoCollection<UserEntity> _usersCollection;

        public TeamRepository(MongoDbContext context)
        {
            _collection = context.Teams;
            _usersCollection = context.Users;
        }

        public async Task CreateTeamAsync(TeamEntity team)
        {
            try
            {
                await _collection.InsertOneAsync(team);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in TeamRepository.CreateTeamAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task<TeamEntity> GetTeamByIdAsync(Guid id)
        {
            try
            {
                return await _collection.Find(t => t.Id == id).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in TeamRepository.GetTeamByIdAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task<List<TeamEntity>> GetTeamsByCompanyIdAsync(Guid companyId)
        {
            try
            {
                return await _collection
                    .Find(t => t.CompanyId == companyId && t.IsActive)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in TeamRepository.GetTeamsByCompanyIdAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task UpdateTeamAsync(Guid id, TeamEntity team)
        {
            try
            {
                var filter = Builders<TeamEntity>.Filter.Eq(t => t.Id, id);
                await _collection.ReplaceOneAsync(filter, team);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in TeamRepository.UpdateTeamAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task DeleteTeamAsync(Guid id)
        {
            try
            {
                var filter = Builders<TeamEntity>.Filter.Eq(t => t.Id, id);
                await _collection.DeleteOneAsync(filter);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in TeamRepository.DeleteTeamAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task<(List<TeamEntity> Teams, int TotalCount)> GetTeamsWithFiltersAsync(
            DefaultRequest request, Guid companyId)
        {
            try
            {
                var filter = Builders<TeamEntity>.Filter.Eq(t => t.CompanyId, companyId);

                if (!string.IsNullOrWhiteSpace(request.SearchText))
                {
                    var searchRegex = new BsonRegularExpression(request.SearchText.Trim(), "i");
                    filter &= Builders<TeamEntity>.Filter.Regex(t => t.Name, searchRegex);
                }

                var totalCount = (int)await _collection.CountDocumentsAsync(filter);

                var sortFieldMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    { "name", "name" },
                    { "createdat", "createdAt" },
                    { "isactive", "isActive" }
                };

                string sortBy = "createdAt";
                if (!string.IsNullOrWhiteSpace(request.SortBy) && sortFieldMap.ContainsKey(request.SortBy))
                    sortBy = sortFieldMap[request.SortBy];

                var sortDef = string.Equals(request.SortByDirection, "desc", StringComparison.OrdinalIgnoreCase)
                    ? Builders<TeamEntity>.Sort.Descending(sortBy)
                    : Builders<TeamEntity>.Sort.Ascending(sortBy);

                var pageNumber = request.PageNumber < 1 ? 0 : request.PageNumber;
                var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

                var teams = await _collection
                    .Find(filter)
                    .Sort(sortDef)
                    .Skip(pageNumber * pageSize)
                    .Limit(pageSize)
                    .ToListAsync();

                return (teams, totalCount);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in TeamRepository.GetTeamsWithFiltersAsync -> " + ex.Message);
                throw;
            }
        }

        public async Task<int> GetActiveMemberCountAsync(Guid teamId)
        {
            try
            {
                var filter = Builders<UserEntity>.Filter.And(
                    Builders<UserEntity>.Filter.Eq(u => u.TeamId, teamId),
                    Builders<UserEntity>.Filter.Eq(u => u.IsActive, true)
                );
                return (int)await _usersCollection.CountDocumentsAsync(filter);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in TeamRepository.GetActiveMemberCountAsync -> " + ex.Message);
                throw;
            }
        }
    }
}
