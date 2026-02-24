using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Constants;
using LoanPortal.Shared.Enum;
using MongoDB.Driver;
using static MongoDB.Bson.Serialization.Serializers.SerializerHelper;

namespace LoanPortal.Core.Services;

public class PreApprovalService : IPreApprovalService
{
    private readonly ILoginUserDetails _loginUserDetails;
    private readonly IPreApprovalRepository _preApprovalRepository;
    private readonly IUserRepository _userRepository;

    public PreApprovalService(
        ILoginUserDetails loginUserDetails,
        IPreApprovalRepository preApprovalRepository,
        IUserRepository userRepository
    )
    {
        _loginUserDetails = loginUserDetails;
        _preApprovalRepository = preApprovalRepository;
        _userRepository = userRepository;
    }

    public async Task<PreApprovalDocument> GetPreApproval(Guid id)
    {
        var document = await _preApprovalRepository.GetByIdAsync(id);
        if (document?.Id == null || document.Id == Guid.Empty)
            throw new NotFoundException($"Pre Approval with ID {id} was not found.");
        return document;
    }

    public async Task<List<TopOpportunityDTO>> GetQuoteList(int status)
    {
        try
        {
            var userId = _loginUserDetails.UserID;
            var quotes = await _preApprovalRepository.GetAllAsync(userId);
            if (status != 0)
            {
                quotes = quotes.Where(x => x.Status == status).ToList();
            }
            var results = new List<TopOpportunityDTO>();
            foreach (PreApprovalDocument quote in quotes)
            {
                List<ScenarioData> scenarios = new List<ScenarioData>();
                if (quote.Scenarios != null && quote.Scenarios.Count > 0)
                {
                    foreach (ScenarioDTO scenario in quote.Scenarios)
                    {
                        if (scenario.PurchaseInfo != null)
                        {
                            scenarios.Add(new ScenarioData
                            {
                                AnnualInterestRate = scenario.PurchaseInfo != null ? scenario.PurchaseInfo.AnnualInterestRate : 0,
                                MonthlyTotal = scenario.LoanProgram != null ? scenario.LoanProgram.MonthlyTotal : 0,
                                LoanAmount = scenario.PurchaseInfo != null ? scenario.PurchaseInfo.LoanAmount : 0,
                                LoanProgram = ((LoanProgram)scenario.PurchaseInfo.LoanProgram).ToString() ?? "",
                                isLoanProgramFilled = scenario.LastSubmittedFormNo == (int)FormType.LoanProgram
                            });
                        }
                    }
                }

                results.Add(new TopOpportunityDTO
                {
                    PreApprovalId = quote.Id,
                    CreatedAt = quote.CreatedAt,
                    BorrowerName = quote.Scenarios != null ? quote.Scenarios.First().BorrowerInfo?.BorrowerName : "",
                    Scenarios = scenarios
                });
            }

            return results.OrderByDescending(doc => doc.CreatedAt).ToList();
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task<PreApprovalReport> GetPreApprovalReport(Guid preApprovalId, Guid scenarioId)
    {
        try
        {              
            PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
            ScenarioDTO scenario = preApproval.Scenarios.FirstOrDefault(s => s.Id == scenarioId);
            if (scenario.LoanProgram == null)
            {
                throw new ValidationException("LoanProgram cannot be null");
            }

            UserDTO agent = UserHelper.MaptoUserDTO(await _userRepository.GetUserById(_loginUserDetails.UserID));
            
            if(agent != null && !string.IsNullOrEmpty(agent.Profile))
            {
                agent.Profile = agent.Profile + "?" + IConstants.AzureToken;
            }

            decimal purchasePrice = scenario.LoanProgram.Price.Value;
            decimal downPercent = scenario.PurchaseInfo.DownPayment;
            decimal downAmount = (purchasePrice * downPercent) / 100;
            decimal fma = purchasePrice - downAmount;
            List<string> borrowers = scenario.BorrowerIncomes.Select(b => b.BorrowerName).ToList();
            return new PreApprovalReport
            {
                Date = DateTime.UtcNow,
                PreApprovalId = preApproval.Id,
                BorrowerName = scenario.BorrowerInfo.BorrowerName,
                FirstMortgageAmount = fma,
                DownPaymentPercentage = downPercent,    
                DownPaymentAmount = downAmount,
                PurchasePrice = purchasePrice,
                LoanProgram = scenario.LoanProgram.LoanProgram,
                PropertyType = scenario.PurchaseInfo.PropertyType,
                Borrowers = borrowers,
                LendingCompany = agent.CompanyName,
                OccupancyStatus = scenario.PurchaseInfo.OccupancyStatus,
                AgentName = scenario.LenderFees.AgentName,
                AgentInfo = agent
            };
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task<FHAReport> GetFHAReport(Guid preApprovalId, Guid scenarioId)
    {
        FHAReport report = new FHAReport();
        try
        {
            PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
            ScenarioDTO scenario = preApproval.Scenarios.FirstOrDefault(s => s.Id == scenarioId);
            if (scenario.LoanProgram == null)
            {
                throw new ValidationException("LoanProgram cannot be null");
            }

            UserEntity user = await _userRepository.GetUserById(_loginUserDetails.UserID);
            decimal purchasePrice = scenario.LoanProgram.Price.Value;
            decimal downPercent = scenario.PurchaseInfo.DownPayment;
            decimal downAmount = (purchasePrice * downPercent) / 100;
            decimal upFront = scenario.PurchaseInfo.MipFundingFee;
            decimal upFrontAmount = (purchasePrice * upFront) / 100;
            //decimal otherFinancedItem = ((purchasePrice - downAmount) * 1.75m) / 100;
            decimal totalLoanAmount = purchasePrice - downAmount;

            decimal interestRate = scenario.PurchaseInfo.AnnualInterestRate;
            int loanTerm = scenario.LoanProgram.Term;
            decimal UPMIPAmount = totalLoanAmount * (scenario.LoanProgram.UPMIPRate.Value / 100);
            double MonthlyPILoanAmount = PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount + UPMIPAmount, interestRate, loanTerm);

            decimal realEstateTaxes = scenario.PrepaidItems.PropertyTaxAmount;
            decimal MMI = scenario.LoanProgram.MMI.Value;
            decimal hazInsurancePremium = scenario.PrepaidItems.HazardInsurance;
            decimal monthlyMortgageInsurance = ((totalLoanAmount * MMI) / 100) / 12;

            report.Date = DateTime.UtcNow;
            report.ExpirationDate = report.Date.AddMonths(1);
            report.PreApprovalId = preApproval.Id;
            report.BorrowerName = scenario.BorrowerInfo.BorrowerName;
            report.DownPaymentAmount = downAmount;
            report.SalePrice = purchasePrice;
            report.UpfrontMipPercent = upFront;
            report.UpfrontMipAmount = upFrontAmount;
            report.TotalLoanAmount = totalLoanAmount;
            report.InterestRate = interestRate;
            report.LoanTerm = loanTerm;
            report.PILoanAmount = (decimal)MonthlyPILoanAmount;
            report.PropertyTax = scenario.LoanProgram.MonthlyPropertyTax.Value;
            report.HazardInsurancePremium = scenario.PurchaseInfo.HazardInsurance.Value;
            report.CoverageRate = scenario.PurchaseInfo.MipFundingFee;
            report.MortgageInsurance = scenario.PurchaseInfo.MiPercent.Value;
            report.LoanProgram = scenario.PurchaseInfo.LoanProgram;
            report.HOADues = scenario.PurchaseInfo.AssociationFee.Value;
            report.TotalMonthlyPayment = (report.PILoanAmount + report.PropertyTax + report.HazardInsurancePremium + report.MortgageInsurance + report.HOADues);
            
            EstimatedClosingCostDTO costDto = GetEstClosingCost(scenario, report);
            report.estimatedClosingCost = costDto;   
            return report;
        }             
        catch (Exception ex)
        {
            throw;
        }
    }

    private EstimatedClosingCostDTO GetEstClosingCost(ScenarioDTO scenario, FHAReport report) 
    {
        LenderFeesDTO lenderFees = scenario.LenderFees;
        LoanProgramDTO loanProgram = scenario.LoanProgram;
        PrepaidItemsDTO prepaidItems = scenario.PrepaidItems;
        PurchaseInfoDTO purchaseInfo = scenario.PurchaseInfo;
        MiscFeesDTO miscFees = scenario.MiscFees;

        EstimatedClosingCostDTO estClosingCost = new EstimatedClosingCostDTO();
        
        estClosingCost.DiscountFeePercent = lenderFees.DiscountFeePercentage;
        estClosingCost.DiscountFee = lenderFees.DiscountFee;
        estClosingCost.OriginationFeePercent = lenderFees.LoanOriginationFeePercentage;
        estClosingCost.OriginationFee = lenderFees.LoanOriginationFee;
        estClosingCost.AppraisalFee = lenderFees.AppraisalFee;
        estClosingCost.PrepaidInterestDays = prepaidItems.PrepaidInterestDays;
        estClosingCost.PrepaidInterest = prepaidItems.PrepaidInterestAmount;
        estClosingCost.HazInsPremium = prepaidItems.HazardInsurance;
        estClosingCost.HazInsReserveMonths = prepaidItems.HazardInsuranceMonths;
        estClosingCost.HazInsReserve = prepaidItems.HazardInsuranceReserves;
        estClosingCost.PpdPropTaxesMonths = prepaidItems.PropertyTaxMonths;
        estClosingCost.PpdPropTaxes = prepaidItems.PropertyTaxAmount;
        estClosingCost.EscrowFees = lenderFees.EscrowFees;
        estClosingCost.TitleInsurance = lenderFees.TitleFees.Value;
        estClosingCost.ThirdPartyLenderFee = lenderFees.ThirdPartyLenderFee.Value;
        estClosingCost.EarnestMoneyDeposit = miscFees.EarnestMoneyDeposit;
        estClosingCost.LenderCredit = miscFees.LenderCredit;
        estClosingCost.SellerCredit = miscFees.SellerCredit;
        estClosingCost.MiscFee4 = estClosingCost.MiscFee4;
       
        estClosingCost.TotalEstSettlementCharges = new[]
        {
            estClosingCost.DiscountFee,
            estClosingCost.OriginationFee,
            estClosingCost.AppraisalFee,
            estClosingCost.PrepaidInterest,
            estClosingCost.HazInsPremium,
            estClosingCost.HazInsReserve,
            estClosingCost.PpdPropTaxes,
            estClosingCost.EscrowFees,
            estClosingCost.TitleInsurance,
            estClosingCost.ThirdPartyLenderFee
        }.Sum();

        decimal miscFeesSum = (decimal)new[]
        {
            estClosingCost.MiscFee4,
            estClosingCost.EarnestMoneyDeposit,
            estClosingCost.SellerCredit,
            estClosingCost.LenderCredit
        }.Sum();

        estClosingCost.DownPayment = report.DownPaymentAmount;
        estClosingCost.TotalEstFundToClose = (estClosingCost.TotalEstSettlementCharges + report.DownPaymentAmount) - (miscFeesSum);
        return estClosingCost;
    }

    public async Task<QuickQuote> GetQuickQuote(Guid preApprovalId, Guid scenarioId)
    {
        PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
        ScenarioDTO scenario = preApproval.Scenarios.FirstOrDefault(s => s.Id == scenarioId);
        if (scenario.LoanProgram == null)
        {
            throw new ValidationException("LoanProgram cannot be null");
        }

        QuickQuote quote = new QuickQuote();
        quote.HomeValue = scenario.LoanProgram.Price.Value;
        quote.InterestRate = scenario.LoanProgram.InterestRate;
        decimal downPercent = scenario.PurchaseInfo.DownPayment;
        quote.DownPaymentPercent = downPercent;
        quote.LoanProgram = scenario.PurchaseInfo.LoanProgram;

        decimal purchasePrice = scenario.LoanProgram.Price.Value;
        decimal downAmount = (purchasePrice * downPercent) / 100;
        //decimal otherFinancedItem = ((purchasePrice - downAmount) * 1.75m) / 100;
        decimal totalLoanAmount = purchasePrice - downAmount;
        decimal UPMIPAmount = totalLoanAmount * (scenario.LoanProgram.UPMIPRate.Value / 100);
        double monthlyPI = PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount + UPMIPAmount, quote.InterestRate, scenario.LoanProgram.Term);
        quote.PrincipalAndInterest = (decimal)monthlyPI;

        quote.PropertyTax = scenario.LoanProgram.MonthlyPropertyTax.Value;
        quote.HazardInsurance = scenario.PurchaseInfo.HazardInsurance.Value;
        quote.MortgageInsurance = scenario.PurchaseInfo.MiPercent.Value;
        quote.HoaFee = scenario.PurchaseInfo.AssociationFee.Value;
        quote.MonthlyTotal = (decimal)(quote.PrincipalAndInterest + quote.PropertyTax + quote.HazardInsurance + quote.MortgageInsurance + quote.HoaFee);

        quote.ClosingCosts = (GetEstClosingCost(scenario, new FHAReport())).TotalEstSettlementCharges;
        //LenderFeesDTO lenderFees = preApproval.LenderFees;
        //quote.ClosingCosts = (decimal)(lenderFees.LoanOriginationFee + lenderFees.DiscountFee + lenderFees.UpfrontMip + lenderFees.AppraisalFee + lenderFees.EscrowFees + lenderFees.TitleFees + lenderFees.ThirdPartyLenderFee);
        quote.DownPayment = downAmount;

        PrepaidItemsDTO prePaid = scenario.PrepaidItems;
        //quote.Prepaids = (prePaid.PrepaidInterestAmount + prePaid.HazardInsurance + prePaid.HazardInsuranceReserves + prePaid.PropertyTaxAmount);
        
        MiscFeesDTO miscFees = scenario.MiscFees;
        quote.SellerCredit = miscFees.SellerCredit.Value;
        quote.LenderCredit = miscFees.LenderCredit.Value;
        quote.EarnestMoneyDeposit = miscFees.EarnestMoneyDeposit.Value;
        quote.MiscFee4 = miscFees.MiscFee4.Value;
        decimal miscFeesSum = (quote.SellerCredit + quote.LenderCredit + quote.EarnestMoneyDeposit + quote.MiscFee4);

        quote.TotalRequired = (quote.DownPayment + quote.ClosingCosts) - miscFeesSum;

        return quote;
    }

    public async Task ClonePreApproval(Guid preApprovalId)
    {
        try
        {
            PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
            
            PreApprovalDocument clonedPreApproval = preApproval;
            clonedPreApproval.Id = Guid.NewGuid();
            clonedPreApproval.CreatedAt = DateTime.UtcNow;
            await _preApprovalRepository.InsertAsync(clonedPreApproval);
        }
        catch (Exception ex) { 
        }
    }

    public async Task<PreApprovalDocument> SavePreApproval(PreApprovalDTO preApproval)
    {
        try
        {
            var preApprovalDocument = new PreApprovalDocument
            {
                Id = preApproval.Id ?? Guid.NewGuid(),
                UserId = _loginUserDetails.UserID,
                CreatedAt = preApproval.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = preApproval.UpdatedAt ?? DateTime.UtcNow,
                LastSubmittedFormNo = preApproval.LastSubmittedFormNo ?? 0,
                LastSubmittedScenarioNo = preApproval.LastSubmittedScenarioNo ?? 0,
                Status = preApproval.Status,
                StatusUpdatedAt = preApproval.StatusUpdatedAt,
                Scenarios = preApproval.Scenarios
            };

            if (preApproval.Id.HasValue && preApproval.Id != Guid.Empty)
            {
                await _preApprovalRepository.UpdateAsync(preApprovalDocument.Id, preApprovalDocument);
            }
            else
            {
                await _preApprovalRepository.InsertAsync(preApprovalDocument);
            }

            return await _preApprovalRepository.GetByIdAsync(preApprovalDocument.Id);
        }
        catch (Exception e) 
        {
            throw;
        }
    }

    public async Task DeletePreApproval(List<Guid> preApprovalIds)
    {
        try
        {
            if (preApprovalIds == null || !preApprovalIds.Any())
                throw new ValidationException("PreApproval IDs cannot be null or empty");

            await _preApprovalRepository.DeleteManyAsync(preApprovalIds);
        }
        catch (Exception e)
        {
            throw;
        }
    }

    public async Task<PreApprovalDocument> UpdateApplicationStatus(Guid id, int status)
    {
        try
        {
            var preApprovalDoc = await _preApprovalRepository.GetByIdAsync(id);
            preApprovalDoc.Status = status;
            preApprovalDoc.StatusUpdatedAt = DateTime.Now;

            await _preApprovalRepository.UpdateAsync(id, preApprovalDoc);
            return preApprovalDoc;
        }
        catch(Exception e)
        {
            throw;
        }
    }

    public async Task<DashboardDTO> GetDashboardData()
    {
        try
        {
            var userId = _loginUserDetails.UserID;
            
            // Calculate weekly metrics
            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek); // Sunday
            var endOfWeek = startOfWeek.AddDays(7);
            var startOfLastWeek = startOfWeek.AddDays(-7);
            var endOfLastWeek = startOfWeek;

            // Get quotes created this week (based on CreatedAt)
            var thisWeekPreApprovals = await _preApprovalRepository.GetByDateRange(userId, startOfWeek, endOfWeek);
            var quotesCreatedThisWeek = thisWeekPreApprovals.Count;

            // Get quotes created last week (based on CreatedAt)
            var lastWeekPreApprovals = await _preApprovalRepository.GetByDateRange(userId, startOfLastWeek, endOfLastWeek);
            var quotesCreatedLastWeek = lastWeekPreApprovals.Count;

            // Get pre-approvals that were pre-approved this week (based on PreApprovedAt)
            var thisWeekPreApproved = await _preApprovalRepository.GetByPreApprovedDateRange(userId, startOfWeek, endOfWeek);
            var preApprovedThisWeek = thisWeekPreApproved.Count;

            // Get pre-approvals that were pre-approved last week (based on PreApprovedAt)
            var lastWeekPreApproved = await _preApprovalRepository.GetByPreApprovedDateRange(userId, startOfLastWeek, endOfLastWeek);
            var preApprovedLastWeek = lastWeekPreApproved.Count;

            // Calculate changes
            var quotesCreatedChange = quotesCreatedThisWeek - quotesCreatedLastWeek;
            var preApprovedChange = preApprovedThisWeek - preApprovedLastWeek;

            return new DashboardDTO
            {
                QuotesCreatedThisWeek = quotesCreatedThisWeek,
                QuotesCreatedLastWeek = quotesCreatedLastWeek,
                QuotesCreatedChange = quotesCreatedChange,
                PreApprovedThisWeek = preApprovedThisWeek,
                PreApprovedLastWeek = preApprovedLastWeek,
                PreApprovedChange = preApprovedChange
            };
        }
        catch (Exception e)
        {
            throw;
        }
    }

}
