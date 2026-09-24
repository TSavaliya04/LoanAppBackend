using LoanPortal.Core.Entities;
using System;
using System.Threading.Tasks;

namespace LoanPortal.Core.Repositories
{
    public interface ILOEmploymentLinkRepository
    {
        Task<LOEmploymentLinkDocument?> GetByLoanOfficerIdAsync(Guid loanOfficerId);
        Task InsertAsync(LOEmploymentLinkDocument doc);
        Task UpdateAsync(Guid id, LOEmploymentLinkDocument doc);
    }
}

