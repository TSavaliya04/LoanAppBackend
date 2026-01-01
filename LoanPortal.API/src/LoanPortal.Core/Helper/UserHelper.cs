using LoanPortal.Core.Entities;
using LoanPortal.Core.Repositories;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace LoanPortal.Core.Helper
{
    public interface IUserHelper
    {
        Task<string> ValidateUser(CreateUserRequest request);
        Task SendWelcomeMail(string email, string displayName);
        Task ResetPassword(string email, string link);
    }

        public class UserHelper : IUserHelper
    {
        private readonly IUserRepository _userRepository;
        private readonly SMTPConfigModel _smtpConfig;

        public UserHelper(IUserRepository userRepository, IOptions<SMTPConfigModel> smtpConfig)
        {
            _userRepository = userRepository;
            _smtpConfig = smtpConfig.Value;
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

                // Phone: Optional, but if provided, must be US (1XXXXXXXXXX) or Indian (91XXXXXXXXXX) number
                if (!string.IsNullOrWhiteSpace(request.Phone))
                {
                    bool isUS = Regex.IsMatch(request.Phone, @"^1\d{10}$");
                    bool isIN = Regex.IsMatch(request.Phone, @"^91\d{10}$");
                    if (!isUS && !isIN)
                        error = "Phone number must be a valid US (1XXXXXXXXXX) or Indian (91XXXXXXXXXX) number.";
                }

                // Password: Minimum 6 characters, at least one letter, one number, and one special character
                if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6 ||
                    !request.Password.Any(char.IsLetter) || !request.Password.Any(char.IsDigit) ||
                    !request.Password.Any(ch => !char.IsLetterOrDigit(ch)))
                    error = "Password must be at least 6 characters long, include letters, numbers, and one special character.";

                UserEntity user = await _userRepository.GetUserByEmail(request.Email);
                if (user != null)
                    error = "User with given email is already exists.";

                if (request != null && !string.IsNullOrEmpty(request.Phone))
                {
                    user = await _userRepository.GetUserByPhone(request.Phone.Replace("+", "").Replace(" ", ""));
                    if (user != null)
                        error = "User with given phone number is already exists.";
                }
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
                CompanyName = entity.CompanyName,
                NMLS = entity.NMLS,
                LastLoginDate = entity.LastLoginDate,
            };
        }

        public async Task SendWelcomeMail(string email, string displayName)
        {
            UserEmailOptions options = new UserEmailOptions
            {
                ToEmails = new List<string>() { email },
                PlaceHolders = new List<KeyValuePair<string, string>>()
                {
                    new KeyValuePair<string, string>("{{app_name}}","Loans N Stuff"),
                    new KeyValuePair<string, string>("{{diplay_name}}",displayName),
                },
            };
            options.Subject = UpdatePlaceHolders("Complete User Registration For {{app_name}}", options.PlaceHolders);
            var body = "<p>Hello {{diplay_name}},</p>\r\n<p>Welcome aboard! We're excited to have you with us!</p>";
            options.Body = UpdatePlaceHolders(body, options.PlaceHolders);

            await SendEmail(options);
        }

        public static string UpdatePlaceHolders(string text, List<KeyValuePair<string, string>> keyValuePairs)
        {
            if (!string.IsNullOrEmpty(text) && keyValuePairs != null)
            {
                foreach (var placeholder in keyValuePairs)
                {
                    if (text.Contains(placeholder.Key))
                    {
                        text = text.Replace(placeholder.Key, placeholder.Value);
                    }
                }
            }

            return text;
        }

        private async Task SendEmail(UserEmailOptions userEmailOptions)
        {
            MailMessage mail = new MailMessage
            {
                Subject = userEmailOptions.Subject,
                Body = userEmailOptions.Body,
                From = new MailAddress(_smtpConfig.SenderAddress, _smtpConfig.SenderDisplayName),
                IsBodyHtml = _smtpConfig.IsBodyHTML
            };

            foreach (var toEmail in userEmailOptions.ToEmails)
            {
                mail.To.Add(toEmail);
            }

            NetworkCredential networkCredential = new NetworkCredential(_smtpConfig.UserName, _smtpConfig.Password);

            SmtpClient smtpClient = new SmtpClient
            {
                Host = _smtpConfig.Host,
                Port = _smtpConfig.Port,
                EnableSsl = _smtpConfig.EnableSSL,
                UseDefaultCredentials = false,
                Credentials = networkCredential
            };

            mail.BodyEncoding = Encoding.Default;
            try
            {
                await smtpClient.SendMailAsync(mail);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public async Task ResetPassword(string email,string link)
        {
            UserEmailOptions options = new UserEmailOptions
            {
                ToEmails = new List<string>() { email },
                PlaceHolders = new List<KeyValuePair<string, string>>()
                {
                    new KeyValuePair<string, string>("{{EMAIL}}", email),
                    new KeyValuePair<string, string>("{{link}}",link),
                    new KeyValuePair<string, string>("{{APP_NAME}}","Loans N Stuff"),
                },
            };
            options.Subject = UpdatePlaceHolders("Reset your password for {{APP_NAME}}", options.PlaceHolders);
            var body = "<p>Hello,</p>\r\n<p>Follow this link to reset your {{APP_NAME}} password for your {{EMAIL}} account.</p>\r\n<p><a href='{{link}}'>{{link}}</a></p>\r\n<p>If you didn’t ask to reset your password, you can ignore this email.</p>\r\n<p>Thanks,</p>\r\n<p>Your {{APP_NAME}} team</p>";
            options.Body = UpdatePlaceHolders(body, options.PlaceHolders);

            await SendEmail(options);
        }
    }
}
