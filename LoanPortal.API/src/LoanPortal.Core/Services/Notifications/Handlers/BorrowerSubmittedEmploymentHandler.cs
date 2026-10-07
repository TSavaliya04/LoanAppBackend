using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Shared.Enum;

namespace LoanPortal.Core.Services.Notifications.Handlers
{
    public class BorrowerSubmittedEmploymentHandler : INotificationEventHandler
    {
        public NotificationType HandledType => NotificationType.BorrowerSubmittedEmployment;

        public Task<IEnumerable<NotificationDocument>> BuildNotificationsAsync(NotificationContext context)
        {
            if (context.EmploymentDraft == null || context.QuoteId == null)
            {
                return Task.FromResult<IEnumerable<NotificationDocument>>(Array.Empty<NotificationDocument>());
            }

            var draft = context.EmploymentDraft;
            
            var borrowerName = draft.PersonalInfo != null
                ? $"{draft.PersonalInfo.FirstName} {draft.PersonalInfo.LastName}".Trim()
                : "A borrower";

            string salaryType = "N/A";
            if (draft.EmploymentCategory == EmploymentCategory.SelfEmployed)
            {
                salaryType = "Self-Employed";
            }
            else if (draft.EmploymentCategory == EmploymentCategory.Military)
            {
                salaryType = "Military";
            }
            else if (draft.EmploymentCategory == EmploymentCategory.EmployedByCompany)
            {
                salaryType = (draft.IncomeDetails?.IsSalary ?? false) ? "Salary" : "Hourly";
            }
            else if (draft.IncomeDetails != null)
            {
                salaryType = draft.IncomeDetails.IsSalary ? "Salary" : "Hourly";
            }
            
            var metadata = new Dictionary<string, string>
            {
                ["quoteId"]      = context.QuoteId.Value.ToString(),
                ["borrowerName"] = borrowerName,
                ["salaryType"]   = salaryType
            };

            var notification = new NotificationDocument
            {
                Id              = Guid.NewGuid(),
                UserId          = context.Actor.Id,
                Type            = NotificationType.BorrowerSubmittedEmployment,
                Title           = "Employment Information Submitted",
                Message         = $"{borrowerName} has submitted their employment information.",
                IsRead          = false,
                CreatedAt       = DateTime.UtcNow,
                RelatedEntityId = context.QuoteId.Value,
                Metadata        = metadata
            };

            return Task.FromResult<IEnumerable<NotificationDocument>>(new[] { notification });
        }
    }
}

