using System.IO.Compression;
using LoanPortal.Shared.Constants;
using Microsoft.AspNetCore.Http;

namespace LoanPortal.Core.Services;

/// <summary>Performs inexpensive, synchronous validation before an import job is created.</summary>
public static class FileValidator
{
    public static string? Validate(IReadOnlyList<IFormFile>? files)
    {
        if (files is null || files.Count == 0)
            return "No files were uploaded.";

        if (files.Count == 1 && IsZip(files[0]))
            return ValidateZipFile(files[0]);

        if (files.Any(IsZip))
            return "Do not mix ZIP and XML files in the same upload.";

        if (files.Count > ImportConstants.MaxXmlFiles)
            return $"Too many files. Maximum allowed is {ImportConstants.MaxXmlFiles} XML files per import.";

        foreach (var file in files)
        {
            if (!IsXml(file))
                return $"'{file.FileName}' is not a valid XML file. Only .xml and .zip are accepted.";

            if (file.Length <= 0)
                return $"'{file.FileName}' is empty.";

            if (file.Length > ImportConstants.MaxXmlBytes)
                return $"'{file.FileName}' exceeds the {ImportConstants.MaxXmlBytes / 1024 / 1024} MB per-file limit.";
        }

        return null;
    }

    private static string? ValidateZipFile(IFormFile zip)
    {
        if (zip.Length <= 0)
            return "ZIP file is empty.";
        if (zip.Length > ImportConstants.MaxZipBytes)
            return $"ZIP file exceeds the {ImportConstants.MaxZipBytes / 1024 / 1024} MB limit.";

        try
        {
            using var stream = zip.OpenReadStream();
            using var archive = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: false);

            if (archive.Entries.Count > ImportConstants.MaxZipEntries)
                return $"ZIP contains {archive.Entries.Count} entries. Maximum is {ImportConstants.MaxZipEntries}.";

            long declaredTotal = 0;
            var xmlCount = 0;
            foreach (var entry in archive.Entries)
            {
                if (string.IsNullOrEmpty(entry.Name))
                    continue;

                if (!entry.Name.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
                    return $"ZIP contains non-XML file '{entry.Name}'. Upload a ZIP with only .xml files.";

                xmlCount++;
                declaredTotal += entry.Length;
                if (entry.Length > ImportConstants.MaxXmlBytes ||
                    declaredTotal > ImportConstants.MaxZipUncompressedBytes)
                {
                    return $"ZIP entry '{entry.Name}' or total uncompressed size exceeds the safety limit.";
                }
            }

            if (xmlCount == 0)
                return "ZIP contains no XML files.";
            if (xmlCount > ImportConstants.MaxXmlFiles)
                return $"ZIP contains {xmlCount} XML files. Maximum is {ImportConstants.MaxXmlFiles}.";
        }
        catch (InvalidDataException)
        {
            return "The uploaded ZIP file is invalid or corrupted.";
        }

        return null;
    }

    private static bool IsZip(IFormFile file) =>
        file.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase) ||
        file.ContentType is "application/zip" or "application/x-zip-compressed";

    private static bool IsXml(IFormFile file) =>
        file.FileName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase);
}
