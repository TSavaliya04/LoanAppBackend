using System.Net.Http;
using System.Threading.Tasks;
using LoanPortal.Core.Interfaces;

namespace LoanPortal.Core.Services
{
    public class HttpClientService : IHttpClientService
    {
        private readonly HttpClient _httpClient;

        public HttpClientService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<HttpResponseMessage> PostAsync(string requestUri, HttpContent content)
        {
            return await _httpClient.PostAsync(requestUri, content);
        }
    }
} 