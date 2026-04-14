using LoanPortal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LoanPortal.Core.Repositories
{
    public interface ICompanyRepository
    {
        Task CreateCompanyAsync(CompanyEntity company);
        Task<CompanyEntity> GetCompanyByIdAsync(Guid id);
        Task<List<CompanyEntity>> GetAllCompaniesAsync();
        Task UpdateCompanyAsync(Guid id, CompanyEntity company);
        Task DeleteCompanyAsync(Guid id);
    }
}
