using MongoDB.Driver;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Shared.Enum;

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

    public async Task<BorrowerInfoDTO> CreateBorrowerInfo(BorrowerInfoDTO borrowerInfo)
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
    }

    public async Task<List<BorrowerIncomeDTO>> CreateBorrowerIncome(List<BorrowerIncomeDTO> borrowerIncomeDTOs)
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
        /*var results = new List<BorrowerIncomeDTO>();

        foreach (var borrowerIncomeDTO in borrowerIncomeDTOs)
        {
            if (borrowerIncomeDTO.Debts == null)
            {
                borrowerIncomeDTO.Debts = new List<DebtBreakdownDTO>();
            }

            if (borrowerIncomeDTO.Id != null && borrowerIncomeDTO.Id != Guid.Empty)
            {
                var oldEntity = preApproval.BorrowerIncomes.FirstOrDefault(b => b.Id == borrowerIncomeDTO.Id);
                if (oldEntity != null)
                {
                    if (oldEntity.Debts == null)
                        oldEntity.Debts = new List<DebtBreakdownDTO>();

                    UpdateHelper.UpdateEntity(oldEntity, borrowerIncomeDTO);
                    oldEntity.UpdatedAt = DateTime.UtcNow;
                    results.Add(oldEntity);
                }
                else
                {
                    throw new NotFoundException($"Borrower Income with ID {borrowerIncomeDTO.Id} was not found.");
                }
            }
            else
            {
                borrowerIncomeDTO.Id = Guid.NewGuid();
                borrowerIncomeDTO.CreatedAt = DateTime.UtcNow;
                if(borrowerIncomeDTO.Debts != null)
                {
                    foreach (var debt in borrowerIncomeDTO.Debts)
                    {
                        if (debt.Id == null || debt.Id == Guid.Empty)
                        {
                            debt.Id = Guid.NewGuid();
                        }
                    }
                }
                preApproval.BorrowerIncomes.Add(borrowerIncomeDTO);
                results.Add(borrowerIncomeDTO);
            }
        }*/

        preApproval.BorrowerIncomes = borrowerIncomeDTOs;
        preApproval.LastSubmittedFormNo = (int)FormType.BorrowerIncomeData;
        preApproval.UpdatedAt = DateTime.UtcNow;
        await _preApprovalRepository.UpdateAsync(preApproval.Id, preApproval);
        return borrowerIncomeDTOs;
    }

    public async Task<PreApprovalDocument> GetPreApproval(Guid id)
    {
        var document = await _preApprovalRepository.GetByIdAsync(id);
        if (document?.BorrowerInfo == null)
            throw new NotFoundException($"Pre Approval with ID {id} was not found.");
        return document;
    }

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

    public async Task<LoanProgramDTO> CreateLoanProgram(LoanProgramDTO loanProgramDto)
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
    }

    public async Task<List<TopOpportunityDTO>> GetTopOpportunities()
    {
        try
        {
            var userId = _loginUserDetails.UserID;
            var topOpportunities = await _preApprovalRepository.GetAllAsync(userId);

            return topOpportunities.Select(doc => new TopOpportunityDTO
            {
                PreApprovalId = doc.Id,
                BorrowerName = doc.BorrowerInfo?.BorrowerName,
                LoanProgram = doc.BorrowerInfo?.LoanProgram,
                AgentName = doc.LenderFees?.AgentName,
                Borrowers = doc.BorrowerIncomes?.ToList()
            }).ToList();
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task<PreApprovalReport> GetPreApprovalReport(Guid preApprovalId)
    {
        try
        {              
            PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
            UserDTO agent = UserHelper.MaptoUserDTO(await _userRepository.GetUserById(_loginUserDetails.UserID));
            decimal purchasePrice = preApproval.LoanProgram.Price.Value;
            decimal downPercent = preApproval.PurchaseInfo.DownPayment;
            decimal downAmount = (purchasePrice * downPercent) / 100;
            decimal fma = purchasePrice - downAmount;
            List<string> borrowers = preApproval.BorrowerIncomes.Select(b => b.BorrowerName).ToList();
            return new PreApprovalReport
            {
                Date = DateTime.UtcNow,
                PreApprovalId = preApproval.Id,
                BorrowerName = preApproval.BorrowerInfo.BorrowerName,
                FirstMortgageAmount = fma,
                DownPaymentPercentage = downPercent,    
                DownPaymentAmount = downAmount,
                PurchasePrice = purchasePrice,
                LoanProgram = preApproval.LoanProgram.LoanProgram,
                PropertyType = preApproval.BorrowerInfo.PropertyType,
                Borrowers = borrowers,
                LendingCompany = agent.CompanyName,
                OccupancyStatus = preApproval.BorrowerInfo.OccupancyStatus,
                AgentName = preApproval.LenderFees.AgentName,
                AgentInfo = agent
            };
        }
        catch (Exception ex)
        {
            throw;
        }
    }

    public async Task<FHAReport> GetFHAReport(Guid preApprovalId)
    {
        FHAReport report = new FHAReport();
        try
        {
            PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
            UserEntity user = await _userRepository.GetUserById(_loginUserDetails.UserID);
            decimal purchasePrice = preApproval.LoanProgram.Price.Value;
            decimal downPercent = preApproval.PurchaseInfo.DownPayment;
            decimal downAmount = (purchasePrice * downPercent) / 100;
            decimal upFront = preApproval.PurchaseInfo.MipFundingFee;
            decimal upFrontAmount = (purchasePrice * upFront) / 100;
            decimal otherFinancedItem = ((purchasePrice - downAmount) * 1.75m) / 100;
            decimal totalLoanAmount = (purchasePrice - downAmount) + otherFinancedItem;

            decimal interestRate = preApproval.PurchaseInfo.AnnualInterestRate;
            int loanTerm = preApproval.LoanProgram.Term;
            double MonthlyPILoanAmount = PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount, interestRate, loanTerm);

            decimal realEstateTaxes = preApproval.PrepaidItems.PropertyTaxAmount;
            decimal MMI = preApproval.LoanProgram.MMI.Value;
            decimal hazInsurancePremium = preApproval.PrepaidItems.HazardInsurance;
            decimal monthlyMortgageInsurance = ((totalLoanAmount * MMI) / 100) / 12;

            report.Date = DateTime.UtcNow;
            report.ExpirationDate = report.Date.AddMonths(1);
            report.PreApprovalId = preApproval.Id;
            report.BorrowerName = preApproval.BorrowerInfo.BorrowerName;
            report.DownPaymentAmount = downAmount;
            report.SalePrice = purchasePrice;
            report.UpfrontMipPercent = upFront;
            report.UpfrontMipAmount = upFrontAmount;
            report.TotalLoanAmount = totalLoanAmount;
            report.InterestRate = interestRate;
            report.LoanTerm = loanTerm;
            report.PILoanAmount = (decimal)MonthlyPILoanAmount;
            report.PropertyTax = preApproval.LoanProgram.MonthlyPropertyTax.Value;
            report.HazardInsurancePremium = preApproval.PurchaseInfo.HazardInsurance.Value;
            report.CoverageRate = preApproval.PurchaseInfo.MipFundingFee;
            report.MortgageInsurance = preApproval.PurchaseInfo.MiPercent.Value;
            report.LoanProgram = preApproval.BorrowerInfo.LoanProgram;
            report.OtherFinancedItems = otherFinancedItem;
            report.HOADues = preApproval.PurchaseInfo.AssociationFee.Value;
            report.TotalMonthlyPayment = (report.PILoanAmount + report.PropertyTax + report.HazardInsurancePremium + report.MortgageInsurance + report.HOADues);
            
            EstimatedClosingCostDTO costDto = GetEstClosingCost(preApproval, report);
            report.estimatedClosingCost = costDto;
            return report;
        }             
        catch (Exception ex)
        {
            throw;
        }
    }

    private EstimatedClosingCostDTO GetEstClosingCost(PreApprovalDocument preApproval, FHAReport report) 
    {
        LenderFeesDTO lenderFees = preApproval.LenderFees;
        LoanProgramDTO loanProgram = preApproval.LoanProgram;
        PrepaidItemsDTO prepaidItems = preApproval.PrepaidItems;
        PurchaseInfoDTO purchaseInfo = preApproval.PurchaseInfo;

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
        }.Sum();

        estClosingCost.DownPayment = report.DownPaymentAmount;
        estClosingCost.TotalEstFundToClose = estClosingCost.TotalEstSettlementCharges + report.DownPaymentAmount;
        return estClosingCost;
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
}
