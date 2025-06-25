using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace LoanPortal.Core.Helper
{
    public interface IUserHelper
    {
        Task<string> ValidateUser(CreateUserRequest request);

    }

    public class UserHelper : IUserHelper
    {
        private readonly IUserRepository _userRepository;

        public UserHelper(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<string> ValidateUser(CreateUserRequest request)
        {
            string error = "";

            try
            {
                // Name: Only alphabets, 2-50 characters
                if (string.IsNullOrWhiteSpace(request.FirstName) || request.FirstName.Length < 2 || request.FirstName.Length > 50 || !request.FirstName.All(char.IsLetter))
                    error = "FirstName must be 2-50 alphabetic characters.";

                if (string.IsNullOrWhiteSpace(request.LastName) || request.LastName.Length < 2 || request.LastName.Length > 50 || !request.LastName.All(char.IsLetter))
                    error = "LastName must be 2-50 alphabetic characters.";

                // Email: Simple email validation
                if (string.IsNullOrWhiteSpace(request.Email) || !Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                    error = "Invalid email format.";

                // Phone: US phone number with country code (1XXXXXXXXXX, no plus sign)
                if (string.IsNullOrWhiteSpace(request.Phone) || !Regex.IsMatch(request.Phone, @"^1\d{10}$"))
                    error = "Phone number must be a valid US number with country code, e.g., 1XXXXXXXXXX";

                // Password: Minimum 6 characters, at least one letter, one number, and one special character
                if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6 ||
                    !request.Password.Any(char.IsLetter) || !request.Password.Any(char.IsDigit) ||
                    !request.Password.Any(ch => !char.IsLetterOrDigit(ch)))
                    error = "Password must be at least 6 characters long, include letters, numbers, and one special character.";

                UserEntity user = await _userRepository.GetUserByEmail(request.Email);
                if (user != null)
                    error = "User with given email is already exists.";

                user = await _userRepository.GetUserByPhone(request.Phone.Replace("+", "").Replace(" ", ""));
                if (user != null)
                    error = "User with given phone number is already exists.";
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in UserHelper.ValidateUser -> " + ex.Message);
                throw new Exception("Exception in UserHelper.ValidateUser -> " + ex.Message);
            }

            return error;
        }

        public static UserDTO MaptoUserDTO(UserEntity entity)
        {
            return new UserDTO
            {
                Id = entity.Id,
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                Email = entity.Email,
                Phone = entity.Phone,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                JobTitle = entity.JobTitle,
                Address = entity.Address,
                Profile = entity.Profile,
                CompanyName = entity.CompanyName
            };
        }
    }
}
