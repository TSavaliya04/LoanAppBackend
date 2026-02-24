using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Shared
{
    public class BlobStorageSettings
    {
        public string? BlobConnectionString { get; set; }
        public string? SharedAccessSignature { get; set; }
        public string? StorageAccountName { get; set; }
        public Dictionary<string, ContainerConfig> Containers { get; set; } = new();
    }

    public class ContainerConfig
    {
        public string ContainerName { get; set; } = string.Empty;
    }
}
