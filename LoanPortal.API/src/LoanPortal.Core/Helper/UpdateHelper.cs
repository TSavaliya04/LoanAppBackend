using Dapper;
using LoanPortal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Helper
{
    public class UpdateHelper
    {
        public static (string query, DynamicParameters parameters) GetUpdateQuery<T>(string tableName, T dto) where T : class
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var updates = new List<string>();
            var parameters = new DynamicParameters();

            var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            //var idProperty = properties.FirstOrDefault(p => p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase));
            //parameters.Add("id", idProperty.GetValue(dto));

            foreach (var prop in properties)
            {
                //if (prop.Name.Equals("Id", StringComparison.OrdinalIgnoreCase))
                //    continue;

                var value = prop.GetValue(dto);
                if (value != null)
                {
                    var columnName = prop.Name.ToLower();
                    updates.Add($"{columnName} = @{columnName}");
                    parameters.Add(columnName, value);
                }
            }

            // Always update "updatedat"
            parameters.Add("updatedat", DateTime.UtcNow);

            var sql = $"UPDATE {tableName} SET {string.Join(", ", updates)} WHERE id = @id";
            return (sql, parameters);
        }

        public static string GetUpdateQueryy<T>(string tableName, T dto) where T : class
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var updates = new List<string>();
            var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var prop in properties)
            {
                var value = prop.GetValue(dto);
                if (value != null)
                {
                    var columnName = prop.Name.ToLower();
                    updates.Add($"{columnName} = @{columnName}");
                }
            }

            var sql = $"UPDATE {tableName} SET {string.Join(", ", updates)} WHERE id = @id";
            return sql;
        }

        public static string GetInsertQuery<T>(string tableName, T dto) where T : class
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var props = typeof(T).GetProperties();
            var columnNames = string.Join(", ", props.Select(p => p.Name.ToLower()));
            var paramNames = string.Join(", ", props.Select(p => "@" + p.Name));

            string sql = $"INSERT INTO {tableName} ({columnNames}) VALUES ({paramNames})";
            return sql;
        }

        public static string GetByIdQuery(string tableName)
        {
            string sql = $"select * from {tableName} where id = @Id";
            return sql;
        }

        public static T UpdateEntity<T>(T oldObj, T newObj) where T : class
        {
            if (oldObj == null || newObj == null)
                throw new ArgumentNullException("Neither oldObj nor newObj can be null.");

            UpdateRecursive(typeof(T), oldObj, newObj);
            return oldObj;
        }

        private static void UpdateRecursive(Type type, object oldObj, object newObj)
        {
            var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var prop in properties)
            {
                if (!prop.CanRead || !prop.CanWrite)
                    continue;

                var newValue = prop.GetValue(newObj);
                var oldValue = prop.GetValue(oldObj);

                if (newValue == null)
                    continue;

                // Handle collections
                if (prop.PropertyType != typeof(string) &&
                    typeof(System.Collections.IEnumerable).IsAssignableFrom(prop.PropertyType))
                {
                    if (!prop.PropertyType.IsGenericType)
                    {
                        prop.SetValue(oldObj, newValue); // fallback for non-generic collections
                        continue;
                    }

                    var elementType = prop.PropertyType.GetGenericArguments()[0];
                    var oldCollection = oldValue ?? Activator.CreateInstance(prop.PropertyType);
                    var newCollection = newValue;

                    var idProperty = elementType.GetProperty("Id");
                    if (idProperty != null)
                    {
                        var oldList = (System.Collections.IList)oldCollection;
                        var newList = (System.Collections.IEnumerable)newCollection;

                        foreach (var newItem in newList)
                        {
                            var newItemId = idProperty.GetValue(newItem);
                            object existingItem = null;

                            foreach (var oldItem in oldList)
                            {
                                var existingId = idProperty.GetValue(oldItem);
                                if (Equals(existingId, newItemId))
                                {
                                    existingItem = oldItem;
                                    break;
                                }
                            }

                            if (existingItem != null)
                            {
                                UpdateRecursive(elementType, existingItem, newItem);
                            }
                            else
                            {
                                var addMethod = oldList.GetType().GetMethod("Add");
                                addMethod?.Invoke(oldList, new object[] { newItem });
                            }
                        }

                        prop.SetValue(oldObj, oldList);
                    }
                    else
                    {
                        // If no Id found, replace entire collection
                        prop.SetValue(oldObj, newValue);
                    }
                }
                // Recursive update for nested classes
                else if (prop.PropertyType.IsClass && prop.PropertyType != typeof(string))
                {
                    if (oldValue == null)
                    {
                        oldValue = Activator.CreateInstance(prop.PropertyType);
                        prop.SetValue(oldObj, oldValue);
                    }

                    UpdateRecursive(prop.PropertyType, oldValue, newValue);
                }
                else
                {
                    // Set simple property
                    prop.SetValue(oldObj, newValue);
                }
            }
        }
    }
}
