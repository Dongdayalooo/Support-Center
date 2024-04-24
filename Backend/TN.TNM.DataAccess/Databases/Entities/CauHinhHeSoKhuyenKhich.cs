using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhHeSoKhuyenKhich
    {
        public Guid Id { get; set; }
        public int? ChucVuId { get; set; }
        public int? LoaiThuongId { get; set; }
        public int? Type { get; set; } //1: Thưởng, 2: Khuyến khích
        public int? DoiTuongApDungId { get; set; }
        public decimal? GiaTriThuong { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public int? DieuKienId { get; set; }
        public decimal? GiaTriTu { get; set; }
        public decimal? GiaTriDen { get; set; }
        public Guid? ParentId { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
    }
}
