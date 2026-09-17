using LoanPortal.Core.Entities;
using System;
using System.Threading.Tasks;

namespace LoanPortal.Core.Repositories
{
    public interface IBorrowerLinkRepository
    {
        /// <summary>Fetch a BorrowerLinkDocument by its primary key.</summary>
        Task<BorrowerLinkDocument?> GetByIdAsync(Guid id);

        /// <summary>
        /// Fetch by the SHA-256 hash of the raw URL token.
        /// Used when the borrower opens the link and the API resolves the token.
        /// </summary>
        Task<BorrowerLinkDocument?> GetByTokenHashAsync(string tokenHash);

        /// <summary>
        /// Returns the single Active link for a given Loan Officer, if one exists.
        /// Used on re-generate to revoke the old link before creating a new one.
        /// </summary>
        Task<BorrowerLinkDocument?> GetActiveByLoanOfficerIdAsync(Guid loanOfficerId);

        Task InsertAsync(BorrowerLinkDocument doc);

        Task UpdateAsync(Guid id, BorrowerLinkDocument doc);
    }
}

