using LoanPortal.Core.Entities;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace LoanPortal.Core.Repositories
{
    public interface IBorrowerEmploymentRepository
    {
        Task<BorrowerEmploymentDetails?> GetByIdAsync(Guid draftId);
        Task<List<BorrowerEmploymentDetails>> GetAllByBorrowerIdAsync(Guid borrowerId);
        Task InsertAsync(BorrowerEmploymentDetails doc);
        Task UpdateAsync(Guid id, BorrowerEmploymentDetails doc);
    }
}

