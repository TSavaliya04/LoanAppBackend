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
        Task<(List<UserEntity> Users, Dictionary<Guid, int> QuotesThisWeek, int TotalCount)> GetUsersWithFiltersAsync(GetUsersRequest request, Shared.Enum.UserRole loginRole, Guid? loginCompanyId);

        /// <summary>Targeted update that sets only the teamId field for a user (null = remove from team).</summary>
        Task UpdateUserTeamAsync(Guid userId, Guid? teamId);

        /// <summary>Returns all users assigned to a specific team, with pagination.</summary>
        Task<(List<UserEntity> Users, int TotalCount)> GetUsersByTeamIdAsync(Guid teamId, DefaultRequest request);

        /// <summary>Returns count of active users in a given team (used for delete-guard).</summary>
        Task<int> GetActiveUserCountByTeamIdAsync(Guid teamId);
    }
}
