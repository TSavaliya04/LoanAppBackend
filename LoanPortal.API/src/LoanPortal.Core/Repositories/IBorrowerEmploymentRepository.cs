using LoanPortal.Core.Entities;
using System;
using System.Threading.Tasks;

namespace LoanPortal.Core.Repositories
{
    public interface IBorrowerEmploymentRepository
    {
        /// <summary>
        /// Fetch the employment document for a given link.
        /// Returns null if the borrower has not started filling the form yet.
        /// </summary>
        Task<BorrowerEmploymentDocument?> GetByLinkIdAsync(Guid linkId);

        Task InsertAsync(BorrowerEmploymentDocument doc);

        Task UpdateAsync(Guid id, BorrowerEmploymentDocument doc);
    }
}

