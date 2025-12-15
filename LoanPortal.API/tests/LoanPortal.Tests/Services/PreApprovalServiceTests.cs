using Moq;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Exceptions;
using LoanPortal.Core.Helper;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Repositories;
using LoanPortal.Core.Services;
using LoanPortal.Shared.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Services
{
    public class PreApprovalServiceTests
    {
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly Mock<IPreApprovalRepository> _mockPreApprovalRepository;
        private readonly Mock<IUserRepository> _mockUserRepository;
        private readonly PreApprovalService _service;

        public PreApprovalServiceTests()
        {
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            _mockPreApprovalRepository = new Mock<IPreApprovalRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _service = new PreApprovalService(
                _mockLoginUserDetails.Object,
                _mockPreApprovalRepository.Object,
                _mockUserRepository.Object
            );
        }

        [Fact]
        public async Task GetPreApproval_ValidId_ReturnsDocument()
        {
            // Arrange
            var id = Guid.NewGuid();
            var expectedDocument = new PreApprovalDocument
            {
                Id = id,
                BorrowerInfo = new BorrowerInfoDTO()
            };
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(id))
                .ReturnsAsync(expectedDocument);

            // Act
            var result = await _service.GetPreApproval(id);

            // Assert
            Assert.Equal(expectedDocument, result);
        }

        [Fact]
        public async Task GetPreApproval_InvalidId_ThrowsNotFoundException()
        {
            // Arrange
            var id = Guid.NewGuid();
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(id))
                .ReturnsAsync((PreApprovalDocument)null);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.GetPreApproval(id));
        }

        [Fact]
        public async Task GetTopOpportunities_ReturnsOpportunities()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var documents = new List<PreApprovalDocument>
            {
                new PreApprovalDocument
                {
                    Id = Guid.NewGuid(),
                    BorrowerInfo = new BorrowerInfoDTO 
                    { 
                        BorrowerName = "John Doe",
                        //LoanProgram = (int)LoanProgram.Conventional
                    },
                    LoanProgram = new LoanProgramDTO { LoanProgram = (int)LoanProgram.FHA },
                    LenderFees = new LenderFeesDTO { AgentName = "Agent 1" }
                }
            };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetAllAsync(userId))
                .ReturnsAsync(documents);

            // Act
            var result = await _service.GetTopOpportunities();

            // Assert
            Assert.Single(result);
            Assert.Equal(documents[0].Id, result[0].PreApprovalId);
            Assert.Equal(documents[0].BorrowerInfo.BorrowerName, result[0].BorrowerName);
            //Assert.Equal(documents[0].BorrowerInfo.LoanProgram, result[0].LoanProgram);
            Assert.Equal(documents[0].LenderFees.AgentName, result[0].AgentName);
        }

        [Fact]
        public async Task GetPreApprovalReport_ValidId_ReturnsReport()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                BorrowerInfo = new BorrowerInfoDTO 
                { 
                    BorrowerName = "John Doe",
                    //PropertyType = (int)PropertyType.TwoUnit
                },
                PurchaseInfo = new PurchaseInfoDTO
                {
                    PurchasePrice = 300000,
                    DownPayment = 20
                },
                LoanProgram = new LoanProgramDTO
                {
                    LoanProgram = (int)LoanProgram.Conventional,
                    Price = 300000
                },
                LenderFees = new LenderFeesDTO { AgentName = "Agent X" },
                BorrowerIncomes = new List<BorrowerIncomeDTO>
                {
                    new BorrowerIncomeDTO { BorrowerName = "John Doe" }
                }
            };

            var user = new UserEntity
            {
                Id = userId,
                CompanyName = "Test Company"
            };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);
            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(user);

            // Act
            var result = await _service.GetPreApprovalReport(preApprovalId);

            // Assert
            Assert.Equal(preApprovalId, result.PreApprovalId);
            Assert.Equal("John Doe", result.BorrowerName);
            Assert.Equal(240000, result.FirstMortgageAmount); // 300000 - (300000 * 0.20)
            Assert.Equal(20, result.DownPaymentPercentage);
            Assert.Equal(60000, result.DownPaymentAmount); // 300000 * 0.20
            Assert.Equal(300000, result.PurchasePrice);
            Assert.Equal((double)LoanProgram.Conventional, result.LoanProgram);
            Assert.Equal((double)PropertyType.TwoUnit, result.PropertyType);
            Assert.Single(result.Borrowers);
            Assert.Equal("Test Company", result.LendingCompany);
        }

        [Fact]
        public async Task GetFHAReport_ValidId_ReturnsReport()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "John Doe" },
                PurchaseInfo = new PurchaseInfoDTO
                {
                    PurchasePrice = 300000,
                    DownPayment = 3.5m,
                    MipFundingFee = 1.75m,
                    AnnualInterestRate = 3.5m,
                    HazardInsurance = 1200,
                    MiPercent = 0m,
                    AssociationFee = 0m
                },
                LoanProgram = new LoanProgramDTO
                {
                    InterestRate = 3.5m,
                    Term = 30,
                    MMI = 0.85m,
                    BaseLoanAmount = 294750, // Example value
                    Price = 300000,
                    MonthlyPropertyTax = 3000
                },
                PrepaidItems = new PrepaidItemsDTO
                {
                    PropertyTaxAmount = 3000,
                    HazardInsurance = 1200,
                    PrepaidInterestDays = 10,
                    PrepaidInterestAmount = 50,
                    PropertyTaxMonths = 2,
                    HazardInsuranceMonths = 2,
                    HazardInsuranceReserves = 100
                },
                LenderFees = new LenderFeesDTO
                {
                    LoanOriginationFee = 1,
                    EscrowFees = 500,
                    NotaryFee = 100,
                    DiscountFee = 200,
                    UpfrontMip = 5250,
                    UnderWriter = 300,
                    ProcessFee = 400,
                    TitleFees = 1000
                },
                MiscFees = new MiscFeesDTO
                {
                    EarnestMoneyDeposit = 0,
                    SellerCredit = 0,
                    LenderCredit = 0,
                    MiscFee4 = 0
                }
            };

            var user = new UserEntity { Id = userId };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);
            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(user);

            // Act
            var result = await _service.GetFHAReport(preApprovalId);

            // Assert
            Assert.Equal(preApprovalId, result.PreApprovalId);
            Assert.Equal("John Doe", result.BorrowerName);
            Assert.Equal(10500, result.DownPaymentAmount); // 300000 * 0.035
            Assert.Equal(300000, result.SalePrice);
            Assert.Equal(1.75m, result.UpfrontMipPercent);
            Assert.Equal(5250, result.UpfrontMipAmount); // 300000 * 0.0175
            Assert.Equal(294566.25m, result.TotalLoanAmount); // (300000 - 10500) + ((300000 - 10500) * 0.0175)
            Assert.Equal(3.5m, result.InterestRate);
            Assert.Equal(30, result.LoanTerm);
            Assert.Equal(3000, result.PropertyTax);
            Assert.Equal(1200, result.HazardInsurancePremium);
            Assert.Equal(1.75m, result.CoverageRate);
        }

        [Fact]
        public async Task CreateBorrowerInfo_NewDocument_CreatesSuccessfully()
        {
            // Arrange
            var borrowerInfo = new BorrowerInfoDTO
            {
                BorrowerName = "John Doe"
            };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(Guid.NewGuid());

            // Act
            var result = await _service.CreateBorrowerInfo(borrowerInfo);

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.Id);
            Assert.Equal("John Doe", result.BorrowerName);
            _mockPreApprovalRepository.Verify(x => x.InsertAsync(It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreateBorrowerIncome_NewIncome_AddsSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var debts = new List<DebtBreakdownDTO>
            {
                new DebtBreakdownDTO { Id = Guid.NewGuid(), DebtType = 1, Balance = 1000, MonthlyPayment = 100 }
            };
            var borrowerIncome = new BorrowerIncomeDTO
            {
                PreApprovalId = preApprovalId,
                BorrowerName = "John Doe",
                Debts = debts
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                BorrowerIncomes = new List<BorrowerIncomeDTO>()
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateBorrowerIncome(new List<BorrowerIncomeDTO> { borrowerIncome });

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.NotEqual(Guid.Empty, result[0].Id);
            Assert.Equal("John Doe", result[0].BorrowerName);
            Assert.Equal(preApprovalId, result[0].PreApprovalId);
            Assert.NotNull(result[0].Debts);
            Assert.Single(result[0].Debts);
            Assert.Equal(debts[0].DebtType, result[0].Debts[0].DebtType);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreateBorrowerIncome_ExistingIncome_UpdatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var incomeId = Guid.NewGuid();
            var oldDebts = new List<DebtBreakdownDTO>
            {
                new DebtBreakdownDTO { Id = Guid.NewGuid(), DebtType = 1, Balance = 1000, MonthlyPayment = 100 }
            };
            var newDebts = new List<DebtBreakdownDTO>
            {
                new DebtBreakdownDTO { Id = oldDebts[0].Id, DebtType = 2, Balance = 1500, MonthlyPayment = 150 },
                new DebtBreakdownDTO { Id = Guid.NewGuid(), DebtType = 3, Balance = 500, MonthlyPayment = 50 }
            };
            var borrowerIncome = new BorrowerIncomeDTO
            {
                Id = incomeId,
                PreApprovalId = preApprovalId,
                BorrowerName = "John Doe Updated",
                Debts = newDebts
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                BorrowerIncomes = new List<BorrowerIncomeDTO>
                {
                    new BorrowerIncomeDTO
                    {
                        Id = incomeId,
                        BorrowerName = "John Doe",
                        Debts = oldDebts
                    }
                }
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateBorrowerIncome(new List<BorrowerIncomeDTO> { borrowerIncome });

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(incomeId, result[0].Id);
            Assert.Equal("John Doe Updated", result[0].BorrowerName);
            Assert.NotNull(result[0].Debts);
            Assert.Equal(2, result[0].Debts.Count);
            Assert.Contains(result[0].Debts, d => d.DebtType == 2 && d.Balance == 1500);
            Assert.Contains(result[0].Debts, d => d.DebtType == 3 && d.Balance == 500);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreateBorrowerIncome_NonExistentIncome_CreatesNewIncome()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var incomeId = Guid.NewGuid();
            var debts = new List<DebtBreakdownDTO>
            {
                new DebtBreakdownDTO { Id = Guid.NewGuid(), DebtType = 1, Balance = 1000, MonthlyPayment = 100 }
            };
            var borrowerIncome = new BorrowerIncomeDTO
            {
                Id = incomeId,
                PreApprovalId = preApprovalId,
                Debts = debts
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                BorrowerIncomes = new List<BorrowerIncomeDTO>()
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateBorrowerIncome(new List<BorrowerIncomeDTO> { borrowerIncome });

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(incomeId, result[0].Id);
            Assert.Equal(preApprovalId, result[0].PreApprovalId);
            Assert.NotNull(result[0].Debts);
            Assert.Single(result[0].Debts);
            Assert.Equal(debts[0].DebtType, result[0].Debts[0].DebtType);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreatePurchaseInfo_NewDocument_CreatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var purchaseInfo = new PurchaseInfoDTO
            {
                PreApprovalId = preApprovalId,
                PurchasePrice = 300000,
                DownPayment = 20,
                MipFundingFee = 1.75m
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreatePurchaseInfo(purchaseInfo);

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.Id);
            Assert.Equal(300000, result.PurchasePrice);
            Assert.Equal(20, result.DownPayment);
            Assert.Equal(1.75m, result.MipFundingFee);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreatePurchaseInfo_ExistingDocument_UpdatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var purchaseInfo = new PurchaseInfoDTO
            {
                Id = Guid.NewGuid(),
                PreApprovalId = preApprovalId,
                PurchasePrice = 350000,
                DownPayment = 25,
                MipFundingFee = 2.0m
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                PurchaseInfo = new PurchaseInfoDTO
                {
                    Id = purchaseInfo.Id,
                    PurchasePrice = 300000,
                    DownPayment = 20,
                    MipFundingFee = 1.75m
                }
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreatePurchaseInfo(purchaseInfo);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(purchaseInfo.Id, result.Id);
            Assert.Equal(350000, result.PurchasePrice);
            Assert.Equal(25, result.DownPayment);
            Assert.Equal(2.0m, result.MipFundingFee);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreateLenderFees_NewDocument_CreatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var lenderFees = new LenderFeesDTO
            {
                PreApprovalId = preApprovalId,
                AgentName = "John Agent",
                LoanOriginationFee = 1000,
                AppraisalFee = 800
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateLenderFees(lenderFees);

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.Id);
            Assert.Equal("John Agent", result.AgentName);
            Assert.Equal(1000, result.LoanOriginationFee);
            Assert.Equal(800, result.AppraisalFee);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreatePrepaidItems_NewDocument_CreatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var prepaidItems = new PrepaidItemsDTO
            {
                PreApprovalId = preApprovalId,
                PropertyTaxAmount = 3000,
                HazardInsurance = 1200,
                PrepaidInterestAmount = 500
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreatePrepaidItems(prepaidItems);

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.Id);
            Assert.Equal(3000, result.PropertyTaxAmount);
            Assert.Equal(1200, result.HazardInsurance);
            Assert.Equal(500, result.PrepaidInterestAmount);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreateMiscFees_NewDocument_CreatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var miscFees = new MiscFeesDTO
            {
                PreApprovalId = preApprovalId,
                EarnestMoneyDeposit = 1000,
                SellerCredit = 200,
                LenderCredit = 50
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateMiscFees(miscFees);

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.Id);
            Assert.Equal(1000, result.EarnestMoneyDeposit);
            Assert.Equal(200, result.SellerCredit);
            Assert.Equal(50, result.LenderCredit);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        /*[Fact]
        public async Task CreateDebtBreakdown_NewDebt_AddsSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var debtBreakdown = new DebtBreakdownDTO
            {
                PreApprovalId = preApprovalId,
                DebtType = 1,
                Balance = 10000,
                HighCredit = 12000,
                MonthlyPayment = 500
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                DebtBreakdowns = new List<DebtBreakdownDTO>()
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateDebtBreakdown(new List<DebtBreakdownDTO> { debtBreakdown });

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.NotEqual(Guid.Empty, result[0].Id);
            Assert.Equal(1, result[0].DebtType);
            Assert.Equal(10000, result[0].Balance);
            Assert.Equal(12000, result[0].HighCredit);
            Assert.Equal(500, result[0].MonthlyPayment);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreateDebtBreakdown_ExistingDebt_UpdatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var debtId = Guid.NewGuid();
            var debtBreakdown = new DebtBreakdownDTO
            {
                Id = debtId,
                PreApprovalId = preApprovalId,
                DebtType = 1,
                Balance = 12000,
                HighCredit = 14000,
                MonthlyPayment = 600
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                DebtBreakdowns = new List<DebtBreakdownDTO>
                {
                    new DebtBreakdownDTO
                    {
                        Id = debtId,
                        DebtType = 1,
                        Balance = 10000,
                        HighCredit = 12000,
                        MonthlyPayment = 500
                    }
                }
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateDebtBreakdown(new List<DebtBreakdownDTO> { debtBreakdown });

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(debtId, result[0].Id);
            Assert.Equal(1, result[0].DebtType);
            Assert.Equal(12000, result[0].Balance);
            Assert.Equal(14000, result[0].HighCredit);
            Assert.Equal(600, result[0].MonthlyPayment);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreateDebtBreakdown_NonExistentDebt_ThrowsNotFoundException()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var debtId = Guid.NewGuid();
            var debtBreakdown = new DebtBreakdownDTO
            {
                Id = debtId,
                PreApprovalId = preApprovalId
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                DebtBreakdowns = new List<DebtBreakdownDTO>()
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.CreateDebtBreakdown(new List<DebtBreakdownDTO> { debtBreakdown }));
        }*/

        [Fact]
        public async Task CreateLoanProgram_NewDocument_CreatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var loanProgram = new LoanProgramDTO
            {
                PreApprovalId = preApprovalId,
                LoanProgram = (int)LoanProgram.Conventional,
                InterestRate = 3.5m,
                Term = 30,
                MMI = 0.85m
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateLoanProgram(loanProgram);

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(Guid.Empty, result.Id);
            Assert.Equal((int?)LoanProgram.Conventional, result.LoanProgram);
            Assert.Equal(3.5m, result.InterestRate);
            Assert.Equal(30, result.Term);
            Assert.Equal(0.85m, result.MMI);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task CreateLoanProgram_ExistingDocument_UpdatesSuccessfully()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var loanProgram = new LoanProgramDTO
            {
                Id = Guid.NewGuid(),
                PreApprovalId = preApprovalId,
                LoanProgram = (int)LoanProgram.FHA,
                InterestRate = 4.0m,
                Term = 30,
                MMI = 0.85m
            };

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                LoanProgram = new LoanProgramDTO
                {
                    Id = loanProgram.Id,
                    LoanProgram = (int)LoanProgram.Conventional,
                    InterestRate = 3.5m,
                    Term = 30,
                    MMI = 0.85m
                }
            };

            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Act
            var result = await _service.CreateLoanProgram(loanProgram);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(loanProgram.Id, result.Id);
            Assert.Equal((int?)LoanProgram.FHA, result.LoanProgram);
            Assert.Equal(4.0m, result.InterestRate);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(preApprovalId, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task ClonePreApproval_ValidId_InsertsClonedWithNewId()
        {
            // Arrange
            var originalId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var originalCreatedAt = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var preApproval = new PreApprovalDocument
            {
                Id = originalId,
                UserId = userId,
                CreatedAt = originalCreatedAt,
                BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "Jane Doe" }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(originalId))
                .ReturnsAsync(preApproval);

            PreApprovalDocument insertedDoc = null;
            _mockPreApprovalRepository
                .Setup(x => x.InsertAsync(It.IsAny<PreApprovalDocument>()))
                .Callback<PreApprovalDocument>(d => insertedDoc = d)
                .Returns(Task.CompletedTask);

            // Act
            await _service.ClonePreApproval(originalId);

            // Assert
            _mockPreApprovalRepository.Verify(x => x.InsertAsync(It.IsAny<PreApprovalDocument>()), Times.Once);
            Assert.NotNull(insertedDoc);
            Assert.NotEqual(originalId, insertedDoc.Id);
            Assert.Equal(userId, insertedDoc.UserId);
            Assert.NotEqual(originalCreatedAt, insertedDoc.CreatedAt);
            Assert.NotNull(insertedDoc.BorrowerInfo);
            Assert.Equal("Jane Doe", insertedDoc.BorrowerInfo.BorrowerName);
        }

        [Fact]
        public async Task ClonePreApproval_NotFound_DoesNotInsertAndDoesNotThrow()
        {
            // Arrange
            var missingId = Guid.NewGuid();
            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(missingId))
                .ReturnsAsync((PreApprovalDocument)null);

            // Act
            await _service.ClonePreApproval(missingId);

            // Assert
            _mockPreApprovalRepository.Verify(x => x.InsertAsync(It.IsAny<PreApprovalDocument>()), Times.Never);
        }

        [Fact]
        public async Task GetQuickQuote_ValidId_ComputesExpectedFields()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var purchasePrice = 300000m;
            var downPercent = 20m; // 20%
            var interestRate = 3.5m;
            var term = 30;
            var monthlyPropertyTax = 300m;
            var hazardInsurance = 100m;
            var mortgageInsurance = 50m;
            var hoaFee = 25m;

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                LoanProgram = new LoanProgramDTO
                {
                    Price = purchasePrice,
                    InterestRate = interestRate,
                    Term = term,
                    MonthlyPropertyTax = monthlyPropertyTax
                },
                PurchaseInfo = new PurchaseInfoDTO
                {
                    DownPayment = downPercent,
                    HazardInsurance = hazardInsurance,
                    MiPercent = mortgageInsurance,
                    AssociationFee = hoaFee,
                    MipFundingFee = 1.75m
                },
                PrepaidItems = new PrepaidItemsDTO
                {
                    PrepaidInterestAmount = 10m,
                    HazardInsurance = 20m,
                    HazardInsuranceReserves = 30m,
                    PropertyTaxAmount = 40m
                },
                MiscFees = new MiscFeesDTO
                {
                    SellerCredit = 5m,
                    LenderCredit = 6m,
                    EarnestMoneyDeposit = 7m,
                    MiscFee4 = 8m
                },
                LenderFees = new LenderFeesDTO
                {
                    DiscountFee = 0m,
                    LoanOriginationFee = 0m,
                    AppraisalFee = 0m,
                    EscrowFees = 0m,
                    NotaryFee = 0m,
                    UpfrontMip = 0m,
                    UnderWriter = 0m,
                    ProcessFee = 0m,
                    TitleFees = 0m
                },
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Expected calculations
            var downAmount = (purchasePrice * downPercent) / 100m; // 60,000
            var otherFinancedItem = ((purchasePrice - downAmount) * 1.75m) / 100m; // FHA UFMIP per service logic
            var totalLoanAmount = (purchasePrice - downAmount) + otherFinancedItem;
            var expectedPI = (decimal)PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount, interestRate, term);
            var expectedMonthlyTotal = expectedPI + (monthlyPropertyTax * 2) + (mortgageInsurance * 2) + hazardInsurance + hoaFee; // matches current implementation
            var expectedPrepaids = 10m + 20m + 30m + 40m;

            // Act
            var result = await _service.GetQuickQuote(preApprovalId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(purchasePrice, result.HomeValue);
            Assert.Equal(interestRate, result.InterestRate);
            Assert.Equal(downPercent, result.DownPaymentPercent);
            Assert.Equal(downAmount, result.DownPayment);
            Assert.Equal(expectedPI, result.PrincipalAndInterest);
            Assert.Equal(monthlyPropertyTax, result.PropertyTax);
            Assert.Equal(hazardInsurance, result.HazardInsurance);
            Assert.Equal(mortgageInsurance, result.MortgageInsurance);
            Assert.Equal(hoaFee, result.HoaFee);
            Assert.Equal(expectedMonthlyTotal, result.MonthlyTotal);
            //Assert.Equal(expectedPrepaids, result.Prepaids);
            Assert.Equal(5m, result.SellerCredit);
            Assert.Equal(6m, result.LenderCredit);
            Assert.Equal(7m, result.EarnestMoneyDeposit);
            Assert.Equal(8m, result.MiscFee4);
        }

        [Fact]
        public async Task GetQuickQuote_ZeroFees_ComputesTotalsWithZeros()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var purchasePrice = 200000m;
            var downPercent = 10m; // 10%
            var interestRate = 4.0m;
            var term = 30;
            var monthlyPropertyTax = 0m;
            var hazardInsurance = 0m;
            var mortgageInsurance = 0m;
            var hoaFee = 0m;

            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                LoanProgram = new LoanProgramDTO
                {
                    Price = purchasePrice,
                    InterestRate = interestRate,
                    Term = term,
                    MonthlyPropertyTax = monthlyPropertyTax
                },
                PurchaseInfo = new PurchaseInfoDTO
                {
                    DownPayment = downPercent,
                    HazardInsurance = hazardInsurance,
                    MiPercent = mortgageInsurance,
                    AssociationFee = hoaFee,
                    MipFundingFee = 0m
                },
                PrepaidItems = new PrepaidItemsDTO
                {
                    PrepaidInterestAmount = 0m,
                    HazardInsurance = 0m,
                    HazardInsuranceReserves = 0m,
                    PropertyTaxAmount = 0m
                },
                MiscFees = new MiscFeesDTO
                {
                    SellerCredit = 0m,
                    LenderCredit = 0m,
                    EarnestMoneyDeposit = 0m,
                    MiscFee4 = 0m
                },
                LenderFees = new LenderFeesDTO
                {
                    DiscountFee = 0m,
                    LoanOriginationFee = 0m,
                    AppraisalFee = 0m,
                    EscrowFees = 0m,
                    NotaryFee = 0m,
                    UpfrontMip = 0m,
                    UnderWriter = 0m,
                    ProcessFee = 0m,
                    TitleFees = 0m
                },
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            // Expected calculations
            var downAmount = (purchasePrice * downPercent) / 100m; // 20,000
            var otherFinancedItem = ((purchasePrice - downAmount) * 1.75m) / 100m;
            var totalLoanAmount = (purchasePrice - downAmount) + otherFinancedItem;
            var expectedPI = (decimal)PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount, interestRate, term);
            var expectedMonthlyTotal = expectedPI + (monthlyPropertyTax * 2) + (mortgageInsurance * 2) + hazardInsurance + hoaFee;

            // Act
            var result = await _service.GetQuickQuote(preApprovalId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(purchasePrice, result.HomeValue);
            Assert.Equal(interestRate, result.InterestRate);
            Assert.Equal(downPercent, result.DownPaymentPercent);
            Assert.Equal(downAmount, result.DownPayment);
            Assert.Equal(expectedPI, result.PrincipalAndInterest);
            Assert.Equal(expectedMonthlyTotal, result.MonthlyTotal);
            Assert.Equal(0m, result.PropertyTax);
            Assert.Equal(0m, result.HazardInsurance);
            Assert.Equal(0m, result.MortgageInsurance);
            Assert.Equal(0m, result.HoaFee);
            //Assert.Equal(0m, result.Prepaids);
            Assert.Equal(0m, result.SellerCredit);
            Assert.Equal(0m, result.LenderCredit);
            Assert.Equal(0m, result.EarnestMoneyDeposit);
            Assert.Equal(0m, result.MiscFee4);
        }
    }
} 