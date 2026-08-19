using LoanPortal.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Core.Repositories
{
    public interface ICountyLoanLimitRepository
    {
        Task<List<CountyLoanLimitEntity>> SearchCountiesAsync(string searchTerm);
        Task<CountyLoanLimitEntity> GetByIdAsync(Guid id);
    }
}
