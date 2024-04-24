using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Company
{
    public class CauHinhPhanHangKhModel
    {
        public Guid? Id { get; set; }
        public Guid? ParentId { get; set; }
        public int? DieuKienId { get; set; }
        public string DieuKien { get; set; }
        public decimal? GiaTriTu { get; set; }
        public decimal? GiaTriDen { get; set; }
        public Guid? PhanHangId { get; set; }
        public string PhanHang { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
    }
}
