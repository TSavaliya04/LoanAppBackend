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
        private readonly IBorrowerLinkRepository _borrowerLinkRepo;
        private readonly IBorrowerEmploymentRepository _borrowerEmploymentRepo;
        private readonly IPreApprovalRepository _preApprovalRepo;
        private readonly IUserRepository _userRepo;
        private readonly ILoginUserDetails _loginUserDetails;
        private readonly SMTPConfigModel _smtpConfig;
        private readonly IConfiguration _configuration;

        // Link validity period (configurable — defaults to 30 days)
        private int LinkExpiryDays =>
            int.TryParse(_configuration["BorrowerPortal:LinkExpiryDays"], out var days) ? days : 30;

        private string BorrowerPortalBaseUrl =>
            _configuration["BorrowerPortal:BaseUrl"] ?? "https://loansnstuff.com";

        public BorrowerLinkService(
            IBorrowerLinkRepository borrowerLinkRepo,
            IBorrowerEmploymentRepository borrowerEmploymentRepo,
            IPreApprovalRepository preApprovalRepo,
            IUserRepository userRepo,
            ILoginUserDetails loginUserDetails,
            IOptions<SMTPConfigModel> smtpConfig,
            IConfiguration configuration)
        {
            _borrowerLinkRepo = borrowerLinkRepo;
            _borrowerEmploymentRepo = borrowerEmploymentRepo;
            _preApprovalRepo = preApprovalRepo;
            _userRepo = userRepo;
            _loginUserDetails = loginUserDetails;
            _smtpConfig = smtpConfig.Value;
            _configuration = configuration;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Generate Link (Loan Officer)
        // ─────────────────────────────────────────────────────────────────────

        public async Task<GenerateBorrowerLinkResponse> GenerateLinkAsync(GenerateBorrowerLinkRequest request)
        {
            var loanOfficerId = _loginUserDetails.UserID;

            // Revoke any existing Active link for this Loan Officer
            var existingLink = await _borrowerLinkRepo.GetActiveByLoanOfficerIdAsync(loanOfficerId);
            if (existingLink != null)
            {
                existingLink.Status = BorrowerLinkStatus.Revoked;
                existingLink.UpdatedAt = DateTime.UtcNow;
                await _borrowerLinkRepo.UpdateAsync(existingLink.Id, existingLink);
            }

            // Generate cryptographically secure opaque token
            var rawTokenBytes = RandomNumberGenerator.GetBytes(32);
            var rawToken = Convert.ToBase64String(rawTokenBytes)
                .Replace('+', '-')   // make URL-safe
                .Replace('/', '_')
                .TrimEnd('=');

            var tokenHash = ComputeSha256Hash(rawToken);

            var now = DateTime.UtcNow;
            var linkDoc = new BorrowerLinkDocument
            {
                Id                = Guid.NewGuid(),
                LoanOfficerId     = loanOfficerId,
                TokenHash         = tokenHash,
                Status            = BorrowerLinkStatus.Active,
                BorrowerEmailHint = request.BorrowerEmailHint?.Trim(),
                ExpiresAt         = now.AddDays(LinkExpiryDays),
                CreatedAt         = now,
                UpdatedAt         = now
            };

            await _borrowerLinkRepo.InsertAsync(linkDoc);

            var secureUrl = $"{BorrowerPortalBaseUrl}/borrower/{Uri.EscapeDataString(rawToken)}";

            return new GenerateBorrowerLinkResponse
            {
                LinkId    = linkDoc.Id,
                SecureUrl = secureUrl,
                ExpiresAt = linkDoc.ExpiresAt
            };
        }

        // ─────────────────────────────────────────────────────────────────────
        // Resolve Link (Public — no auth required)
        // ─────────────────────────────────────────────────────────────────────

        public async Task<ResolveBorrowerLinkResponse> ResolveLinkAsync(string rawToken)
        {
            var tokenHash = ComputeSha256Hash(rawToken);
            var linkDoc = await _borrowerLinkRepo.GetByTokenHashAsync(tokenHash);

            if (linkDoc == null)
                throw new NotFoundException("Borrower link not found.");

            if (linkDoc.Status == BorrowerLinkStatus.Revoked)
                throw new InvalidOperationException("This link has been revoked. Please ask your loan officer for a new link.");

            if (linkDoc.Status == BorrowerLinkStatus.Submitted)
                throw new InvalidOperationException("This link has already been submitted. Your information has been received.");

            // Check expiry — mark as Expired if past due
            if (DateTime.UtcNow > linkDoc.ExpiresAt)
            {
                if (linkDoc.Status == BorrowerLinkStatus.Active)
                {
                    linkDoc.Status = BorrowerLinkStatus.Expired;
                    linkDoc.UpdatedAt = DateTime.UtcNow;
                    await _borrowerLinkRepo.UpdateAsync(linkDoc.Id, linkDoc);
                }
                throw new InvalidOperationException("This link has expired. Please ask your loan officer for a new link.");
            }

            // Load LO info for welcome screen branding
            var loanOfficer = await _userRepo.GetUserById(linkDoc.LoanOfficerId);
            var loanOfficerName = loanOfficer != null
                ? $"{loanOfficer.FirstName} {loanOfficer.LastName}".Trim()
                : "Your Loan Officer";

            // Load draft if borrower has already started
            var draftData = await _borrowerEmploymentRepo.GetByLinkIdAsync(linkDoc.Id);

            return new ResolveBorrowerLinkResponse
            {
                LinkId           = linkDoc.Id,
                LoanOfficerName  = loanOfficerName,
                LoanOfficerPhone = loanOfficer?.Phone,
                Status           = linkDoc.Status,
                LastCompletedStep = draftData?.LastCompletedStep ?? 0,
                DraftData        = draftData
            };
        }

        // ─────────────────────────────────────────────────────────────────────
        // Save Draft (Borrower — step-by-step auto-save)
        // ─────────────────────────────────────────────────────────────────────

        public async Task SaveDraftAsync(SaveBorrowerDraftRequest request, string borrowerFirebaseUid)
        {
            var linkDoc = await GetValidatedActiveLinkAsync(request.LinkId);

            // Bind borrower Firebase UID on first save (locks the draft to this person)
            if (string.IsNullOrEmpty(linkDoc.BorrowerFirebaseUid))
            {
                linkDoc.BorrowerFirebaseUid = borrowerFirebaseUid;
                linkDoc.UpdatedAt = DateTime.UtcNow;
                await _borrowerLinkRepo.UpdateAsync(linkDoc.Id, linkDoc);
            }
            else if (linkDoc.BorrowerFirebaseUid != borrowerFirebaseUid)
            {
                // Different borrower trying to access this link
                throw new UnauthorizedAccessException("This link belongs to another borrower.");
            }

            var now = DateTime.UtcNow;
            var existing = await _borrowerEmploymentRepo.GetByLinkIdAsync(linkDoc.Id);

            if (existing == null)
            {
                // First save — create the employment document
                var newDoc = request.StepData;
                newDoc.Id = Guid.NewGuid();
                newDoc.LinkId = linkDoc.Id;
                newDoc.LastCompletedStep = request.CompletedStep;
                newDoc.IsSubmitted = false;
                newDoc.CreatedAt = now;
                newDoc.UpdatedAt = now;

                await _borrowerEmploymentRepo.InsertAsync(newDoc);
            }
            else
            {
                // Merge incoming step data into the existing document
                MergeStepData(existing, request.StepData, request.CompletedStep);
                existing.UpdatedAt = now;

                await _borrowerEmploymentRepo.UpdateAsync(existing.Id, existing);
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // Submit (Borrower — final submission)
        // ─────────────────────────────────────────────────────────────────────

        public async Task<SubmitBorrowerEmploymentResponse> SubmitAsync(
            SubmitBorrowerEmploymentRequest request,
            string borrowerFirebaseUid)
        {
            var linkDoc = await GetValidatedActiveLinkAsync(request.LinkId);

            // Validate the same borrower who was drafting is submitting
            if (!string.IsNullOrEmpty(linkDoc.BorrowerFirebaseUid) &&
                linkDoc.BorrowerFirebaseUid != borrowerFirebaseUid)
            {
                throw new UnauthorizedAccessException("This link belongs to another borrower.");
            }

            var now = DateTime.UtcNow;
            var employmentData = request.EmploymentData;

            // 1. Map borrower employment data → new PreApprovalDocument under LO's userId
            var preApproval = MapToPreApprovalDocument(employmentData, linkDoc.LoanOfficerId, now);
            await _preApprovalRepo.InsertAsync(preApproval);

            // 2. Finalize the employment document
            var existing = await _borrowerEmploymentRepo.GetByLinkIdAsync(linkDoc.Id);
            if (existing == null)
            {
                employmentData.Id = Guid.NewGuid();
                employmentData.LinkId = linkDoc.Id;
                employmentData.PreApprovalId = preApproval.Id;
                employmentData.IsSubmitted = true;
                employmentData.LastCompletedStep = 9;
                employmentData.CreatedAt = now;
                employmentData.UpdatedAt = now;
                await _borrowerEmploymentRepo.InsertAsync(employmentData);
            }
            else
            {
                MergeStepData(existing, employmentData, 9);
                existing.PreApprovalId = preApproval.Id;
                existing.IsSubmitted = true;
                existing.UpdatedAt = now;
                await _borrowerEmploymentRepo.UpdateAsync(existing.Id, existing);
            }

            // 3. Mark the link as Submitted
            linkDoc.Status = BorrowerLinkStatus.Submitted;
            linkDoc.PreApprovalId = preApproval.Id;
            linkDoc.BorrowerFirebaseUid = borrowerFirebaseUid;
            linkDoc.UpdatedAt = now;
            await _borrowerLinkRepo.UpdateAsync(linkDoc.Id, linkDoc);

            // 4. Notify the Loan Officer by email
            await SendLoanOfficerNotificationAsync(linkDoc.LoanOfficerId, employmentData);

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
        /// Validates a link is Active and not expired. Throws descriptive exceptions on failure.
        /// </summary>
        private async Task<BorrowerLinkDocument> GetValidatedActiveLinkAsync(Guid linkId)
        {
            var linkDoc = await _borrowerLinkRepo.GetByIdAsync(linkId);
            if (linkDoc == null)
                throw new NotFoundException("Borrower link not found.");

            if (linkDoc.Status == BorrowerLinkStatus.Submitted)
                throw new InvalidOperationException("This link has already been submitted.");

            if (linkDoc.Status == BorrowerLinkStatus.Revoked)
                throw new InvalidOperationException("This link has been revoked.");

            if (linkDoc.Status == BorrowerLinkStatus.Expired || DateTime.UtcNow > linkDoc.ExpiresAt)
                throw new InvalidOperationException("This link has expired.");

            return linkDoc;
        }

        /// <summary>
        /// Merges data from an incoming step request into an existing employment document.
        /// Only overwrites non-null fields so earlier step data is never lost.
        /// </summary>
        private static void MergeStepData(
            BorrowerEmploymentDocument target,
            BorrowerEmploymentDocument source,
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
            BorrowerEmploymentDocument employment,
            Guid loanOfficerId,
            DateTime now)
        {
            var borrowerName = employment.PersonalInfo != null
                ? $"{employment.PersonalInfo.FirstName} {employment.PersonalInfo.LastName}".Trim()
                : "Borrower";

            // Compute monthly income based on whichever category the borrower selected
            var monthlyIncome = ComputeMonthlyIncome(employment);

            var borrowerIncome = new BorrowerIncomeDTO
            {
                Id            = Guid.NewGuid(),
                BorrowerName  = borrowerName,
                MonthlyIncome = monthlyIncome,
                Debts         = new List<DebtBreakdownDTO>(),
                CreatedAt     = now,
                UpdatedAt     = now
            };

            var borrowerInfo = new BorrowerInfoDTO
            {
                Id           = Guid.NewGuid(),
                BorrowerName = borrowerName,
                DateOfBirth  = employment.PersonalInfo?.DateOfBirth,
                Ssn          = employment.PersonalInfo?.Last4SSN,
                CreatedAt    = now,
                UpdatedAt    = now
            };

            var scenario = new ScenarioDTO
            {
                Id            = Guid.NewGuid(),
                ScenarioOrder = 1,
                ScenarioName  = "Scenario 1",
                CreatedAt     = now,
                UpdatedAt     = now,
                Purchase = new PurchaseScenarioDTO
                {
                    BorrowerInfo    = borrowerInfo,
                    BorrowerIncomes = new List<BorrowerIncomeDTO> { borrowerIncome }
                }
            };

            return new PreApprovalDocument
            {
                Id        = Guid.NewGuid(),
                UserId    = loanOfficerId,
                LoanType  = (int)LoanType.Purchase,
                Status    = 0,
                CreatedAt = now,
                UpdatedAt = now,
                Scenarios = new List<ScenarioDTO> { scenario }
            };
        }

        /// <summary>
        /// Dispatches to the correct income calculator based on the borrower's employment category.
        /// </summary>
        private static decimal ComputeMonthlyIncome(BorrowerEmploymentDocument employment)
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
            BorrowerEmploymentDocument employment)
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

        /// <summary>Computes the SHA-256 hex hash of a raw string token.</summary>
        private static string ComputeSha256Hash(string rawToken)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawToken));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }
    }
}
