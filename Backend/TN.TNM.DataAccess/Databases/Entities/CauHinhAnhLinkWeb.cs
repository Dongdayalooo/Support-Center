using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhAnhLinkWeb
    {
        public Guid Id { get; set; }
        public string Anh { get; set; }

        public string Link { get; set; }
        public int? Type { get; set; }
        public Guid TenantId { get; set; }
    }
}
