using Microsoft.Extensions.Options;
using MongoDB.Driver;
using LoanPortal.Infrastructure.Models;
using LoanPortal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;
        private readonly MongoDbSettings _settings;

        public MongoDbContext(IOptions<MongoDbSettings> options)
        {
            _settings = options.Value;
            var client = new MongoClient(_settings.ConnectionString);
            _database = client.GetDatabase(_settings.DatabaseName);
        }

        public IMongoCollection<PreApprovalDocument> PreApprovals =>
            _database.GetCollection<PreApprovalDocument>("PreApprovals");

        public IMongoCollection<UserEntity> Users =>
            _database.GetCollection<UserEntity>("Users");

        public IMongoCollection<CompanyEntity> Companies =>
            _database.GetCollection<CompanyEntity>("Companies");

        public IMongoCollection<TeamEntity> Teams =>
            _database.GetCollection<TeamEntity>("Teams");
    }
}
