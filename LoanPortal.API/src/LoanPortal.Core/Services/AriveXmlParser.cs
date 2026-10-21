using System.Globalization;
using System.Xml;
using System.Xml.Linq;
using LoanPortal.Core.Exceptions;

namespace LoanPortal.Core.Services;

/// <summary>Safely parses the structural minimum required from an ARIVE MISMO 3.4 export.</summary>
public class AriveXmlParser
{
    public AriveXmlPayload Parse(byte[] content)
    {
        if (content is null || content.Length == 0)
            throw new XmlParseException("The XML file is empty.");

        XDocument document;
        try
        {
            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Prohibit,
                XmlResolver = null,
                MaxCharactersInDocument = 10_000_000,
                MaxCharactersFromEntities = 1_024
            };
            using var stream = new MemoryStream(content, writable: false);
            using var reader = XmlReader.Create(stream, settings);
            document = XDocument.Load(reader, LoadOptions.None);
        }
        catch (XmlException ex)
        {
            throw new XmlParseException("Malformed XML.", ex);
        }

        var ns = document.Root?.Name.Namespace ?? XNamespace.None;
        var message = document.Descendants(ns + "MESSAGE").FirstOrDefault()
            ?? throw new XmlParseException("Missing required MISMO element: <MESSAGE>.");

        var baseLoanAmount = RequireDescendant(message, ns, "TERMS_OF_LOAN", "BaseLoanAmount");
        var noteRate = RequireDescendant(message, ns, "TERMS_OF_LOAN", "NoteRatePercent");
        RequireNonEmpty(RequireDescendant(message, ns, "TERMS_OF_LOAN", "MortgageType"), "TERMS_OF_LOAN/MortgageType");
        RequireDescendant(message, ns, "PARTIES", "PARTY");
        RequireDecimal(baseLoanAmount, "TERMS_OF_LOAN/BaseLoanAmount");
        RequireDecimal(noteRate, "TERMS_OF_LOAN/NoteRatePercent");

        return new AriveXmlPayload(document, ns);
    }

    private static XElement RequireDescendant(XElement root, XNamespace ns, string container, string field)
    {
        var value = root.Descendants(ns + container)
            .SelectMany(element => element.Descendants(ns + field))
            .FirstOrDefault();
        return value ?? throw new XmlParseException($"Missing required MISMO element: <{container}>/<{field}>.");
    }

    private static void RequireNonEmpty(XElement value, string name)
    {
        if (string.IsNullOrWhiteSpace(value.Value))
            throw new XmlParseException($"Invalid required MISMO value: <{name}>.");
    }

    private static void RequireDecimal(XElement value, string name)
    {
        if (!decimal.TryParse(value.Value.Trim(), NumberStyles.Number, CultureInfo.InvariantCulture, out _))
            throw new XmlParseException($"Invalid numeric MISMO value: <{name}>.");
    }
}

public record AriveXmlPayload(XDocument Document, XNamespace Namespace);
