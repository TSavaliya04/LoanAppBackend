using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
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

    /*public async Task<BorrowerInfoDTO> CreateBorrowerInfo(BorrowerInfoDTO borrowerInfo)
    {
        return await CreateOrUpdateEntity(
            borrowerInfo,
            borrowerInfo.Id,
            borrowerInfo.PreApprovalId,
            FormType.BorrowerInfo,
            doc => doc.BorrowerInfo,
            (doc, value) => doc.BorrowerInfo = value
        );
    }

    public async Task<PurchaseInfoDTO> CreatePurchaseInfo(PurchaseInfoDTO purchaseInfo)
    {
        return await CreateOrUpdateEntity(
            purchaseInfo,
            purchaseInfo.Id,
            purchaseInfo.PreApprovalId,
            FormType.PurchaseInfo,
            doc => doc.PurchaseInfo,
            (doc, value) => doc.PurchaseInfo = value
        );
    }

    public async Task<LenderFeesDTO> CreateLenderFees(LenderFeesDTO feesDTO)
    {
        return await CreateOrUpdateEntity(
            feesDTO,
            feesDTO.Id,
            feesDTO.PreApprovalId,
            FormType.LenderFees,
            doc => doc.LenderFees,
            (doc, value) => doc.LenderFees = value
        );
    }

    public async Task<PrepaidItemsDTO> CreatePrepaidItems(PrepaidItemsDTO prepaidItemsDTO)
    {
        return await CreateOrUpdateEntity(
            prepaidItemsDTO,
            prepaidItemsDTO.Id,
            prepaidItemsDTO.PreApprovalId,
            FormType.PrepaidItems,
            doc => doc.PrepaidItems,
            (doc, value) => doc.PrepaidItems = value
        );
    }

    public async Task<MiscFeesDTO> CreateMiscFees(MiscFeesDTO miscFeesDTO)
    {
        return await CreateOrUpdateEntity(
            miscFeesDTO,
            miscFeesDTO.Id,
            miscFeesDTO.PreApprovalId,
            FormType.MiscFees,
            doc => doc.MiscFees,
            (doc, value) => doc.MiscFees = value
        );
    }*/

    /*public async Task<List<BorrowerIncomeDTO>> CreateBorrowerIncome(List<BorrowerIncomeDTO> borrowerIncomeDTOs)
    {
        if (borrowerIncomeDTOs == null || !borrowerIncomeDTOs.Any())
            throw new ValidationException("Input list cannot be null or empty");

        var preApprovalId = borrowerIncomeDTOs.First().PreApprovalId;
        PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
        if (preApproval.BorrowerIncomes == null)
        {
            preApproval.BorrowerIncomes = new List<BorrowerIncomeDTO>();
        }
        foreach (BorrowerIncomeDTO income in borrowerIncomeDTOs)
        {
            if (income.Id == null || income.Id == Guid.Empty)
            {
                income.Id = Guid.NewGuid();
            }
        }
        //var results = new List<BorrowerIncomeDTO>();

        //foreach (var borrowerIncomeDTO in borrowerIncomeDTOs)
        //{
        //    if (borrowerIncomeDTO.Debts == null)
        //    {
        //        borrowerIncomeDTO.Debts = new List<DebtBreakdownDTO>();
        //    }

        //    if (borrowerIncomeDTO.Id != null && borrowerIncomeDTO.Id != Guid.Empty)
        //    {
        //        var oldEntity = preApproval.BorrowerIncomes.FirstOrDefault(b => b.Id == borrowerIncomeDTO.Id);
        //        if (oldEntity != null)
        //        {
        //            if (oldEntity.Debts == null)
        //                oldEntity.Debts = new List<DebtBreakdownDTO>();

        //            UpdateHelper.UpdateEntity(oldEntity, borrowerIncomeDTO);
        //            oldEntity.UpdatedAt = DateTime.UtcNow;
        //            results.Add(oldEntity);
        //        }
        //        else
        //        {
        //            throw new NotFoundException($"Borrower Income with ID {borrowerIncomeDTO.Id} was not found.");
        //        }
        //    }
        //    else
        //    {
        //        borrowerIncomeDTO.Id = Guid.NewGuid();
        //        borrowerIncomeDTO.CreatedAt = DateTime.UtcNow;
        //        if(borrowerIncomeDTO.Debts != null)
        //        {
        //            foreach (var debt in borrowerIncomeDTO.Debts)
        //            {
        //                if (debt.Id == null || debt.Id == Guid.Empty)
        //                {
        //                    debt.Id = Guid.NewGuid();
        //                }
        //            }
        //        }
        //        preApproval.BorrowerIncomes.Add(borrowerIncomeDTO);
        //        results.Add(borrowerIncomeDTO);
        //    }
        //}

        preApproval.BorrowerIncomes = borrowerIncomeDTOs;
        preApproval.LastSubmittedFormNo = (int)FormType.BorrowerIncomeData;
        preApproval.UpdatedAt = DateTime.UtcNow;
        await _preApprovalRepository.UpdateAsync(preApproval.Id, preApproval);
        return borrowerIncomeDTOs;
    }*/

    /*public async Task<LoanProgramDTO> CreateLoanProgram(LoanProgramDTO loanProgramDto)
    {
        if (loanProgramDto == null)
            throw new ValidationException("LoanProgramDTO cannot be null");
        if (loanProgramDto.PreApprovalId == null || loanProgramDto.PreApprovalId == Guid.Empty)
            throw new ValidationException("PreApprovalId cannot be null or empty");

        var preApprovalId = loanProgramDto.PreApprovalId;
        var entityId = loanProgramDto.Id;
        var t = _loginUserDetails;

        var document = await _preApprovalRepository.GetByIdAsync(preApprovalId);
        if (document == null)
        {
            throw new NotFoundException($"Pre Approval with ID {preApprovalId} was not found.");
        }

        document.UpdatedAt = DateTime.UtcNow;

        if (!entityId.HasValue || entityId.Value == Guid.Empty)
        {
            loanProgramDto.Id = Guid.NewGuid();
            loanProgramDto.CreatedAt = DateTime.UtcNow;
            loanProgramDto.PreApprovalId = document.Id;
            document.LastSubmittedFormNo = (int)FormType.LoanProgram;
            document.LoanProgram = loanProgramDto;
        }
        else
        {
            // Update only the properties that are provided in the new entity
            var existingEntity = document.LoanProgram;
            if (existingEntity != null)
            {
                foreach (var prop in typeof(LoanProgramDTO).GetProperties())
                {
                    var newValue = prop.GetValue(loanProgramDto);
                    if (newValue != null && !prop.Name.Equals("Id", StringComparison.OrdinalIgnoreCase))
                    {
                        prop.SetValue(existingEntity, newValue);
                    }
                }
                existingEntity.UpdatedAt = DateTime.UtcNow;
                document.LoanProgram = existingEntity;
            }
            else
            {
                loanProgramDto.UpdatedAt = DateTime.UtcNow;
                document.LoanProgram = loanProgramDto;
            }
        }
        await _preApprovalRepository.UpdateAsync(document.Id, document);
        return document.LoanProgram;
    }*/

    /*public async Task<List<DebtBreakdownDTO>> CreateDebtBreakdown(List<DebtBreakdownDTO> debtDtos)
    {
        if (debtDtos == null || !debtDtos.Any())
            throw new ValidationException("Input list cannot be null or empty");

        var preApprovalId = debtDtos.First().PreApprovalId;
        PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
        if (preApproval.DebtBreakdowns == null)
        {
            preApproval.DebtBreakdowns = new List<DebtBreakdownDTO>();
        }

        var results = new List<DebtBreakdownDTO>();

        foreach (var debtDto in debtDtos)
        {
            if (debtDto.Id != null && debtDto.Id != Guid.Empty)
            {
                var oldEntity = preApproval.DebtBreakdowns.FirstOrDefault(d => d.Id == debtDto.Id);
                if (oldEntity != null)
                {
                    UpdateHelper.UpdateEntity(oldEntity, debtDto);
                    oldEntity.UpdatedAt = DateTime.UtcNow;
                    results.Add(oldEntity);
                }
                else
                {
                    throw new NotFoundException($"Debt Breakdown with ID {debtDto.Id} was not found.");
                }
            }
            else
            {
                debtDto.Id = Guid.NewGuid();
                debtDto.CreatedAt = DateTime.UtcNow;
                preApproval.DebtBreakdowns.Add(debtDto);
                results.Add(debtDto);
            }
        }

        preApproval.UpdatedAt = DateTime.UtcNow;
        await _preApprovalRepository.UpdateAsync(preApproval.Id, preApproval);
        return results;
    }*/

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
            if(status != 0)
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
                string token = "sp=racwdli&st=2025-10-01T17:14:14Z&se=2026-10-02T01:29:14Z&sv=2024-11-04&sr=c&sig=tbTUGvn1%2F7uCyUtIvk8coOlzS9RD%2FGKBtdNyVxLR33Q%3D";
                agent.Profile = agent.Profile + "?" + token;
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

    private async Task<T> CreateOrUpdateEntity<T>(
        T entity,
        Guid? id,
        Guid? preApprovalId,
        FormType formType,
        Func<PreApprovalDocument, T> getValue,
        Action<PreApprovalDocument, T> setValue
    )
        where T : class
    {
        if (typeof(T) != typeof(BorrowerInfoDTO) && !preApprovalId.HasValue)
            throw new ValidationException("PreApproval Id can't be null or empty");
        if (typeof(T) == typeof(BorrowerInfoDTO) && id.HasValue && !preApprovalId.HasValue)
            throw new ValidationException("PreApproval Id can't be null or empty");

        var idProp = typeof(T).GetProperty("Id");
        var createdAtProp = typeof(T).GetProperty("CreatedAt");
        var preApprovalIdProp = typeof(T).GetProperty("PreApprovalId");
        var entUpdatedAtProp = typeof(T).GetProperty("UpdatedAt");
        var entityId = idProp.GetValue(entity) as Guid?;

        PreApprovalDocument document = null;

        if (!preApprovalId.HasValue)
        {
            // Create new document
            document = new PreApprovalDocument
            {
                Id = Guid.NewGuid(),
                UserId = _loginUserDetails.UserID,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                LastSubmittedFormNo = (int)formType,
            };

            if (!entityId.HasValue || entityId.Value == Guid.Empty)
            {
                idProp.SetValue(entity, Guid.NewGuid());
                createdAtProp.SetValue(entity, DateTime.UtcNow);
                preApprovalIdProp.SetValue(entity, document.Id);
            }

            setValue(document, entity);
            await _preApprovalRepository.InsertAsync(document);
        }
        else
        {
            document = await _preApprovalRepository.GetByIdAsync(preApprovalId.Value);
            if (document == null)
                throw new NotFoundException($"Pre Approval with ID {preApprovalId} was not found.");

            document.UpdatedAt = DateTime.UtcNow;

            // If entity does not exist, insert it
            if (!entityId.HasValue || entityId.Value == Guid.Empty)
            {
                idProp.SetValue(entity, Guid.NewGuid());
                // createdAtProp.SetValue(entity, DateTime.UtcNow);
                preApprovalIdProp.SetValue(entity, document.Id);
            }
            // Always set UpdatedAt
            entUpdatedAtProp.SetValue(entity, DateTime.UtcNow);

            // Replace the entity (insert or replace)
            setValue(document, entity);

            // Optionally update LastSubmittedFormNo if needed
            document.LastSubmittedFormNo = (int)formType;

            await _preApprovalRepository.UpdateAsync(document.Id, document);
        }
        return getValue(document);
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

            return preApprovalDocument;
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

            await _preApprovalRepository.UpdateAsync(id, preApprovalDoc);
            return preApprovalDoc;
        }
        catch(Exception e)
        {
            throw;
        }
    }
}
