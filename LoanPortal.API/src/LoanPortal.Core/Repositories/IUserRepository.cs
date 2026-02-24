using LoanPortal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Repositories
{
    public interface IUserRepository
    {
        Task CreateUser(UserEntity user);
        Task<UserEntity> GetUserByEmail(string email);
        Task<UserEntity> GetUserByPhone(string phone);
        Task<UserEntity> GetUserById(Guid id);
        Task UpdateUserProfileAsync(Guid id, UserEntity doc);
        Task<UserEntity> GetUserByUserName(string userName);
        Task<UserEntity> GetUserByFirebaseId(string firebaseId);
        Task<List<UserEntity>> GetUsersActiveInRange(DateTime startDate, DateTime endDate);
        Task UpdateUserLoginActivity(Guid userId, DateTime loginTime);
        Task<List<UserEntity>> GetUsersByIds(List<Guid> userIds);
        Task<List<UserEntity>> GetAll();
    }
}
