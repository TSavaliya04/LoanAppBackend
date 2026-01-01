using System.Data;
using Npgsql;
using Microsoft.Extensions.Configuration;

namespace LoanPortal.Infrastructure;
public class DataContext
{

  private readonly IConfiguration _config;
  public String _server;
  public String _database;
  public String _userId;
  public String _password;

  public DataContext(IConfiguration config)
  {
    _config = config;
    _server = config.GetSection("ConnectionStrings").GetSection("postgresserver").Value;
    _database = config.GetSection("ConnectionStrings").GetSection("postgresdatabase").Value;
    _userId = config.GetSection("ConnectionStrings").GetSection("postgresuserid").Value;
    _password = config.GetSection("ConnectionStrings").GetSection("postgrespassword").Value;
  }

  public IDbConnection CreateConnection()
  {
        var connectionString = $"Host={_server}; Database={_database};Port=5432; Username={_userId}; Password={_password};";// Ssl Mode=Require";
    return new NpgsqlConnection(connectionString);
  }
}
