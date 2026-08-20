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

        public async Task<List<LoanPortal.Core.Entities.CountySearchDTO>> SearchCountiesAsync(string searchTerm)
        {
            var counties = await _countyRepository.SearchCountiesAsync(searchTerm);
            
            // Return distinct county names with their IDs
            return counties
                .Where(c => !string.IsNullOrEmpty(c.County))
                .GroupBy(c => c.County) // Group by county name to ensure distinct names
                .Select(g => new LoanPortal.Core.Entities.CountySearchDTO
                {
                    Id = g.First().Id,
                    County = g.Key
                })
                .OrderBy(c => c.County)
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
