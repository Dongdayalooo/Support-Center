using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhQuangCaoDoiTac
    {
        public Guid Id { get; set; }
        public string Anh { get; set; }
        public string Link { get; set; }
        public string NoiDung { get; set; }
        public Guid TenantId { get; set; }
    }
}
