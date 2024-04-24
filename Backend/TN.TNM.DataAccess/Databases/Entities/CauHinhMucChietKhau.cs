using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhMucChietKhau
    {
        public Guid Id { get; set; }
        public Guid? PhanHangId { get; set; }
        public int? LoaiChietKhauId { get; set; }
        public decimal? GiaTri { get; set; }
        public int? DieuKienId { get; set; }
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
