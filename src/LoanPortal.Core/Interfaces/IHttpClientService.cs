using System.Net.Http;
using System.Threading.Tasks;

namespace LoanPortal.Core.Interfaces
{
    public interface IHttpClientService
    {
        Task<HttpResponseMessage> PostAsync(string requestUri, HttpContent content);
    }
} 