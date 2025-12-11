using MongoDB.Driver;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using System;
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
    }
}
