using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using LoanPortal.Shared.Constants;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Shared
{
    public interface IBlobStorageHelper
    {
        Task<Uri> UploadFileBlobAsyncUsingSAS(Stream content, string fileName, string containerKey);
        Task<BlobDownloadInfo> DownloadloadFileBlobAsyncUsingSAS(string fileName, string containerKey);
        Task<bool> DeleteFileBlobAsyncUsingSAS(string fileName, string containerKey);
    }

    public class BlobStorageHelper : IBlobStorageHelper
    {
        private readonly BlobStorageSettings _blobStorageSettings;

        public BlobStorageHelper(IOptions<BlobStorageSettings> blobStorageSettings)
        {
            _blobStorageSettings = blobStorageSettings.Value;
        }

        public async Task<Uri> UploadFileBlobAsyncUsingSAS(Stream content, string fileName, string containerKey)
        {
            try
            {
                string contentType = getContentType(fileName.Substring(fileName.LastIndexOf(".") + 1));
                //if (!_blobStorageSettings.Containers.TryGetValue(containerKey, out var containerConfig))
                //{
                //    throw new ArgumentException($"Container configuration for key '{containerKey}' not found.");
                //}
                //BlobClient blobClient = getBlobClient(_blobStorageSettings.StorageAccountName, fileName, containerConfig.ContainerName, _blobStorageSettings.SharedAccessSignature);
                BlobClient blobClient = getBlobClient("loansnstuff", fileName, "profilepictures", IConstants.AzureToken);
                await blobClient.UploadAsync(content, new BlobHttpHeaders
                {
                    ContentType = contentType
                });
                return blobClient.Uri;
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine("RequestFailedException in BlobStorageHelper.UploadFileBlobAsyncUsingSAS -> " + ex.Message);
                throw new RequestFailedException("RequestFailedException in BlobStorageHelper.UploadFileBlobAsyncUsingSAS -> " + ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in BlobStorageHelper.UploadFileBlobAsyncUsingSAS -> " + ex.Message);
                throw new Exception("Exception in BlobStorageHelper.UploadFileBlobAsyncUsingSAS -> " + ex.Message);
            }
        }

        public async Task<BlobDownloadInfo> DownloadloadFileBlobAsyncUsingSAS(string fileName, string containerKey)
        {
            try
            {
                if (!_blobStorageSettings.Containers.TryGetValue(containerKey, out var containerConfig))
                {
                    throw new ArgumentException($"Container configuration for key '{containerKey}' not found.");
                }
                BlobClient blobClient = getBlobClient(_blobStorageSettings.StorageAccountName, fileName, containerConfig.ContainerName, _blobStorageSettings.SharedAccessSignature);
                return await blobClient.DownloadAsync();
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine("RequestFailedException in BlobStorageHelper.DownloadloadFileBlobAsyncUsingSAS -> " + ex.Message);
                throw new RequestFailedException("RequestFailedException in BlobStorageHelper.DownloadloadFileBlobAsyncUsingSAS -> " + ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in BlobStorageHelper.DownloadloadFileBlobAsyncUsingSAS -> " + ex.Message);
                throw new Exception("Exception in BlobStorageHelper.DownloadloadFileBlobAsyncUsingSAS -> " + ex.Message);
            }
        }

        public async Task<bool> DeleteFileBlobAsyncUsingSAS(string fileName, string containerKey)
        {
            try
            {
                if (!_blobStorageSettings.Containers.TryGetValue(containerKey, out var containerConfig))
                {
                    throw new ArgumentException($"Container configuration for key '{containerKey}' not found.");
                }
                BlobClient blobClient = getBlobClient(_blobStorageSettings.StorageAccountName, fileName, containerConfig.ContainerName, _blobStorageSettings.SharedAccessSignature);
                Response response = await blobClient.DeleteAsync();
                if (response.Status != 202)
                {
                    return false;
                }
                return true;
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine("RequestFailedException in BlobStorageHelper.DeleteFileBlobAsyncUsingSAS -> " + ex.Message);
                throw new RequestFailedException("RequestFailedException in BlobStorageHelper.DeleteFileBlobAsyncUsingSAS -> " + ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in BlobStorageHelper.DeleteFileBlobAsyncUsingSAS -> " + ex.Message);
                throw new Exception("Exception in BlobStorageHelper.DeleteFileBlobAsyncUsingSAS -> " + ex.Message);
            }
        }

        private static BlobClient getBlobClient(string storageAccount, string fileName, string containerName, string SASToken)
        {
            string blobServiceUri = $"https://{storageAccount}.blob.core.windows.net";
            return new BlobClient(new Uri($"{blobServiceUri}/{containerName}/{fileName}?{SASToken}"));
        }

        public static string getContentType(string fileExtension)
        {
            switch (fileExtension.ToLower())
            {
                case "txt":
                    return "text/plain";
                case "pdf":
                    return "application/pdf";
                case "doc":
                case "docx":
                    return "application/msword";
                case "xls":
                case "xlsx":
                    return "application/vnd.ms-excel";
                case "ppt":
                case "pptx":
                    return "application/vnd.ms-powerpoint";
                case "jpg":
                case "jpeg":
                    return "image/jpeg";
                case "png":
                    return "image/png";
                case "gif":
                    return "image/gif";
                case "html":
                case "htm":
                    return "text/html";
                case "css":
                    return "text/css";
                case "js":
                    return "application/javascript";
                case "json":
                    return "application/json";
                case "xml":
                    return "application/xml";
                case "zip":
                    return "application/zip";
                case "rar":
                    return "application/x-rar-compressed";
                case "tar":
                    return "application/x-tar";
                case "7z":
                    return "application/x-7z-compressed";
                default:
                    return "application/octet-stream";
            }
        }

        public static bool isValidFile(string fileName)
        {
            var validExts = new[] { "png", "jpeg", "jpg" };
            return validExts.Contains(fileName.Substring(fileName.LastIndexOf(".") + 1));
        }
    }
}
