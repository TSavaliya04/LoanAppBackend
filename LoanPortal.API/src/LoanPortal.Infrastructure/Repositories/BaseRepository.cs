using LoanPortal.Infrastructure;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure.Repositories
{
    public abstract class BaseRepository
    {
        private readonly DataContext _context;

        public BaseRepository(DataContext context)
        {
            _context = context;
        }

        protected async Task<T> QuerySingleAsync<T>(string sql, object parameters, IDbTransaction transaction = null)
        {
            try
            {
                var connection = transaction?.Connection ?? _context.CreateConnection();
                return await connection.QuerySingleOrDefaultAsync<T>(sql, parameters, transaction);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GenericRepository.QuerySingleAsync -> " + ex.Message);
                throw new Exception("Exception in GenericRepository.QuerySingleAsync -> " + ex.Message);
            }
        }

        protected async Task<IEnumerable<T>> QueryAsync<T>(string sql, object parameters, IDbTransaction transaction = null)
        {
            try
            {
                var connection = transaction?.Connection ?? _context.CreateConnection();
                return await connection.QueryAsync<T>(sql, parameters, transaction);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GenericRepository.QueryAsync -> " + ex.Message);
                throw new Exception("Exception in GenericRepository.QueryAsync -> " + ex.Message);
            }
        }

        protected async Task<int> ExecuteAsync(string sql, object parameters, IDbTransaction transaction = null)
        {
            try
            {
                var connection = transaction?.Connection ?? _context.CreateConnection();
                return await connection.ExecuteAsync(sql, parameters, transaction);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GenericRepository.ExecuteAsync -> " + ex.Message);
                throw new Exception("Exception in GenericRepository.ExecuteAsync -> " + ex.Message);
            }
        }

        protected async Task ExecuteScalarAsync(string sql, object parameters, IDbTransaction transaction = null)
        {
            try
            {
                var connection = transaction?.Connection ?? _context.CreateConnection();
                await connection.ExecuteScalarAsync(sql, parameters, transaction);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GenericRepository.ExecuteAsync -> " + ex.Message);
                throw new Exception("Exception in GenericRepository.ExecuteAsync -> " + ex.Message);
            }
        }
    }
}
