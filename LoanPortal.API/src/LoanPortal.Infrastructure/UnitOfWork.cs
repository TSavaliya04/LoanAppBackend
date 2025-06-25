using LoanPortal.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DataContext _context;
        private IDbConnection _connection;
        private IDbTransaction _transaction;
        private bool _disposed;

        public UnitOfWork(DataContext context)
        {
            _context = context;
        }

        public IDbConnection Connection
        {
            get
            {
                if (_connection == null)
                {
                    _connection = _context.CreateConnection();
                    _connection.Open();
                }
                return _connection;
            }
        }

        public IDbTransaction Transaction => _transaction;

        public void Begin()
        {
            _transaction = Connection.BeginTransaction();
        }

        public void Commit()
        {
            try
            {
                _transaction?.Commit();
            }
            catch
            {
                _transaction?.Rollback();
                throw;
            }
            finally
            {
                _transaction?.Dispose();
                _transaction = null;
            }
        }

        public void Rollback()
        {
            try
            {
                _transaction?.Rollback();
            }
            finally
            {
                _transaction?.Dispose();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _transaction?.Dispose();
                    _connection?.Dispose();
                }
                _disposed = true;
            }
        }
    }
}
