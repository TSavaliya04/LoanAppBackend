using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LoanPortal.Core.Services
{
    public class CountyLoanLimitService : ICountyLoanLimitService
    {
        private readonly ICountyLoanLimitRepository _countyRepository;

        public CountyLoanLimitService(ICountyLoanLimitRepository countyRepository)
        {
            _countyRepository = countyRepository;
        }

        public async Task<List<string>> SearchCountyNamesAsync(string searchTerm)
        {
            var counties = await _countyRepository.SearchCountiesAsync(searchTerm);
            
            // Only return the distinct county names
            return counties
                .Select(c => c.County)
                .Where(c => !string.IsNullOrEmpty(c))
                .Distinct()
                .OrderBy(c => c)
                .ToList();
        }

        public async Task<decimal?> GetLoanLimitAsync(System.Guid countyId, Shared.Enum.PropertyType propertyType)
        {
            var county = await _countyRepository.GetByIdAsync(countyId);
            if (county == null)
            {
                return null;
            }

            return propertyType switch
            {
                Shared.Enum.PropertyType.SFR => county.Single,
                Shared.Enum.PropertyType.TwoUnit => county.Duplex,
                Shared.Enum.PropertyType.Duplex => county.Duplex,
                Shared.Enum.PropertyType.ThreeUnit => county.TriPlex,
                Shared.Enum.PropertyType.Triplex => county.TriPlex,
                Shared.Enum.PropertyType.FourUnit => county.FourPlex,
                Shared.Enum.PropertyType.FourPlex => county.FourPlex,
                _ => null
            };
        }
    }
}
