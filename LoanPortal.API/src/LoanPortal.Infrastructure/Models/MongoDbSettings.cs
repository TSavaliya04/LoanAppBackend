namespace LoanPortal.Infrastructure.Models
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string PreApprovalCollectionName { get; set; } = string.Empty;
        public string UserCollectionName { get; set; } = string.Empty;
    }
}
