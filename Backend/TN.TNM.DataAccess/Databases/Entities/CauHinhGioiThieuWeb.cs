using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhGioiThieuWeb
    {
        public Guid Id { get; set; }
        public string TieuDe { get; set; }
        public string NoiDung { get; set; }
        public Guid TenantId { get; set; }
    }
}
