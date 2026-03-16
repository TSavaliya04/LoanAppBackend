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
                        if (scenario.Purchase?.PurchaseInfo != null)
                        {
                            scenarios.Add(new ScenarioData
                            {
                                AnnualInterestRate = scenario.Purchase.PurchaseInfo.AnnualInterestRate,
                                MonthlyTotal = scenario.Purchase.LoanProgram != null ? scenario.Purchase.LoanProgram.MonthlyTotal : 0,
                                LoanAmount = scenario.Purchase.PurchaseInfo.LoanAmount,
                                LoanProgram = ((LoanProgram)scenario.Purchase.PurchaseInfo.LoanProgram).ToString() ?? "",
                                isLoanProgramFilled = scenario.LastSubmittedFormNo == (int)FormType.LoanProgram
                            });
                        }
                        else if (scenario.Refinance?.RefinanceInfo != null)
                        {
                            scenarios.Add(new ScenarioData
                            {
                                AnnualInterestRate = scenario.Refinance.LoanStructure?.InterestRate ?? 0,
                                MonthlyTotal = scenario.Refinance.LoanProgram?.MonthlyTotal ?? 0,
                                LoanAmount = scenario.Refinance.RefinanceInfo.LoanAmount,
                                LoanProgram = ((LoanProgram)(scenario.Refinance.LoanStructure?.LoanProgram ?? 0)).ToString() ?? "",
                                isLoanProgramFilled = scenario.LastSubmittedFormNo == (int)FormType.LoanProgram
                            });
                        }
                    }
                }

                results.Add(new TopOpportunityDTO
                {
                    PreApprovalId = quote.Id,
                    CreatedAt = quote.CreatedAt,
                    BorrowerName = quote.Scenarios != null
                        ? (quote.Scenarios.First().Purchase?.BorrowerInfo?.BorrowerName
                           ?? quote.Scenarios.First().Refinance?.BorrowerInfo?.BorrowerName)
                        : "",
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

            UserDTO agent = UserHelper.MaptoUserDTO(await _userRepository.GetUserById(_loginUserDetails.UserID));
            
            if(agent != null && !string.IsNullOrEmpty(agent.Profile))
            {
                agent.Profile = agent.Profile + "?" + IConstants.AzureToken;
            }

            if (preApproval.LoanType == 1) // Refinance
            {
                var refi = scenario.Refinance;
                if (refi?.LoanProgram == null)
                    throw new ValidationException("Refinance LoanProgram cannot be null");

                decimal propertyValue = refi.RefinanceInfo?.EstimatedPropertyValue ?? 0;
                decimal loanAmount = refi.RefinanceInfo?.LoanAmount ?? 0;

                return new PreApprovalReport
                {
                    Date = DateTime.UtcNow,
                    PreApprovalId = preApproval.Id,
                    BorrowerName = refi.BorrowerInfo?.BorrowerName,
                    FirstMortgageAmount = loanAmount,
                    DownPaymentPercentage = 0,
                    DownPaymentAmount = 0,
                    PurchasePrice = propertyValue,
                    LoanProgram = refi.LoanStructure?.LoanProgram ?? 0,
                    PropertyType = 0,
                    Borrowers = new List<string>(),
                    LendingCompany = agent?.CompanyName,
                    OccupancyStatus = refi.RefinanceInfo?.OccupancyStatus ?? 0,
                    AgentName = string.Empty,
                    AgentInfo = agent
                };
            }
            else // Purchase
            {
                if (scenario.Purchase?.LoanProgram == null)
                    throw new ValidationException("LoanProgram cannot be null");

                decimal purchasePrice = scenario.Purchase.LoanProgram.Price.Value;
                decimal downPercent = scenario.Purchase.PurchaseInfo.DownPayment;
                decimal downAmount = (purchasePrice * downPercent) / 100;
                decimal fma = purchasePrice - downAmount;
                List<string> borrowers = scenario.Purchase.BorrowerIncomes.Select(b => b.BorrowerName).ToList();

                return new PreApprovalReport
                {
                    Date = DateTime.UtcNow,
                    PreApprovalId = preApproval.Id,
                    BorrowerName = scenario.Purchase.BorrowerInfo.BorrowerName,
                    FirstMortgageAmount = fma,
                    DownPaymentPercentage = downPercent,    
                    DownPaymentAmount = downAmount,
                    PurchasePrice = purchasePrice,
                    LoanProgram = scenario.Purchase.LoanProgram.LoanProgram,
                    PropertyType = scenario.Purchase.PurchaseInfo.PropertyType,
                    Borrowers = borrowers,
                    LendingCompany = agent.CompanyName,
                    OccupancyStatus = scenario.Purchase.PurchaseInfo.OccupancyStatus,
                    AgentName = scenario.Purchase.LenderFees.AgentName,
                    AgentInfo = agent
                };
            }
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
            UserEntity user = await _userRepository.GetUserById(_loginUserDetails.UserID);

            if (preApproval.LoanType == 1) // Refinance
            {
                var refi = scenario.Refinance;
                if (refi?.LoanProgram == null)
                    throw new ValidationException("Refinance LoanProgram cannot be null");

                decimal loanAmount = refi.RefinanceInfo?.LoanAmount ?? 0;
                decimal upFrontPercent = refi.LoanProgram.UPMIPRate ?? 0;
                decimal upFrontAmount = loanAmount * (upFrontPercent / 100);
                decimal interestRate = refi.LoanStructure?.InterestRate ?? 0;
                int loanTerm = refi.LoanProgram.Term;
                decimal UPMIPAmount = loanAmount * (upFrontPercent / 100);
                double monthlyPI = PreApprovalHelper.CalculateMonthlyPI(loanAmount + UPMIPAmount, interestRate, loanTerm);
                decimal MMI = refi.LoanProgram.MMI ?? 0;
                decimal monthlyMortgageInsurance = ((loanAmount * MMI) / 100) / 12;

                report.Date = DateTime.UtcNow;
                report.ExpirationDate = report.Date.AddMonths(1);
                report.PreApprovalId = preApproval.Id;
                report.BorrowerName = refi.BorrowerInfo?.BorrowerName;
                report.DownPaymentAmount = 0;
                report.SalePrice = refi.RefinanceInfo?.EstimatedPropertyValue ?? 0;
                report.UpfrontMipPercent = upFrontPercent;
                report.UpfrontMipAmount = upFrontAmount;
                report.TotalLoanAmount = loanAmount;
                report.InterestRate = interestRate;
                report.LoanTerm = loanTerm;
                report.PILoanAmount = (decimal)monthlyPI;
                report.PropertyTax = refi.LoanStructure?.MonthlyTaxAmount ?? 0;
                report.HazardInsurancePremium = refi.LoanStructure?.HazardInsurance ?? 0;
                report.CoverageRate = upFrontPercent;
                report.MortgageInsurance = refi.LoanStructure?.MI ?? 0;
                report.LoanProgram = refi.LoanStructure?.LoanProgram ?? 0;
                report.HOADues = refi.LoanStructure?.AssociationFee ?? 0;
                report.TotalMonthlyPayment = report.PILoanAmount + report.PropertyTax + report.HazardInsurancePremium + report.MortgageInsurance + report.HOADues;
                // No Purchase-specific closing cost breakdown for Refi — use the stored value
                report.estimatedClosingCost = new EstimatedClosingCostDTO
                {
                    TotalEstSettlementCharges = refi.LoanProgram.ClosingCosts ?? 0
                };
            }
            else // Purchase
            {
                if (scenario.Purchase?.LoanProgram == null)
                    throw new ValidationException("LoanProgram cannot be null");

                decimal purchasePrice = scenario.Purchase.LoanProgram.Price.Value;
                decimal downPercent = scenario.Purchase.PurchaseInfo.DownPayment;
                decimal downAmount = (purchasePrice * downPercent) / 100;
                decimal upFront = scenario.Purchase.PurchaseInfo.MipFundingFee;
                decimal upFrontAmount = (purchasePrice * upFront) / 100;
                decimal totalLoanAmount = purchasePrice - downAmount;

                decimal interestRate = scenario.Purchase.PurchaseInfo.AnnualInterestRate;
                int loanTerm = scenario.Purchase.LoanProgram.Term;
                decimal UPMIPAmount = totalLoanAmount * (scenario.Purchase.LoanProgram.UPMIPRate.Value / 100);
                double MonthlyPILoanAmount = PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount + UPMIPAmount, interestRate, loanTerm);
                decimal MMI = scenario.Purchase.LoanProgram.MMI.Value;
                decimal hazInsurancePremium = scenario.Purchase.PrepaidItems.HazardInsurance;
                decimal monthlyMortgageInsurance = ((totalLoanAmount * MMI) / 100) / 12;

                report.Date = DateTime.UtcNow;
                report.ExpirationDate = report.Date.AddMonths(1);
                report.PreApprovalId = preApproval.Id;
                report.BorrowerName = scenario.Purchase.BorrowerInfo.BorrowerName;
                report.DownPaymentAmount = downAmount;
                report.SalePrice = purchasePrice;
                report.UpfrontMipPercent = upFront;
                report.UpfrontMipAmount = upFrontAmount;
                report.TotalLoanAmount = totalLoanAmount;
                report.InterestRate = interestRate;
                report.LoanTerm = loanTerm;
                report.PILoanAmount = (decimal)MonthlyPILoanAmount;
                report.PropertyTax = scenario.Purchase.LoanProgram.MonthlyPropertyTax.Value;
                report.HazardInsurancePremium = scenario.Purchase.PurchaseInfo.HazardInsurance.Value;
                report.CoverageRate = scenario.Purchase.PurchaseInfo.MipFundingFee;
                report.MortgageInsurance = scenario.Purchase.PurchaseInfo.MiPercent.Value;
                report.LoanProgram = scenario.Purchase.PurchaseInfo.LoanProgram;
                report.HOADues = scenario.Purchase.PurchaseInfo.AssociationFee.Value;
                report.TotalMonthlyPayment = report.PILoanAmount + report.PropertyTax + report.HazardInsurancePremium + report.MortgageInsurance + report.HOADues;
                report.estimatedClosingCost = GetEstClosingCost(scenario, report);
            }

            return report;
        }             
        catch (Exception ex)
        {
            throw;
        }
    }

    private EstimatedClosingCostDTO GetEstClosingCost(ScenarioDTO scenario, FHAReport report) 
    {
        LenderFeesDTO lenderFees = scenario.Purchase.LenderFees;
        LoanProgramDTO loanProgram = scenario.Purchase.LoanProgram;
        PrepaidItemsDTO prepaidItems = scenario.Purchase.PrepaidItems;
        PurchaseInfoDTO purchaseInfo = scenario.Purchase.PurchaseInfo;
        MiscFeesDTO miscFees = scenario.Purchase.MiscFees;

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

        QuickQuote quote = new QuickQuote();

        if (preApproval.LoanType == 1) // Refinance
        {
            var refi = scenario.Refinance;
            if (refi?.LoanProgram == null)
                throw new ValidationException("Refinance LoanProgram cannot be null");

            quote.HomeValue = refi.RefinanceInfo?.EstimatedPropertyValue ?? 0;
            quote.InterestRate = refi.LoanStructure?.InterestRate ?? 0;
            quote.DownPaymentPercent = 0;
            quote.DownPayment = 0;
            quote.LoanProgram = refi.LoanStructure?.LoanProgram ?? 0;

            decimal loanAmount = refi.RefinanceInfo?.LoanAmount ?? 0;
            decimal upmipAmount = loanAmount * ((refi.LoanProgram.UPMIPRate ?? 0) / 100);
            double monthlyPI = PreApprovalHelper.CalculateMonthlyPI(loanAmount + upmipAmount, quote.InterestRate, refi.LoanProgram.Term);
            quote.PrincipalAndInterest = (decimal)monthlyPI;

            quote.PropertyTax = refi.LoanStructure?.MonthlyTaxAmount ?? 0;
            quote.HazardInsurance = refi.LoanStructure?.HazardInsurance ?? 0;
            quote.MortgageInsurance = refi.LoanStructure?.MI ?? 0;
            quote.HoaFee = refi.LoanStructure?.AssociationFee ?? 0;
            quote.MonthlyTotal = (decimal)(quote.PrincipalAndInterest + quote.PropertyTax + quote.HazardInsurance + quote.MortgageInsurance + quote.HoaFee);

            quote.ClosingCosts = refi.LoanProgram.ClosingCosts ?? 0;
            quote.SellerCredit = 0;
            quote.LenderCredit = 0;
            quote.EarnestMoneyDeposit = 0;
            quote.MiscFee4 = 0;
            quote.TotalRequired = quote.ClosingCosts;
        }
        else // Purchase
        {
            if (scenario.Purchase?.LoanProgram == null)
                throw new ValidationException("LoanProgram cannot be null");

            quote.HomeValue = scenario.Purchase.LoanProgram.Price.Value;
            quote.InterestRate = scenario.Purchase.LoanProgram.InterestRate;
            decimal downPercent = scenario.Purchase.PurchaseInfo.DownPayment;
            quote.DownPaymentPercent = downPercent;
            quote.LoanProgram = scenario.Purchase.PurchaseInfo.LoanProgram;

            decimal purchasePrice = scenario.Purchase.LoanProgram.Price.Value;
            decimal downAmount = (purchasePrice * downPercent) / 100;
            decimal totalLoanAmount = purchasePrice - downAmount;
            decimal UPMIPAmount = totalLoanAmount * (scenario.Purchase.LoanProgram.UPMIPRate.Value / 100);
            double monthlyPI = PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount + UPMIPAmount, quote.InterestRate, scenario.Purchase.LoanProgram.Term);
            quote.PrincipalAndInterest = (decimal)monthlyPI;

            quote.PropertyTax = scenario.Purchase.LoanProgram.MonthlyPropertyTax.Value;
            quote.HazardInsurance = scenario.Purchase.PurchaseInfo.HazardInsurance.Value;
            quote.MortgageInsurance = scenario.Purchase.PurchaseInfo.MiPercent.Value;
            quote.HoaFee = scenario.Purchase.PurchaseInfo.AssociationFee.Value;
            quote.MonthlyTotal = (decimal)(quote.PrincipalAndInterest + quote.PropertyTax + quote.HazardInsurance + quote.MortgageInsurance + quote.HoaFee);

            quote.ClosingCosts = (GetEstClosingCost(scenario, new FHAReport())).TotalEstSettlementCharges;
            quote.DownPayment = downAmount;

            MiscFeesDTO miscFees = scenario.Purchase.MiscFees;
            quote.SellerCredit = miscFees.SellerCredit.Value;
            quote.LenderCredit = miscFees.LenderCredit.Value;
            quote.EarnestMoneyDeposit = miscFees.EarnestMoneyDeposit.Value;
            quote.MiscFee4 = miscFees.MiscFee4.Value;
            decimal miscFeesSum = (quote.SellerCredit + quote.LenderCredit + quote.EarnestMoneyDeposit + quote.MiscFee4);
            quote.TotalRequired = (quote.DownPayment + quote.ClosingCosts) - miscFeesSum;
        }

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
                LoanType = preApproval.LoanType,
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
