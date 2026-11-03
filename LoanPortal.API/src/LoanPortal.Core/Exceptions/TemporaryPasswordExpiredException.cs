namespace LoanPortal.Core.Exceptions
{
    public class TemporaryPasswordExpiredException : Exception
    {
        public const string ErrorCode = "TEMPORARY_PASSWORD_EXPIRED";

        public TemporaryPasswordExpiredException()
            : base("Your temporary password has expired. Please contact an administrator for a new temporary password.")
        {
        }

        public TemporaryPasswordExpiredException(string message) : base(message)
        {
        }
    }
}
