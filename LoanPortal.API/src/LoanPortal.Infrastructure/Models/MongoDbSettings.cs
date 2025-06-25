namespace LoanPortal.Infrastructure.Models
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
        public string PreApprovalCollectionName { get; set; }
        public string UserCollectionName { get; set; } 
    }
}
