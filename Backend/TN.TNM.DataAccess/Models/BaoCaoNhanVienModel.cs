using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models
{
    public class BaoCaoNhanVienModel
    {
        public Guid EmployeeId { get; set; }
        public Guid UserId { get; set; }
        public Guid ContactId { get; set; }
        public string EmployeeName { get; set; }
        public int SoDichVuThucHien { get; set; }
        public int SoDichVuChoXacNhan { get; set; }
        public int SoDichVuXacNhan { get; set; }
        public int SoDichVuTuChoi { get; set; }
        public decimal TongDoanhThuKH { get; set; }
        public decimal ThuongTheoDichVu { get; set; }
        public decimal ThuongKhuyenKhich { get; set; }
        public int TuyetVoi { get; set; }
        public int HaiLong { get; set; }
        public int BinhThuong { get; set; }
        public int ChuaHaiLong { get; set; }
        public int Te { get; set; }
    }
}
