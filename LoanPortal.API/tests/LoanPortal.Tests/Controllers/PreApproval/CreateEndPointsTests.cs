using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.PreApproval;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using LoanPortal.Core.Services;
using Xunit;

namespace LoanPortal.Tests.Controllers.PreApproval
{
    public class CreateEndPointsTests
    {
        private readonly Mock<IPreApprovalService> _mockPreApprovalService;
        private readonly Mock<ILoginUserDetails> _mockLoginUserDetails;
        private readonly CreateEndPoints _controller;

        public CreateEndPointsTests()
        {
            _mockPreApprovalService = new Mock<IPreApprovalService>();
            _mockLoginUserDetails = new Mock<ILoginUserDetails>();
            _controller = new CreateEndPoints(_mockPreApprovalService.Object, _mockLoginUserDetails.Object);
        }

        /*[Fact]
        public async Task BorrowerInfo_ValidData_ReturnsOkResult()
        {
            var borrowerInfo = new BorrowerInfoDTO
            {
                BorrowerName = "John Doe",
                BorrowerEmail = "john.doe@example.com",
                BorrowerCellNumber = "1234567890"
            };

            _mockPreApprovalService
                .Setup(x => x.CreateBorrowerInfo(It.IsAny<BorrowerInfoDTO>()))
                .ReturnsAsync(borrowerInfo);

            var result = await _controller.BorrowerInfo(borrowerInfo);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<BorrowerInfoDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(borrowerInfo, response.Data);
        }

        [Fact]
        public async Task BorrowerInfo_ServiceThrowsNotFoundException_ReturnsNotFound()
        {
            var borrowerInfo = new BorrowerInfoDTO();
            _mockPreApprovalService
                .Setup(x => x.CreateBorrowerInfo(It.IsAny<BorrowerInfoDTO>()))
                .ThrowsAsync(new Core.Exceptions.NotFoundException("Not found"));

            var result = await _controller.BorrowerInfo(borrowerInfo);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse<BorrowerInfoDTO>>(notFoundResult.Value);
            Assert.False(response.Success);
        }

        [Fact]
        public async Task PurchaseInfo_ValidData_ReturnsOkResult()
        {
            var purchaseInfo = new PurchaseInfoDTO
            {
                PurchasePrice = 300000,
                DownPayment = 60000,
                LoanAmount = 240000
            };

            _mockPreApprovalService
                .Setup(x => x.CreatePurchaseInfo(It.IsAny<PurchaseInfoDTO>()))
                .ReturnsAsync(purchaseInfo);

            var result = await _controller.PurchaseInfo(purchaseInfo);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PurchaseInfoDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(purchaseInfo, response.Data);
        }

        [Fact]
        public async Task LenderFees_ValidData_ReturnsOkResult()
        {
            var lenderFees = new LenderFeesDTO
            {
                LoanOriginationFee = 1000,
                AppraisalFee = 500,
                EscrowFees = 750
            };

            _mockPreApprovalService
                .Setup(x => x.CreateLenderFees(It.IsAny<LenderFeesDTO>()))
                .ReturnsAsync(lenderFees);

            var result = await _controller.LenderFees(lenderFees);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<LenderFeesDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(lenderFees, response.Data);
        }

        [Fact]
        public async Task PrepaidItems_ValidData_ReturnsOkResult()
        {
            var prepaidItems = new PrepaidItemsDTO
            {
                PrepaidInterestDays = 15,
                PrepaidInterestAmount = 2000,
                HazardInsurance = 1200,
                HazardInsuranceMonths = 12,
                PropertyTaxMonths = 6,
                PropertyTaxAmount = 2000
            };

            _mockPreApprovalService
                .Setup(x => x.CreatePrepaidItems(It.IsAny<PrepaidItemsDTO>()))
                .ReturnsAsync(prepaidItems);

            var result = await _controller.PrepaidItems(prepaidItems);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PrepaidItemsDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(prepaidItems, response.Data);
        }

        [Fact]
        public async Task MiscFees_ValidData_ReturnsOkResult()
        {
            var miscFees = new MiscFeesDTO
            {
                EarnestMoneyDeposit = 500,
                SellerCredit = 50,
                LenderCredit = 20,
                MiscFee4 = 100
            };

            _mockPreApprovalService
                .Setup(x => x.CreateMiscFees(It.IsAny<MiscFeesDTO>()))
                .ReturnsAsync(miscFees);

            var result = await _controller.MiscFees(miscFees);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<MiscFeesDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(miscFees, response.Data);
        }

        [Fact]
        public async Task BorrowerIncome_ValidData_ReturnsOkResult()
        {
            var borrowerIncome = new BorrowerIncomeDTO
            {
                BorrowerName = "John Doe",
                MonthlyIncome = 8000,
            };

            var borrowerIncomeList = new List<BorrowerIncomeDTO> { borrowerIncome };

            _mockPreApprovalService
                .Setup(x => x.CreateBorrowerIncome(It.IsAny<List<BorrowerIncomeDTO>>()))
                .ReturnsAsync(borrowerIncomeList);

            var result = await _controller.BorrowerIncome(borrowerIncomeList);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<List<BorrowerIncomeDTO>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Data);
            Assert.Equal(borrowerIncome.BorrowerName, response.Data[0].BorrowerName);
        }*/

        //[Fact]
        //public async Task DebtBreakdown_ValidData_ReturnsOkResult()
        //{
        //    var debtBreakdown = new DebtBreakdownDTO
        //    {
        //        DebtType = 1,
        //        Balance = 5000,
        //        HighCredit = 10000,
        //        MonthlyPayment = 200
        //    };

        //    _mockPreApprovalService
        //        .Setup(x => x.CreateDebtBreakdown(It.IsAny<List<DebtBreakdownDTO>>()))
        //        .ReturnsAsync(new List<DebtBreakdownDTO> { debtBreakdown });

        //    var result = await _controller.DebtBreakdown(new List<DebtBreakdownDTO> { debtBreakdown });

        //    var okResult = Assert.IsType<OkObjectResult>(result);
        //    var response = Assert.IsType<ApiResponse<List<DebtBreakdownDTO>>>(okResult.Value);
        //    Assert.True(response.Success);
        //    Assert.Single(response.Data);
        //    Assert.Equal(debtBreakdown, response.Data[0]);
        //}

        /*[Fact]
        public async Task LoanProgram_ValidData_ReturnsOkResult()
        {
            var loanProgram = new LoanProgramDTO
            {
                LoanProgram = 2,
                InterestRate = 5.5m,
                Term = 30,
                FrontEndRatio = 28,
                BackEndRatio = 36,
                BaseLoanAmount = 240000,
                DownPaymentAmount = 60000,
                DownPaymentPercentage = 20
            };

            _mockPreApprovalService
                .Setup(x => x.CreateLoanProgram(It.IsAny<LoanProgramDTO>()))
                .ReturnsAsync(loanProgram);

            var result = await _controller.LoanProgram(loanProgram);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<LoanProgramDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(loanProgram, response.Data);
        }

        [Fact]
        public async Task ClonePreApproval_ValidId_ReturnsOkTrue()
        {
            var preApprovalId = Guid.NewGuid();

            _mockPreApprovalService
                .Setup(x => x.ClonePreApproval(preApprovalId))
                .Returns(Task.CompletedTask);

            var result = await _controller.ClonePreApproval(preApprovalId);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<bool>>(okResult.Value);
            Assert.True(response.Success);
            Assert.True(response.Data);
        }

        [Fact]
        public async Task ClonePreApproval_NotFound_ReturnsNotFound()
        {
            var preApprovalId = Guid.NewGuid();

            _mockPreApprovalService
                .Setup(x => x.ClonePreApproval(preApprovalId))
                .ThrowsAsync(new Core.Exceptions.NotFoundException("Not found"));

            var result = await _controller.ClonePreApproval(preApprovalId);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponse<LoanProgramDTO>>(notFoundResult.Value);
            Assert.False(response.Success);
        }

        [Fact]
        public async Task ClonePreApproval_Exception_ReturnsInternalServerError()
        {
            var preApprovalId = Guid.NewGuid();

            _mockPreApprovalService
                .Setup(x => x.ClonePreApproval(preApprovalId))
                .ThrowsAsync(new Exception("boom"));

            var result = await _controller.ClonePreApproval(preApprovalId);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            var response = Assert.IsType<ApiResponse<LoanProgramDTO>>(statusCodeResult.Value);
            Assert.False(response.Success);
        }*/
    }
} 