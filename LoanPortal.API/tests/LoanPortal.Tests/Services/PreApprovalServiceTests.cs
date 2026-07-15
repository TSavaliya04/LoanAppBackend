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
        private readonly Mock<ICompanyRepository> _mockCompanyRepository;
        private readonly PreApprovalService _service;

        public PreApprovalServiceTests()
        {
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            _mockPreApprovalRepository = new Mock<IPreApprovalRepository>();
            _mockUserRepository = new Mock<IUserRepository>();
            _mockCompanyRepository = new Mock<ICompanyRepository>();
            _service = new PreApprovalService(
                _mockLoginUserDetails.Object,
                _mockPreApprovalRepository.Object,
                _mockUserRepository.Object,
                _mockCompanyRepository.Object
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
                Scenarios = new List<ScenarioDTO>()
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
                .ReturnsAsync((PreApprovalDocument)null!);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.GetPreApproval(id));
        }

        [Fact]
        public async Task GetPreApproval_EmptyId_ThrowsNotFoundException()
        {
            // Arrange
            var id = Guid.Empty;
            var doc = new PreApprovalDocument { Id = Guid.Empty, Scenarios = new List<ScenarioDTO>() };
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(id))
                .ReturnsAsync(doc);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _service.GetPreApproval(id));
        }

        [Fact]
        public async Task GetQuoteList_ReturnsOpportunities()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var documents = new List<PreApprovalDocument>
            {
                new PreApprovalDocument
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow,
                    Status = 1,
                    Scenarios = new List<ScenarioDTO>
                    {
                        new ScenarioDTO
                        {
                            Id = scenarioId,
                            Purchase = new PurchaseScenarioDTO
                            {
                                BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "John Doe" },
                                PurchaseInfo = new PurchaseInfoDTO { AnnualInterestRate = 3.5m, LoanProgram = (int)LoanProgram.FHA },
                                LoanProgram = new LoanProgramDTO { MonthlyTotal = 1500m }
                            },
                            LastSubmittedFormNo = (int)LoanPortal.Shared.Enum.FormType.LoanProgram
                        }
                    }
                }
            };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetAllAsync(userId))
                .ReturnsAsync(documents);

            // Act
            var result = await _service.GetQuoteList(0);

            // Assert
            Assert.Single(result);
            Assert.Equal(documents[0].Id, result[0].PreApprovalId);
            Assert.Equal("John Doe", result[0].BorrowerName);
            Assert.NotNull(result[0].Scenarios);
        }

        [Fact]
        public async Task GetQuoteList_WithStatus_FiltersByStatus()
        {
            var userId = Guid.NewGuid();
            var docs = new List<PreApprovalDocument>
            {
                new PreApprovalDocument
                {
                    Id = Guid.NewGuid(),
                    Status = 1,
                    CreatedAt = DateTime.UtcNow,
                    Scenarios = new List<ScenarioDTO>
                    {
                        new ScenarioDTO { Purchase = new PurchaseScenarioDTO { BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "Jane Doe" } } }
                    }
                },
                new PreApprovalDocument { Id = Guid.NewGuid(), Status = 2, CreatedAt = DateTime.UtcNow.AddDays(-1), Scenarios = new List<ScenarioDTO>() }
            };
            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetAllAsync(userId)).ReturnsAsync(docs);

            var result = await _service.GetQuoteList(1);

            Assert.Single(result);
            Assert.Equal(docs[0].Id, result[0].PreApprovalId);
        }

        [Fact]
        public async Task GetQuoteList_Refinance_ReturnsOpportunities()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var documents = new List<PreApprovalDocument>
            {
                new PreApprovalDocument
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow,
                    LoanType = 1,
                    Status = 1,
                    Scenarios = new List<ScenarioDTO>
                    {
                        new ScenarioDTO
                        {
                            Id = scenarioId,
                            Refinance = new RefinanceScenarioDTO
                            {
                                BorrowerInfo = new RefinanceBorrowerInfoDTO { BorrowerName = "Jane Refi" },
                                RefinanceInfo = new RefinanceInfoDTO { LoanAmount = 250000 },
                                LoanStructure = new RefinanceLoanStructureDTO { InterestRate = 4.0m, LoanProgram = (int)LoanProgram.Conventional },
                                LoanProgram = new RefinanceLoanProgramDTO { MonthlyTotal = 1200m }
                            },
                            LastSubmittedFormNo = (int)LoanPortal.Shared.Enum.FormType.LoanProgram
                        }
                    }
                }
            };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetAllAsync(userId))
                .ReturnsAsync(documents);

            // Act
            var result = await _service.GetQuoteList(0);

            // Assert
            Assert.Single(result);
            Assert.Equal(documents[0].Id, result[0].PreApprovalId);
            Assert.Equal("Jane Refi", result[0].BorrowerName);
            Assert.Equal("Refinance", result[0].LoanType);
            Assert.NotNull(result[0].Scenarios);
            Assert.Single(result[0].Scenarios);
            Assert.Equal(250000, result[0].Scenarios[0].LoanAmount);
            Assert.Equal(4.0m, result[0].Scenarios[0].AnnualInterestRate);
            Assert.Equal("Conventional", result[0].Scenarios[0].LoanProgram);
        }

        [Fact]
        public async Task GetPreApprovalReport_ValidIds_ReturnsReport()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        Id = scenarioId,
                        Purchase = new PurchaseScenarioDTO
                        {
                            BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "John Doe" },
                            PurchaseInfo = new PurchaseInfoDTO
                            {
                                PurchasePrice = 300000,
                                DownPayment = 20,
                                PropertyType = (int)PropertyType.TwoUnit,
                                OccupancyStatus = 0
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
                        }
                    }
                }
            };

            var companyId = Guid.NewGuid();
            var user = new UserEntity
            {
                Id = userId,
                CompanyId = companyId
            };

            var company = new CompanyEntity
            {
                Id = companyId,
                Name = "Test Company"
            };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);
            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(user);
            _mockCompanyRepository.Setup(x => x.GetCompanyByIdAsync(companyId))
                .ReturnsAsync(company);

            // Act
            var result = await _service.GetPreApprovalReport(preApprovalId, scenarioId);

            // Assert
            Assert.Equal(preApprovalId, result.PreApprovalId);
            Assert.Equal("John Doe", result.BorrowerName);
            Assert.Equal(240000, result.FirstMortgageAmount); // 300000 - (300000 * 0.20)
            Assert.Equal(20, result.DownPaymentPercentage);
            Assert.Equal(60000, result.DownPaymentAmount); // 300000 * 0.20
            Assert.Equal(300000, result.PurchasePrice);
            Assert.Equal((int)LoanProgram.Conventional, result.LoanProgram);
            Assert.Equal((int)PropertyType.TwoUnit, result.PropertyType);
            Assert.Single(result.Borrowers);
            Assert.Equal("Test Company", result.LendingCompany);
        }

        [Fact]
        public async Task GetPreApprovalReport_Refinance_ReturnsReport()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                LoanType = 1, // Refinance
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        Id = scenarioId,
                        Refinance = new RefinanceScenarioDTO
                        {
                            BorrowerInfo = new RefinanceBorrowerInfoDTO { BorrowerName = "Jane Refi" },
                            RefinanceInfo = new RefinanceInfoDTO
                            {
                                EstimatedPropertyValue = 400000,
                                LoanAmount = 300000,
                                OccupancyStatus = 1
                            },
                            LoanStructure = new RefinanceLoanStructureDTO
                            {
                                LoanProgram = (int)LoanProgram.FHA
                            },
                            LoanProgram = new RefinanceLoanProgramDTO()
                        }
                    }
                }
            };

            var companyId = Guid.NewGuid();
            var user = new UserEntity
            {
                Id = userId,
                CompanyId = companyId
            };

            var company = new CompanyEntity
            {
                Id = companyId,
                Name = "Refi Lending Co"
            };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);
            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(user);
            _mockCompanyRepository.Setup(x => x.GetCompanyByIdAsync(companyId))
                .ReturnsAsync(company);

            // Act
            var result = await _service.GetPreApprovalReport(preApprovalId, scenarioId);

            // Assert
            Assert.Equal(preApprovalId, result.PreApprovalId);
            Assert.Equal("Jane Refi", result.BorrowerName);
            Assert.Equal(300000, result.FirstMortgageAmount);
            Assert.Equal(0, result.DownPaymentPercentage);
            Assert.Equal(0, result.DownPaymentAmount);
            Assert.Equal(400000, result.PurchasePrice);
            Assert.Equal((int)LoanProgram.FHA, result.LoanProgram);
            Assert.Equal(0, result.PropertyType);
            Assert.Empty(result.Borrowers);
            Assert.Equal("Refi Lending Co", result.LendingCompany);
            Assert.Equal(1, result.OccupancyStatus);
        }

        [Fact]
        public async Task GetFHAReport_ValidIds_ReturnsReport()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        Id = scenarioId,
                        Purchase = new PurchaseScenarioDTO
                        {
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
                                UPMIPRate = 0m,
                                BaseLoanAmount = 294750,
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
                                TitleFees = 1000,
                                ThirdPartyLenderFee = 0
                            },
                            MiscFees = new MiscFeesDTO
                            {
                                EarnestMoneyDeposit = 0,
                                SellerCredit = 0,
                                LenderCredit = 0,
                                MiscFee4 = 0
                            }
                        }
                    }
                }
            };

            var user = new UserEntity { Id = userId };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);
            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(user);

            // Act
            var result = await _service.GetFHAReport(preApprovalId, scenarioId);

            // Assert
            Assert.Equal(preApprovalId, result.PreApprovalId);
            Assert.Equal("John Doe", result.BorrowerName);
            Assert.Equal(10500, result.DownPaymentAmount); // 300000 * 0.035
            Assert.Equal(300000, result.SalePrice);
            Assert.Equal(1.75m, result.UpfrontMipPercent);
            Assert.Equal(5250, result.UpfrontMipAmount); // 300000 * 0.0175
            Assert.Equal(289500, result.TotalLoanAmount); // purchasePrice - downAmount = 300000 - 10500
            Assert.Equal(3.5m, result.InterestRate);
            Assert.Equal(30, result.LoanTerm);
            Assert.Equal(3000, result.PropertyTax);
            Assert.Equal(1200, result.HazardInsurancePremium);
            Assert.Equal(1.75m, result.CoverageRate);
        }

        [Fact]
        public async Task GetFHAReport_Refinance_ReturnsReport()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                LoanType = 1, // Refinance
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        Id = scenarioId,
                        Refinance = new RefinanceScenarioDTO
                        {
                            BorrowerInfo = new RefinanceBorrowerInfoDTO { BorrowerName = "Jane Refi" },
                            RefinanceInfo = new RefinanceInfoDTO
                            {
                                EstimatedPropertyValue = 400000,
                                LoanAmount = 300000
                            },
                            LoanStructure = new RefinanceLoanStructureDTO
                            {
                                InterestRate = 4.0m,
                                LoanProgram = (int)LoanProgram.FHA,
                                MonthlyTaxAmount = 250,
                                HazardInsurance = 100,
                                MI = 50,
                                AssociationFee = 25
                            },
                            LoanProgram = new RefinanceLoanProgramDTO
                            {
                                UPMIPRate = 1.75m,
                                Term = 30,
                                MMI = 0.85m,
                                ClosingCosts = 5000
                            }
                        }
                    }
                }
            };

            var user = new UserEntity { Id = userId };

            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);
            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(user);

            // Act
            var result = await _service.GetFHAReport(preApprovalId, scenarioId);

            // Assert
            Assert.Equal(preApprovalId, result.PreApprovalId);
            Assert.Equal("Jane Refi", result.BorrowerName);
            Assert.Equal(0, result.DownPaymentAmount);
            Assert.Equal(400000, result.SalePrice);
            Assert.Equal(1.75m, result.UpfrontMipPercent);
            Assert.Equal(5250, result.UpfrontMipAmount); // 300000 * 0.0175
            Assert.Equal(300000, result.TotalLoanAmount);
            Assert.Equal(4.0m, result.InterestRate);
            Assert.Equal(30, result.LoanTerm);
            Assert.Equal(250, result.PropertyTax);
            Assert.Equal(100, result.HazardInsurancePremium);
            Assert.Equal(1.75m, result.CoverageRate);
            Assert.Equal(50, result.MortgageInsurance);
            Assert.Equal((int)LoanProgram.FHA, result.LoanProgram);
            Assert.Equal(25, result.HOADues);
            Assert.Equal(5000, result.estimatedClosingCost.TotalEstSettlementCharges);
        }

        [Fact]
        public async Task SavePreApproval_NewDocument_InsertsAndReturns()
        {
            var userId = Guid.NewGuid();
            var dto = new PreApprovalDTO
            {
                Id = null,
                Status = 0,
                Scenarios = new List<ScenarioDTO>()
            };
            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.InsertAsync(It.IsAny<PreApprovalDocument>())).Returns(Task.CompletedTask);
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(It.IsAny<Guid>()))
                .Returns<Guid>(id => Task.FromResult(new PreApprovalDocument { Id = id, UserId = userId, Scenarios = dto.Scenarios }));

            var result = await _service.SavePreApproval(dto);

            Assert.NotNull(result);
            _mockPreApprovalRepository.Verify(x => x.InsertAsync(It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task SavePreApproval_ExistingDocument_UpdatesAndReturns()
        {
            var id = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var dto = new PreApprovalDTO
            {
                Id = id,
                Status = 1,
                Scenarios = new List<ScenarioDTO>()
            };
            var existingDoc = new PreApprovalDocument { Id = id, UserId = userId, Scenarios = new List<ScenarioDTO>() };
            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(id)).ReturnsAsync(existingDoc);

            var result = await _service.SavePreApproval(dto);

            Assert.NotNull(result);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(id, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task DeletePreApproval_ValidIds_DeletesSuccessfully()
        {
            var ids = new List<Guid> { Guid.NewGuid() };
            _mockPreApprovalRepository.Setup(x => x.DeleteManyAsync(ids)).Returns(Task.CompletedTask);

            await _service.DeletePreApproval(ids);

            _mockPreApprovalRepository.Verify(x => x.DeleteManyAsync(ids), Times.Once);
        }

        [Fact]
        public async Task DeletePreApproval_NullIds_ThrowsValidationException()
        {
            List<Guid>? ids = null;
            await Assert.ThrowsAsync<ValidationException>(() => _service.DeletePreApproval(ids!));
        }

        [Fact]
        public async Task DeletePreApproval_EmptyIds_ThrowsValidationException()
        {
            await Assert.ThrowsAsync<ValidationException>(() => _service.DeletePreApproval(new List<Guid>()));
        }

        [Fact]
        public async Task UpdateApplicationStatus_ValidId_UpdatesAndReturns()
        {
            var id = Guid.NewGuid();
            var status = 2;
            var doc = new PreApprovalDocument { Id = id, Status = 0, Scenarios = new List<ScenarioDTO>() };
            _mockPreApprovalRepository.Setup(x => x.GetByIdAsync(id)).ReturnsAsync(doc);
            _mockPreApprovalRepository.Setup(x => x.UpdateAsync(id, It.IsAny<PreApprovalDocument>())).Returns(Task.CompletedTask);

            var result = await _service.UpdateApplicationStatus(id, status);

            Assert.Equal(status, result.Status);
            _mockPreApprovalRepository.Verify(x => x.UpdateAsync(id, It.IsAny<PreApprovalDocument>()), Times.Once);
        }

        [Fact]
        public async Task GetDashboardData_ReturnsDashboardDTO()
        {
            var userId = Guid.NewGuid();
            _mockLoginUserDetails.Setup(x => x.UserID).Returns(userId);
            _mockPreApprovalRepository.Setup(x => x.GetByDateRange(It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(new List<PreApprovalDocument>());
            _mockPreApprovalRepository.Setup(x => x.GetByPreApprovedDateRange(It.IsAny<Guid?>(), It.IsAny<Guid?>(), It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(new List<PreApprovalDocument>());

            _mockUserRepository.Setup(x => x.GetUserById(userId))
                .ReturnsAsync(new UserEntity { Id = userId });

            var result = await _service.GetDashboardData();

            Assert.NotNull(result);
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
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO { Purchase = new PurchaseScenarioDTO { BorrowerInfo = new BorrowerInfoDTO { BorrowerName = "Jane Doe" } } }
                }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(originalId))
                .ReturnsAsync(preApproval);

            PreApprovalDocument? insertedDoc = null;
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
            Assert.NotNull(insertedDoc.Scenarios);
            Assert.Single(insertedDoc.Scenarios);
            Assert.Equal("Jane Doe", insertedDoc.Scenarios[0].Purchase?.BorrowerInfo?.BorrowerName);
        }

        [Fact]
        public async Task ClonePreApproval_NotFound_DoesNotInsertAndDoesNotThrow()
        {
            // Arrange
            var missingId = Guid.NewGuid();
            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(missingId))
                .ReturnsAsync((PreApprovalDocument)null!);

            // Act
            await _service.ClonePreApproval(missingId);

            // Assert
            _mockPreApprovalRepository.Verify(x => x.InsertAsync(It.IsAny<PreApprovalDocument>()), Times.Never);
        }

        [Fact]
        public async Task GetQuickQuote_ValidIds_ComputesExpectedFields()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
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
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        Id = scenarioId,
                        Purchase = new PurchaseScenarioDTO
                        {
                            LoanProgram = new LoanProgramDTO
                            {
                                Price = purchasePrice,
                                InterestRate = interestRate,
                                Term = term,
                                MonthlyPropertyTax = monthlyPropertyTax,
                                UPMIPRate = 0m
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
                                TitleFees = 0m,
                                ThirdPartyLenderFee = 0m
                            }
                        }
                    }
                }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            var downAmount = (purchasePrice * downPercent) / 100m; // 60,000
            var totalLoanAmount = purchasePrice - downAmount;
            var expectedPI = (decimal)PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount, interestRate, term);
            var expectedMonthlyTotal = expectedPI + monthlyPropertyTax + hazardInsurance + mortgageInsurance + hoaFee;

            // Act
            var result = await _service.GetQuickQuote(preApprovalId, scenarioId);

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
            var scenarioId = Guid.NewGuid();
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
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        Id = scenarioId,
                        Purchase = new PurchaseScenarioDTO
                        {
                            LoanProgram = new LoanProgramDTO
                            {
                                Price = purchasePrice,
                                InterestRate = interestRate,
                                Term = term,
                                MonthlyPropertyTax = monthlyPropertyTax,
                                UPMIPRate = 0m
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
                                TitleFees = 0m,
                                ThirdPartyLenderFee = 0m
                            }
                        }
                    }
                }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            var downAmount = (purchasePrice * downPercent) / 100m; // 20,000
            var totalLoanAmount = purchasePrice - downAmount;
            var expectedPI = (decimal)PreApprovalHelper.CalculateMonthlyPI(totalLoanAmount, interestRate, term);
            var expectedMonthlyTotal = expectedPI + monthlyPropertyTax + hazardInsurance + mortgageInsurance + hoaFee;

            // Act
            var result = await _service.GetQuickQuote(preApprovalId, scenarioId);

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
            Assert.Equal(0m, result.SellerCredit);
            Assert.Equal(0m, result.LenderCredit);
            Assert.Equal(0m, result.EarnestMoneyDeposit);
            Assert.Equal(0m, result.MiscFee4);
        }

        [Fact]
        public async Task GetQuickQuote_Refinance_ReturnsQuote()
        {
            // Arrange
            var preApprovalId = Guid.NewGuid();
            var scenarioId = Guid.NewGuid();
            
            var preApproval = new PreApprovalDocument
            {
                Id = preApprovalId,
                LoanType = 1, // Refinance
                Scenarios = new List<ScenarioDTO>
                {
                    new ScenarioDTO
                    {
                        Id = scenarioId,
                        Refinance = new RefinanceScenarioDTO
                        {
                            RefinanceInfo = new RefinanceInfoDTO
                            {
                                EstimatedPropertyValue = 400000,
                                LoanAmount = 300000
                            },
                            LoanStructure = new RefinanceLoanStructureDTO
                            {
                                InterestRate = 4.0m,
                                LoanProgram = (int)LoanProgram.FHA,
                                MonthlyTaxAmount = 250,
                                HazardInsurance = 100,
                                MI = 50,
                                AssociationFee = 25
                            },
                            LoanProgram = new RefinanceLoanProgramDTO
                            {
                                UPMIPRate = 1.75m,
                                Term = 30,
                                ClosingCosts = 5000
                            }
                        }
                    }
                }
            };

            _mockPreApprovalRepository
                .Setup(x => x.GetByIdAsync(preApprovalId))
                .ReturnsAsync(preApproval);

            var loanAmount = 300000m;
            var upmipAmount = loanAmount * (1.75m / 100m); // 5250
            var expectedPI = (decimal)PreApprovalHelper.CalculateMonthlyPI(loanAmount + upmipAmount, 4.0m, 30);
            var expectedMonthlyTotal = expectedPI + 250 + 100 + 50 + 25;

            // Act
            var result = await _service.GetQuickQuote(preApprovalId, scenarioId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(400000, result.HomeValue);
            Assert.Equal(4.0m, result.InterestRate);
            Assert.Equal(0, result.DownPaymentPercent);
            Assert.Equal(0, result.DownPayment);
            Assert.Equal(expectedPI, result.PrincipalAndInterest);
            Assert.Equal(250, result.PropertyTax);
            Assert.Equal(100, result.HazardInsurance);
            Assert.Equal(50, result.MortgageInsurance);
            Assert.Equal(25, result.HoaFee);
            Assert.Equal(expectedMonthlyTotal, result.MonthlyTotal);
            Assert.Equal(5000, result.ClosingCosts);
            Assert.Equal(5000, result.TotalRequired); // totalRequired = closingCosts
            Assert.Equal(0, result.SellerCredit);
            Assert.Equal(0, result.LenderCredit);
            Assert.Equal(0, result.EarnestMoneyDeposit);
            Assert.Equal(0, result.MiscFee4);
            Assert.Equal((int)LoanProgram.FHA, result.LoanProgram);
        }
    }
} 