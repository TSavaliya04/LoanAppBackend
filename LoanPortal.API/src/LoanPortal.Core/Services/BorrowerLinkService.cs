using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Enum;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Services
{
    public class BorrowerLinkService : IBorrowerLinkService
    {
        private readonly ILOEmploymentLinkRepository _portalRepo;
        private readonly IBorrowerEmploymentRepository _draftRepo;
        private readonly IPreApprovalRepository _preApprovalRepo;
        private readonly IUserRepository _userRepo;
        private readonly ILoginUserDetails _loginUserDetails;
        private readonly SMTPConfigModel _smtpConfig;
        private readonly IConfiguration _configuration;

        private string BorrowerPortalBaseUrl =>
            _configuration["BorrowerPortal:BaseUrl"] ?? "https://loansnstuff.com";

        public BorrowerLinkService(
            ILOEmploymentLinkRepository portalRepo,
            IBorrowerEmploymentRepository draftRepo,
            IPreApprovalRepository preApprovalRepo,
            IUserRepository userRepo,
            ILoginUserDetails loginUserDetails,
            IOptions<SMTPConfigModel> smtpConfig,
            IConfiguration configuration)
        {
            _portalRepo = portalRepo;
            _draftRepo = draftRepo;
            _preApprovalRepo = preApprovalRepo;
            _userRepo = userRepo;
            _loginUserDetails = loginUserDetails;
            _smtpConfig = smtpConfig.Value;
            _configuration = configuration;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Get My Portal Link (Loan Officer)
        // ─────────────────────────────────────────────────────────────────────

        public async Task<GetLOEmploymentLinkResponse> GetMyPortalLinkAsync()
        {
            var loanOfficerId = _loginUserDetails.UserID;
            var existingLink = await _portalRepo.GetByLoanOfficerIdAsync(loanOfficerId);
            var now = DateTime.UtcNow;

            if (existingLink == null)
            {
                existingLink = new LOEmploymentLinkDocument
                {
                    Id = Guid.NewGuid(),
                    LoanOfficerId = loanOfficerId,
                    Status = LOEmploymentLinkStatus.Active,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                await _portalRepo.InsertAsync(existingLink);
            }

            var secureUrl = $"{BorrowerPortalBaseUrl}/borrower/{loanOfficerId}";

            return new GetLOEmploymentLinkResponse
            {
                PortalUrl = secureUrl,
                Status = existingLink.Status
            };
        }

        public async Task UpdatePortalStatusAsync(UpdateLOEmploymentLinkStatusRequest request)
        {
            var loanOfficerId = _loginUserDetails.UserID;
            var existingLink = await _portalRepo.GetByLoanOfficerIdAsync(loanOfficerId);

            if (existingLink == null)
                throw new NotFoundException("Portal link not found. Please generate one first.");

            existingLink.Status = request.Status;
            existingLink.UpdatedAt = DateTime.UtcNow;
            await _portalRepo.UpdateAsync(existingLink.Id, existingLink);
        }

        // ─────────────────────────────────────────────────────────────────────
        // Resolve Link (Public — no auth required)
        // ─────────────────────────────────────────────────────────────────────

        public async Task<ResolveBorrowerLinkResponse> ResolveLinkAsync(Guid loanOfficerId)
        {
            var linkDoc = await _portalRepo.GetByLoanOfficerIdAsync(loanOfficerId);
            if (linkDoc == null)
                throw new NotFoundException("Borrower link not found.");

            // Load LO info for welcome screen branding
            var loanOfficer = await _userRepo.GetUserById(loanOfficerId);
            var loanOfficerName = loanOfficer != null
                ? $"{loanOfficer.FirstName} {loanOfficer.LastName}".Trim()
                : "Your Loan Officer";

            return new ResolveBorrowerLinkResponse
            {
                LoanOfficerName     = loanOfficerName,
                LoanOfficerPhone    = loanOfficer?.Phone,
                LoanOfficerProfile  = loanOfficer?.Profile,
                LoanOfficerJobTitle = loanOfficer?.JobTitle,
                LoanOfficerNMLS     = loanOfficer?.NMLS,
                PortalStatus        = linkDoc.Status
            };
        }

        // ─────────────────────────────────────────────────────────────────────
        // Get My Drafts (Borrower)
        // ─────────────────────────────────────────────────────────────────────

        public async Task<List<GetMyDraftsResponseItem>> GetMyDraftsAsync()
        {
            var borrowerId = _loginUserDetails.UserID;
            var drafts = await _draftRepo.GetAllByBorrowerIdAsync(borrowerId);

            var result = new List<GetMyDraftsResponseItem>();
            foreach (var draft in drafts)
            {
                var loanOfficer = await _userRepo.GetUserById(draft.LoanOfficerId);
                var loanOfficerName = loanOfficer != null
                    ? $"{loanOfficer.FirstName} {loanOfficer.LastName}".Trim()
                    : "Loan Officer";

                result.Add(new GetMyDraftsResponseItem
                {
                    DraftId = draft.Id,
                    LoanOfficerId = draft.LoanOfficerId,
                    LoanOfficerName = loanOfficerName,
                    LastCompletedStep = draft.LastCompletedStep,
                    IsSubmitted = draft.IsSubmitted,
                    UpdatedAt = draft.UpdatedAt,
                    DraftData = draft
                });
            }

            return result;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Save Draft (Borrower — step-by-step auto-save)
        // ─────────────────────────────────────────────────────────────────────

        public async Task<SaveBorrowerDraftResponse> SaveDraftAsync(SaveBorrowerDraftRequest request)
        {
            var borrowerId = _loginUserDetails.UserID;
            var now = DateTime.UtcNow;
            
            // Validate that the LO portal is active
            var portal = await _portalRepo.GetByLoanOfficerIdAsync(request.LoanOfficerId);
            if (portal == null)
                throw new NotFoundException("Loan officer portal not found.");
            
            if (portal.Status != LOEmploymentLinkStatus.Active)
                throw new InvalidOperationException("This portal is no longer accepting applications.");

            BorrowerEmploymentDetails? draft = null;

            if (request.DraftId.HasValue)
            {
                draft = await _draftRepo.GetByIdAsync(request.DraftId.Value);
                if (draft != null && draft.BorrowerId != borrowerId)
                    throw new UnauthorizedAccessException("This draft belongs to another borrower.");
                if (draft != null && draft.IsSubmitted)
                    throw new InvalidOperationException("This draft has already been submitted.");
            }

            if (draft == null)
            {
                // First save — create the employment document
                draft = request.StepData;
                draft.Id = Guid.NewGuid();
                draft.LoanOfficerId = request.LoanOfficerId;
                draft.BorrowerId = borrowerId;
                draft.LastCompletedStep = request.CompletedStep;
                draft.IsSubmitted = false;
                draft.CreatedAt = now;
                draft.UpdatedAt = now;

                await _draftRepo.InsertAsync(draft);
            }
            else
            {
                // Merge incoming step data into the existing document
                MergeStepData(draft, request.StepData, request.CompletedStep);
                draft.UpdatedAt = now;

                await _draftRepo.UpdateAsync(draft.Id, draft);
            }

            return new SaveBorrowerDraftResponse
            {
                DraftId = draft.Id
            };
        }

        // ─────────────────────────────────────────────────────────────────────
        // Submit (Borrower — final submission)
        // ─────────────────────────────────────────────────────────────────────

        public async Task<SubmitBorrowerEmploymentResponse> SubmitAsync(SubmitBorrowerEmploymentRequest request)
        {
            var borrowerId = _loginUserDetails.UserID;
            var now = DateTime.UtcNow;

            var draft = await _draftRepo.GetByIdAsync(request.DraftId);
            if (draft == null)
                throw new NotFoundException("Draft not found.");

            if (draft.BorrowerId != borrowerId)
                throw new UnauthorizedAccessException("This draft belongs to another borrower.");
            
            if (draft.IsSubmitted)
                throw new InvalidOperationException("This draft has already been submitted.");

            var portal = await _portalRepo.GetByLoanOfficerIdAsync(draft.LoanOfficerId);
            if (portal == null || portal.Status != LOEmploymentLinkStatus.Active)
                throw new InvalidOperationException("This portal is no longer accepting applications.");

            var employmentData = request.EmploymentData;
            
            // Merge final data to ensure everything is captured
            MergeStepData(draft, employmentData, 9);
            draft.UpdatedAt = now;

            // 1. Map borrower employment data → new PreApprovalDocument under LO's userId
            var preApproval = MapToPreApprovalDocument(draft, draft.LoanOfficerId, now);
            await _preApprovalRepo.InsertAsync(preApproval);

            // 2. Finalize the employment document
            draft.PreApprovalId = preApproval.Id;
            draft.IsSubmitted = true;
            await _draftRepo.UpdateAsync(draft.Id, draft);

            // 3. Notify the Loan Officer by email
            await SendLoanOfficerNotificationAsync(draft.LoanOfficerId, draft);

            return new SubmitBorrowerEmploymentResponse
            {
                PreApprovalId = preApproval.Id,
                Message = "Your employment information has been submitted successfully. Your loan officer will be in touch soon."
            };
        }

        // ─────────────────────────────────────────────────────────────────────
        // Private Helpers
        // ─────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Merges data from an incoming step request into an existing employment document.
        /// Only overwrites non-null fields so earlier step data is never lost.
        /// </summary>
        private static void MergeStepData(
            BorrowerEmploymentDetails target,
            BorrowerEmploymentDetails source,
            int completedStep)
        {
            if (source.PersonalInfo != null)
                target.PersonalInfo = source.PersonalInfo;

            if (source.EmploymentCategory.HasValue)
                target.EmploymentCategory = source.EmploymentCategory;

            // ── EmployedByCompany fields ──────────────────────────────────────
            if (source.CurrentEmployers != null && source.CurrentEmployers.Count > 0)
                target.CurrentEmployers = source.CurrentEmployers;

            if (source.IncomeDetails != null)
                target.IncomeDetails = source.IncomeDetails;

            if (source.AdditionalInfo != null)
                target.AdditionalInfo = source.AdditionalInfo;

            // ── Self-Employment fields ────────────────────────────────────────
            if (source.SelfEmployment != null)
                target.SelfEmployment = source.SelfEmployment;

            // ── Military fields ───────────────────────────────────────────────
            if (source.MilitaryService != null)
                target.MilitaryService = source.MilitaryService;

            // ── Shared: Previous Employers ────────────────────────────────────
            if (source.PreviousEmployers != null && source.PreviousEmployers.Count > 0)
                target.PreviousEmployers = source.PreviousEmployers;

            // Always advance LastCompletedStep — never go backwards
            if (completedStep > target.LastCompletedStep)
                target.LastCompletedStep = completedStep;
        }

        /// <summary>
        /// Maps completed borrower employment data into a new PreApprovalDocument
        /// owned by the Loan Officer. The LO can edit/complete the quote from their dashboard.
        /// Monthly income is computed based on employment category.
        /// </summary>
        private static PreApprovalDocument MapToPreApprovalDocument(
            BorrowerEmploymentDetails employment,
            Guid loanOfficerId,
            DateTime now)
        {
            var borrowerName = employment.PersonalInfo != null
                ? $"{employment.PersonalInfo.FirstName} {employment.PersonalInfo.LastName}".Trim()
                : "Borrower";

            // Compute monthly income based on whichever category the borrower selected
            var monthlyIncome = ComputeMonthlyIncome(employment);

            var isRefinance = employment.PersonalInfo?.LoanType == Shared.Enum.LoanType.Refinance;

            var scenario = new ScenarioDTO
            {
                Id            = Guid.NewGuid(),
                ScenarioOrder = 1,
                ScenarioName  = "Scenario 1",
                CreatedAt     = now,
                UpdatedAt     = now
            };

            if (isRefinance)
            {
                scenario.Refinance = new RefinanceScenarioDTO
                {
                    BorrowerInfo = new RefinanceBorrowerInfoDTO
                    {
                        Id           = Guid.NewGuid(),
                        BorrowerName = borrowerName,
                        DateOfBirth  = employment.PersonalInfo?.DateOfBirth,
                        Ssn          = employment.PersonalInfo?.Last4SSN,
                        CreatedAt    = now,
                        UpdatedAt    = now
                    },
                    BorrowerIncomes = new List<RefinanceBorrowerIncomeDTO>
                    {
                        new RefinanceBorrowerIncomeDTO
                        {
                            Id            = Guid.NewGuid(),
                            BorrowerName  = borrowerName,
                            MonthlyIncome = monthlyIncome,
                            Debts         = new List<RefinanceDebtBreakdownDTO>(),
                            CreatedAt     = now,
                            UpdatedAt     = now
                        }
                    }
                };
            }
            else
            {
                scenario.Purchase = new PurchaseScenarioDTO
                {
                    BorrowerInfo = new BorrowerInfoDTO
                    {
                        Id           = Guid.NewGuid(),
                        BorrowerName = borrowerName,
                        DateOfBirth  = employment.PersonalInfo?.DateOfBirth,
                        Ssn          = employment.PersonalInfo?.Last4SSN,
                        CreatedAt    = now,
                        UpdatedAt    = now
                    },
                    BorrowerIncomes = new List<BorrowerIncomeDTO>
                    {
                        new BorrowerIncomeDTO
                        {
                            Id            = Guid.NewGuid(),
                            BorrowerName  = borrowerName,
                            MonthlyIncome = monthlyIncome,
                            Debts         = new List<DebtBreakdownDTO>(),
                            CreatedAt     = now,
                            UpdatedAt     = now
                        }
                    }
                };
            }

            return new PreApprovalDocument
            {
                Id        = Guid.NewGuid(),
                UserId    = loanOfficerId,
                LoanType  = isRefinance ? (int)Shared.Enum.LoanType.Refinance : (int)Shared.Enum.LoanType.Purchase,
                Status    = 0,
                CreatedAt = now,
                UpdatedAt = now,
                Scenarios = new List<ScenarioDTO> { scenario }
            };
        }

        /// <summary>
        /// Dispatches to the correct income calculator based on the borrower's employment category.
        /// </summary>
        private static decimal ComputeMonthlyIncome(BorrowerEmploymentDetails employment)
        {
            return employment.EmploymentCategory switch
            {
                EmploymentCategory.SelfEmployed => ComputeSelfEmployedMonthlyIncome(employment.SelfEmployment),
                EmploymentCategory.Military     => ComputeMilitaryMonthlyIncome(employment.MilitaryService),
                _                               => ComputeEmployedMonthlyIncome(employment.IncomeDetails) // EmployedByCompany + fallback
            };
        }

        /// <summary>Employed by Company: base + bonus + overtime + commission + other (all frequency-adjusted).</summary>
        private static decimal ComputeEmployedMonthlyIncome(BorrowerIncomeInputDTO? income)
        {
            if (income == null) return 0m;

            var total = 0m;
            total += ToMonthly(income.BasePay, income.BasePayFrequency);
            total += ToMonthly(income.BonusPay, income.BonusFrequency);
            total += ToMonthly(income.OvertimePay, income.OvertimeFrequency);
            total += ToMonthly(income.CommissionPay, income.CommissionFrequency);
            total += ToMonthly(income.OtherPay, income.OtherFrequency);
            return Math.Round(total, 2);
        }

        /// <summary>Self-Employed: uses the monthly net income/loss figure directly.</summary>
        private static decimal ComputeSelfEmployedMonthlyIncome(BorrowerSelfEmploymentDTO? se)
        {
            if (se?.IncomeDetails == null) return 0m;
            // MonthlyIncomeOrLoss can be negative (loss); use 0 floor so the system doesn't
            // store negative monthly income — LO will review and adjust.
            return Math.Max(0m, Math.Round(se.IncomeDetails.MonthlyIncomeOrLoss ?? 0m, 2));
        }

        /// <summary>
        /// Military: base pay (frequency-adjusted) + BAH + BAS + VHA + optional pay lines.
        /// All allowance fields are already stored as monthly amounts.
        /// </summary>
        private static decimal ComputeMilitaryMonthlyIncome(BorrowerMilitaryServiceDTO? mil)
        {
            if (mil?.IncomeDetails == null) return 0m;

            var inc = mil.IncomeDetails;
            var total = 0m;

            // Base pay — may be entered at non-monthly frequency
            total += ToMonthly(inc.MonthlyBasePay, inc.BasePayFrequency ?? PayFrequency.Monthly);

            // Allowances — always stored monthly
            total += inc.BAHAmount ?? 0m;
            total += inc.BASAmount ?? 0m;
            total += inc.VHAAmount ?? 0m;

            // Optional additional pays — always stored monthly
            total += inc.FlightPayAmount  ?? 0m;
            total += inc.HazardPayAmount  ?? 0m;
            total += inc.SpecialPayAmount ?? 0m;
            total += inc.OtherPayAmount   ?? 0m;

            return Math.Round(total, 2);
        }


        private static decimal ToMonthly(decimal? amount, PayFrequency? frequency)
        {
            if (!amount.HasValue || amount.Value == 0) return 0m;
            return frequency switch
            {
                PayFrequency.Annual      => amount.Value / 12m,
                PayFrequency.Monthly     => amount.Value,
                PayFrequency.BiWeekly    => amount.Value * 26m / 12m,
                PayFrequency.SemiMonthly => amount.Value * 2m,
                PayFrequency.Weekly      => amount.Value * 52m / 12m,
                _                        => amount.Value  // fallback: treat as monthly
            };
        }

        /// <summary>Sends an email to the Loan Officer notifying them of the borrower submission.</summary>
        private async Task SendLoanOfficerNotificationAsync(
            Guid loanOfficerId,
            BorrowerEmploymentDetails employment)
        {
            try
            {
                var loanOfficer = await _userRepo.GetUserById(loanOfficerId);
                if (loanOfficer == null || string.IsNullOrEmpty(loanOfficer.Email))
                    return;

                var borrowerName = employment.PersonalInfo != null
                    ? $"{employment.PersonalInfo.FirstName} {employment.PersonalInfo.LastName}".Trim()
                    : "Your borrower";

                var subject = $"{borrowerName} has submitted their employment information";
                var body =
                    $"<p>Hello {loanOfficer.FirstName},</p>" +
                    $"<p><strong>{borrowerName}</strong> has completed and submitted their employment information.</p>" +
                    $"<p>A new quote has been created in your dashboard. Please log in to review the details and complete the pre-approval process.</p>" +
                    $"<p>Thanks,<br/>Loans N Stuff Team</p>";

                await SendEmailAsync(new List<string> { loanOfficer.Email }, subject, body);
            }
            catch (Exception ex)
            {
                // Email failure should not block the borrower's submission
                Console.WriteLine($"[BorrowerLinkService] Email notification failed: {ex.Message}");
            }
        }

        private async Task SendEmailAsync(List<string> toEmails, string subject, string body)
        {
            var mail = new MailMessage
            {
                Subject     = subject,
                Body        = body,
                From        = new MailAddress(_smtpConfig.SenderAddress, _smtpConfig.SenderDisplayName),
                IsBodyHtml  = _smtpConfig.IsBodyHTML
            };

            foreach (var email in toEmails)
                mail.To.Add(email);

            var credentials = new NetworkCredential(_smtpConfig.UserName, _smtpConfig.Password);
            var smtpClient = new SmtpClient
            {
                Host                 = _smtpConfig.Host,
                Port                 = _smtpConfig.Port,
                EnableSsl            = _smtpConfig.EnableSSL,
                UseDefaultCredentials = false,
                Credentials          = credentials
            };

            mail.BodyEncoding = Encoding.UTF8;
            await smtpClient.SendMailAsync(mail);
        }
    }
}
