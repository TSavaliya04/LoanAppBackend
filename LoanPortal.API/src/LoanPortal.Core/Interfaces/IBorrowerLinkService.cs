using LoanPortal.Core.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace LoanPortal.Core.Interfaces
{
    public interface IBorrowerLinkService
    {
        Task<GetLOEmploymentLinkResponse> GetMyPortalLinkAsync();
        
        Task UpdatePortalStatusAsync(UpdateLOEmploymentLinkStatusRequest request);

        Task<ResolveBorrowerLinkResponse> ResolveLinkAsync(Guid loanOfficerId);

        Task<List<GetMyDraftsResponseItem>> GetMyDraftsAsync();

        Task<SaveBorrowerDraftResponse> SaveDraftAsync(SaveBorrowerDraftRequest request);

        Task<SubmitBorrowerEmploymentResponse> SubmitAsync(SubmitBorrowerEmploymentRequest request);
    }
}

