using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LoanPortal.Core.Entities;

namespace LoanPortal.Core.Repositories
{
    public interface IPreApprovalRepository
    {
        Task<PreApprovalDocument> GetByIdAsync(Guid id);
        Task InsertAsync(PreApprovalDocument doc);
        Task UpdateAsync(Guid id, PreApprovalDocument doc);
        Task DeleteAsync(Guid id);
        Task DeleteManyAsync(List<Guid> ids);
        Task<List<PreApprovalDocument>> GetAllAsync(Guid userId);
    }
}
