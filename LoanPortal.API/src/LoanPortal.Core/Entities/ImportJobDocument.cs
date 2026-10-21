using LoanPortal.Shared.Enum;
using MongoDB.Bson.Serialization.Attributes;

namespace LoanPortal.Core.Entities;

[BsonIgnoreExtraElements]
public class ImportJobDocument
{
    [BsonId]
    public Guid Id { get; set; }

    [BsonElement("userId")]
    public Guid UserId { get; set; }

    [BsonElement("status")]
    public ImportJobStatus Status { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [BsonElement("files")]
    public List<FileImportItem> Files { get; set; } = new();
}

[BsonIgnoreExtraElements]
public class FileImportItem
{
    [BsonElement("fileId")]
    public Guid FileId { get; set; }

    [BsonElement("fileName")]
    public string FileName { get; set; } = string.Empty;

    [BsonElement("status")]
    public FileImportStatus Status { get; set; }

    [BsonElement("preApprovalId")]
    public Guid? PreApprovalId { get; set; }

    [BsonElement("errorReason")]
    public string? ErrorReason { get; set; }

    [BsonElement("processedAt")]
    public DateTime? ProcessedAt { get; set; }
}
