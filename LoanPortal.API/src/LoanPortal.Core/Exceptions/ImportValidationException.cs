namespace LoanPortal.Core.Exceptions;

public class ImportValidationException : Exception
{
    public ImportValidationException(string message) : base(message) { }
}
