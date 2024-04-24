using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Company
{
    public class CauHinhHeSoKhuyenKhichModel
    {
        public Guid? Id { get; set; }
        public int? ChucVuId { get; set; }
        public string ChucVu { get; set; }
        public string DichVu { get; set; }
        public int? LoaiThuongId { get; set; }
        public string LoaiThuong { get; set; }
        public decimal? GiaTriThuong { get; set; }
   
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public int? DieuKienId { get; set; }
        public string DieuKien { get; set; }

        public int? Type { get; set; } //1: Cấu hình mức thưởng, 2: Cấu hình khuyến khích
        public int? DoiTuongApDungId { get; set; } //1: Nhân viên, 2: Công tác viên
        public string DoiTuongApDung { get; set; }
        public decimal? GiaTriTu { get; set; }
        public decimal? GiaTriDen { get; set; }
        public Guid? ParentId { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
    }
}
