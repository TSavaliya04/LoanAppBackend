namespace LoanPortal.Shared.Constants;

/// <summary>Limits and operational settings for XML quote imports.</summary>
public static class ImportConstants
{
    public const int MaxXmlFiles = 10;
    public const long MaxXmlBytes = 5_242_880;
    public const long MaxZipBytes = 52_428_800;
    public const long MaxZipUncompressedBytes = 104_857_600;
    public const int MaxZipEntries = 100;

    public const int MaxConcurrentProcessors = 4;
    public const int QueueCapacity = 200;
    public const int StaleJobSweepIntervalMinutes = 30;
    public const int StaleJobThresholdHours = 2;

    public const string FcmImportCompleteTitle = "XML Import Complete";
    public const string FcmImportCompleteBodyTemplate = "{0} of {1} file(s) imported successfully.";
}
