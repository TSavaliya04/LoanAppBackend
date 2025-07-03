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

    public async Task<BorrowerIncomeDTO> CreateBorrowerIncome(BorrowerIncomeDTO borrowerIncomeDTO)
    {
        PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(borrowerIncomeDTO.PreApprovalId);
        BorrowerIncomeDTO result = new BorrowerIncomeDTO();

        if (preApproval.BorrowerIncomes == null)
        {
            preApproval.BorrowerIncomes = new List<BorrowerIncomeDTO>();
        }

        if (borrowerIncomeDTO.Id != null && borrowerIncomeDTO.Id != Guid.Empty)
        {
            var oldEntity = preApproval.BorrowerIncomes
                .FirstOrDefault(b => b.Id == borrowerIncomeDTO.Id);

            if (oldEntity != null)
            {
                UpdateHelper.UpdateEntity(oldEntity, borrowerIncomeDTO);
                oldEntity.UpdatedAt = DateTime.UtcNow;
                result = oldEntity;
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

            // Ensure W2Form Ids are set for new borrower
            if (borrowerIncomeDTO.W2Forms != null)
            {
                foreach (var w2 in borrowerIncomeDTO.W2Forms)
                {
                    if (w2.Id == Guid.Empty)
                    {
                        w2.Id = Guid.NewGuid();
                    }
                }
            }

            preApproval.BorrowerIncomes.Add(borrowerIncomeDTO);
            result = borrowerIncomeDTO;
        }

        preApproval.UpdatedAt = DateTime.UtcNow;
        await _preApprovalRepository.UpdateAsync(preApproval.Id, preApproval);

        return result;
    }

    public async Task<PreApprovalDocument> GetPreApproval(Guid id)
    {
        var document = await _preApprovalRepository.GetByIdAsync(id);
        if (document?.BorrowerInfo == null)
            throw new NotFoundException($"Pre Approval with ID {id} was not found.");
        return document;
    }

    public async Task<DebtBreakdownDTO> CreateDebtBreakdown(DebtBreakdownDTO debtDto)
    {
        PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(debtDto.PreApprovalId);

        if (preApproval.DebtBreakdowns == null)
        {
            preApproval.DebtBreakdowns = new List<DebtBreakdownDTO>();
        }

        if (debtDto.Id != null && debtDto.Id != Guid.Empty)
        {
            var oldEntity = preApproval.DebtBreakdowns
                .FirstOrDefault(d => d.Id == debtDto.Id);

            if (oldEntity != null)
            {
                UpdateHelper.UpdateEntity(oldEntity, debtDto);
                oldEntity.UpdatedAt = DateTime.UtcNow;
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
        }

        preApproval.UpdatedAt = DateTime.UtcNow;
        await _preApprovalRepository.UpdateAsync(preApproval.Id, preApproval);

        return debtDto;
    }

    public async Task<LoanProgramDTO> CreateLoanProgram(LoanProgramDTO loanProgramDto)
    {
        return await CreateOrUpdateEntity(
            loanProgramDto,
            loanProgramDto.Id,
            loanProgramDto.PreApprovalId,
            FormType.LoanProgram,
            doc => doc.LoanProgram,
            (doc, value) => doc.LoanProgram = value
        );
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
                LoanProgram = doc.LoanProgram?.LoanProgram,
                AgentName = doc.LenderFees?.AgentName
            }).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in PreApprovalService.GetTopOpportunities: {ex.Message}");
            throw new Exception("Failed to retrieve top opportunities.", ex );
        }
    }

    public async Task<PreApprovalReport> GetPreApprovalReport(Guid preApprovalId)
    {
        try
        {              
            PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
            UserEntity user = await _userRepository.GetUserById(_loginUserDetails.UserID);
            decimal purchasePrice = preApproval.PurchaseInfo.PurchasePrice.Value;
            decimal downPercent = preApproval.PurchaseInfo.DownPayment.Value;
            decimal downAmount = (purchasePrice * downPercent) / 100;
            decimal fma = purchasePrice - downAmount;
            List<string> borrowers = preApproval.BorrowerIncomes.Select(b => b.BorrowerName).ToList();
            return new PreApprovalReport
            {
                PreApprovalId = preApproval.Id,
                BorrowerName = preApproval.BorrowerInfo.BorrowerName,
                FirstMortgageAmount = fma,
                DownPaymentPercentage = downPercent,    
                DownPaymentAmount = downAmount,
                PurchasePrice = purchasePrice,
                LoanProgram = preApproval.LoanProgram.LoanProgram.Value,
                PropertyType = preApproval.BorrowerInfo.PropertyType.Value,
                Borrowers = borrowers,
                LendingCompany = user.CompanyName
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in PreApprovalService.GetPreApprovalReport: {ex.Message}");
            throw new Exception("Failed to retrieve top GetPreApprovalReport.", ex);
        }
    }

    public async Task<FHAReport> GetFHAReport(Guid preApprovalId)
    {
        FHAReport report = new FHAReport();
        try
        {
            PreApprovalDocument preApproval = await _preApprovalRepository.GetByIdAsync(preApprovalId);
            UserEntity user = await _userRepository.GetUserById(_loginUserDetails.UserID);
            decimal purchasePrice = preApproval.PurchaseInfo.PurchasePrice.Value;
            decimal downPercent = preApproval.PurchaseInfo.DownPayment.Value;
            decimal downAmount = (purchasePrice * downPercent) / 100;
            decimal upFront = preApproval.PurchaseInfo.MipFundingFee.Value;
            decimal upFrontAmount = (purchasePrice * upFront) / 100;
            decimal totalLoanAmount = (purchasePrice - downAmount) + upFrontAmount;

            decimal interestRate = preApproval.LoanProgram.InterestRate.Value;
            int loanTerm = preApproval.LoanProgram.Term.Value;
            double MonthlyPILoanAmount = PreApprovalHelper.CalculateMonthlyPI(Decimal.ToDouble(totalLoanAmount), Decimal.ToDouble(interestRate), loanTerm);

            decimal realEstateTaxes = preApproval.PrepaidItems.PropertyTaxAmount.Value;
            decimal MMI = preApproval.LoanProgram.MMI.Value;
            decimal hazInsurancePremium = preApproval.PrepaidItems.HazardInsurance.Value;
            decimal monthlyMortgageInsurance = ((totalLoanAmount * MMI) / 100) / 12;

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
            report.PropertyTax = preApproval.PrepaidItems.PropertyTaxAmount.Value;
            report.HazardInsurancePremium = preApproval.PrepaidItems.HazardInsurance.Value;
            report.CoverageRate = preApproval.LoanProgram.MMI.Value;
            report.MortgageInsurance = monthlyMortgageInsurance;
            
            EstimatedClosingCostDTO costDto = GetEstClosingCost(preApproval, report);
            report.estimatedClosingCost = costDto;
            return report;
        }             
        catch (Exception ex)
        {
            Console.WriteLine($"Exception in PreApprovalService.GetFHAReport: {ex.Message}");
            throw new Exception("Failed to retrieve top GetFHAReport.", ex);
        }
    }

    private EstimatedClosingCostDTO GetEstClosingCost(PreApprovalDocument preApproval, FHAReport report) 
    {
        LenderFeesDTO lenderFees = preApproval.LenderFees;
        LoanProgramDTO loanProgram = preApproval.LoanProgram;
        PrepaidItemsDTO prepaidItems = preApproval.PrepaidItems;

        EstimatedClosingCostDTO estClosingCost = new EstimatedClosingCostDTO();
        estClosingCost.LoanOriginationFees = (preApproval.LoanProgram.BaseLoanAmount.Value * lenderFees.LoanOriginationFee.Value) / 100;
        estClosingCost.HazInsPremium = prepaidItems.HazardInsurance.Value;
        estClosingCost.PrepaidInterest = prepaidItems.PrepaidInterestDays.Value * prepaidItems.PrepaidInterestAmount.Value;
        estClosingCost.PpdPropTaxes = prepaidItems.PropertyTaxMonths.Value * prepaidItems.PropertyTaxAmount.Value;
        estClosingCost.HazInsReserve = prepaidItems.HazardInsuranceMonths.Value * prepaidItems.HazardInsuranceReserves.Value;
        estClosingCost.TitleInsurance = PreApprovalHelper.CalculateTitleInsurance(report.TotalLoanAmount);
        estClosingCost.EscrowFee = lenderFees.EscrowFees.Value;
        estClosingCost.NotaryFee = lenderFees.NotaryFee.Value;
        estClosingCost.DiscountFee = lenderFees.DiscountFee.Value;
        estClosingCost.UpFrontMIP = lenderFees.UpfrontMip.Value;
        estClosingCost.UnderWriter = lenderFees.UnderWriter.Value;
        estClosingCost.ProcessFee = lenderFees.ProcessFee.Value;
        estClosingCost.EstClosingCost = new[]
        {
            estClosingCost.LoanOriginationFees,
            estClosingCost.HazInsPremium,
            estClosingCost.PrepaidInterest,
            estClosingCost.PpdPropTaxes,
            estClosingCost.HazInsReserve,
            estClosingCost.TitleInsurance,
            estClosingCost.EscrowFee,
            estClosingCost.NotaryFee,
            estClosingCost.DiscountFee,
            estClosingCost.UpFrontMIP,
            estClosingCost.UnderWriter,
            estClosingCost.ProcessFee
        }.Sum();
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
        PreApprovalDocument document = null;

        if (typeof(T) != typeof(BorrowerInfoDTO) && !preApprovalId.HasValue)
        {
            throw new ValidationException("PreApproval Id can't be null or empty");
        }
        if (typeof(T) == typeof(BorrowerInfoDTO) && id.HasValue && !preApprovalId.HasValue)
        {
            throw new ValidationException("PreApproval Id can't be null or empty");
        }

        var idProp = typeof(T).GetProperty("Id");
        var createdAtProp = typeof(T).GetProperty("CreatedAt");
        var preApprovalIdProp = typeof(T).GetProperty("PreApprovalId");
        var entUpdatedAtProp = typeof(T).GetProperty("UpdatedAt");
        var entityId = idProp.GetValue(entity) as Guid?;

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
            {
                throw new NotFoundException($"Pre Approval with ID {preApprovalId} was not found.");
            }

            // Update existing document
            document.UpdatedAt = DateTime.UtcNow;

            if (!entityId.HasValue || entityId.Value == Guid.Empty)
            {
                idProp.SetValue(entity, Guid.NewGuid());
                createdAtProp.SetValue(entity, DateTime.UtcNow);
                preApprovalIdProp.SetValue(entity, document.Id);
                document.LastSubmittedFormNo = (int)formType;
            }
            else
            {
                // Get the existing entity
                var existingEntity = getValue(document);
                if (existingEntity != null)
                {
                    // Update only the properties that are provided in the new entity
                    foreach (var prop in typeof(T).GetProperties())
                    {
                        var newValue = prop.GetValue(entity);
                        if (newValue != null && !prop.Name.Equals("Id", StringComparison.OrdinalIgnoreCase))
                        {
                            prop.SetValue(existingEntity, newValue);
                        }
                    }
                    entity = existingEntity;
                }
                entUpdatedAtProp.SetValue(entity, DateTime.UtcNow);
            }
            setValue(document, entity);
            await _preApprovalRepository.UpdateAsync(document.Id, document);
        }
        return getValue(document);
    }
}
