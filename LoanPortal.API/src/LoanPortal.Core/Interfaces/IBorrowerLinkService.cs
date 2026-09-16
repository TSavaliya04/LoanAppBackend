using LoanPortal.Core.Entities;
using System.Threading.Tasks;

namespace LoanPortal.Core.Interfaces
{
    public interface IBorrowerLinkService
    {
        /// <summary>
        /// Called by the Loan Officer to generate (or regenerate) a shareable borrower link.
        /// If an Active link already exists for this LO, it is revoked first.
        /// </summary>
        Task<GenerateBorrowerLinkResponse> GenerateLinkAsync(GenerateBorrowerLinkRequest request);

        /// <summary>
        /// Public — no auth required.
        /// Resolves a raw URL token into link metadata, LO branding, and any saved draft data.
        /// The borrower calls this when they open the link (before logging in).
        /// </summary>
        Task<ResolveBorrowerLinkResponse> ResolveLinkAsync(string rawToken);

        /// <summary>
        /// Called by the borrower (requires Firebase JWT) after completing each form step.
        /// Upserts the BorrowerEmploymentDocument and increments LastCompletedStep.
        /// </summary>
        Task SaveDraftAsync(SaveBorrowerDraftRequest request, string borrowerFirebaseUid);

        /// <summary>
        /// Called by the borrower (requires Firebase JWT) on final form submission.
        /// Creates a new PreApprovalDocument under the LO's account,
        /// marks the link as Submitted, and emails the Loan Officer.
        /// </summary>
        Task<SubmitBorrowerEmploymentResponse> SubmitAsync(
            SubmitBorrowerEmploymentRequest request,
            string borrowerFirebaseUid);
    }
}

