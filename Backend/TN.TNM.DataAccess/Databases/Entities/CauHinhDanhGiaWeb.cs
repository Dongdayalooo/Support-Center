using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhDanhGiaWeb
    {
        public Guid Id { get; set; }
        public string Anh { get; set; }
        public string TenKhachHang { get; set; }
        public string NoiDung { get; set; }
        public string Sao { get; set; }
        public Guid TenantId { get; set; }
    }
}
