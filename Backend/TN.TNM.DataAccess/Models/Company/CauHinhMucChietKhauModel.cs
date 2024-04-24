using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Company
{
    public class CauHinhMucChietKhauModel
    {
        public Guid? Id { get; set; }
        public Guid? PhanHangId { get; set; }
        public string PhanHang { get; set; }
        public int? LoaiChietKhauId { get; set; }
        public string LoaiChietKhau { get; set; }
        public decimal? GiaTri { get; set; }
        public int? DieuKienId { get; set; }
        public string DieuKien { get; set; }
        public decimal? GiaTriTu { get; set; }
        public decimal? GiaTriDen { get; set; }
        public DateTime? ThoiGianTu { get; set; }
        public DateTime? ThoiGianDen { get; set; }
        public Guid? ParentId { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
    }
}
