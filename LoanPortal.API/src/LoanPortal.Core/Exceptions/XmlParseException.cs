namespace LoanPortal.Core.Exceptions;

public class XmlParseException : Exception
{
    public XmlParseException(string message, Exception? innerException = null)
        : base(message, innerException) { }
}
