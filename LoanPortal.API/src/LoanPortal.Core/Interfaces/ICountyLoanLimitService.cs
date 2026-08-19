using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Core.Interfaces
{
    public interface ICountyLoanLimitService
    {
        Task<List<string>> SearchCountyNamesAsync(string searchTerm);
        Task<decimal?> GetLoanLimitAsync(System.Guid countyId, Shared.Enum.PropertyType propertyType);
    }
}
