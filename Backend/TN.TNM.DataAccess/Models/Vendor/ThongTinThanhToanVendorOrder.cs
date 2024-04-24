using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Vendor
{
    public class ThongTinThanhToanVendorOrder
    {
        public Guid PhieuId { get; set; }
        public string MaPhieu { get; set; }
        public string NoiDung { get; set; }
        public decimal? SoTienThuChi { get; set; }
        public DateTime NgayTao { get; set; }

    }
}
