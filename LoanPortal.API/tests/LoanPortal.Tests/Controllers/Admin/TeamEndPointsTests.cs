using Microsoft.AspNetCore.Mvc;
using Moq;
using LoanPortal.API.Controllers.Admin;
using LoanPortal.Core.Entities;
using LoanPortal.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace LoanPortal.Tests.Controllers.Admin
{
    public class TeamEndPointsTests
    {
        private readonly Mock<ITeamService> _mockTeamService;
        private readonly TeamEndPoints _controller;

        public TeamEndPointsTests()
        {
            _mockTeamService = new Mock<ITeamService>();
            _controller = new TeamEndPoints(_mockTeamService.Object);
        }

        #region CreateTeam
        [Fact]
        public async Task CreateTeam_ValidRequest_ReturnsOkResult()
        {
            var request = new CreateTeamRequest();
            var expected = new TeamDTO();
            _mockTeamService.Setup(x => x.CreateTeam(request)).ReturnsAsync(expected);

            var result = await _controller.CreateTeam(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<TeamDTO>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expected, response.Data);
        }

        [Fact]
        public async Task CreateTeam_Unauthorized_ReturnsForbidden()
        {
            var request = new CreateTeamRequest();
            _mockTeamService.Setup(x => x.CreateTeam(request)).ThrowsAsync(new UnauthorizedAccessException("error"));

            var result = await _controller.CreateTeam(request);

            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(403, statusCodeResult.StatusCode);
        }
        #endregion

        #region UpdateTeam
        [Fact]
        public async Task UpdateTeam_ValidRequest_ReturnsOkResult()
        {
            var request = new UpdateTeamRequest();
            var expected = new TeamDTO();
            _mockTeamService.Setup(x => x.UpdateTeam(request)).ReturnsAsync(expected);

            var result = await _controller.UpdateTeam(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<TeamDTO>>(okResult.Value);
            Assert.True(response.Success);
        }
        #endregion

        #region DeleteTeam
        [Fact]
        public async Task DeleteTeam_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            _mockTeamService.Setup(x => x.DeleteTeam(id)).ReturnsAsync(true);

            var result = await _controller.DeleteTeam(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<object>>(okResult.Value);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task DeleteTeam_Conflict_ReturnsConflict()
        {
            var id = Guid.NewGuid();
            _mockTeamService.Setup(x => x.DeleteTeam(id)).ThrowsAsync(new InvalidOperationException("error"));

            var result = await _controller.DeleteTeam(id);

            var statusCodeResult = Assert.IsType<ConflictObjectResult>(result);
            Assert.Equal(409, statusCodeResult.StatusCode);
        }
        #endregion

        #region GetTeamById
        [Fact]
        public async Task GetTeamById_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var expected = new TeamDTO();
            _mockTeamService.Setup(x => x.GetTeamById(id)).ReturnsAsync(expected);

            var result = await _controller.GetTeamById(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<TeamDTO>>(okResult.Value);
            Assert.True(response.Success);
        }
        #endregion

        #region GetTeamsByCompany
        [Fact]
        public async Task GetTeamsByCompany_ValidRequest_ReturnsOkResult()
        {
            var request = new DefaultRequestWrapper { Params = new DefaultRequest() };
            var expected = new PagedTeamsDTO();
            _mockTeamService.Setup(x => x.GetTeamsByCompany(request.Params)).ReturnsAsync(expected);

            var result = await _controller.GetTeamsByCompany(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<PagedTeamsDTO>>(okResult.Value);
            Assert.True(response.Success);
        }
        #endregion

        #region GetTeamMembers
        [Fact]
        public async Task GetTeamMembers_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            var request = new DefaultRequestWrapper { Params = new DefaultRequest() };
            var expected = new TeamMembersDTO();
            _mockTeamService.Setup(x => x.GetTeamMembers(id, request.Params)).ReturnsAsync(expected);

            var result = await _controller.GetTeamMembers(id, request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse<TeamMembersDTO>>(okResult.Value);
            Assert.True(response.Success);
        }
        #endregion

        #region AssignUserToTeam
        [Fact]
        public async Task AssignUserToTeam_ValidRequest_ReturnsOkResult()
        {
            var request = new AssignUserToTeamRequest();
            _mockTeamService.Setup(x => x.AssignUserToTeam(request)).ReturnsAsync(true);

            var result = await _controller.AssignUserToTeam(request);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }
        #endregion

        #region RemoveUserFromTeam
        [Fact]
        public async Task RemoveUserFromTeam_ValidRequest_ReturnsOkResult()
        {
            var id = Guid.NewGuid();
            _mockTeamService.Setup(x => x.RemoveUserFromTeam(id)).ReturnsAsync(true);

            var result = await _controller.RemoveUserFromTeam(id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }
        #endregion
    }
}
