using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class LuuBaoCaoDoanhThuParameter: BaseParameter
    {
        public DateTime? ThoiGianThucHien { get; set; }
        public List<VendorOrderDetailAtrModel> ListDieuKien { get; set; }
        public Guid ReportPointId { get; set; }
        public decimal TongTienKhachHangThanhToan { get; set; }
        public string GhiChu { get; set; }
        public List<string> ListFile { get; set; }
    }
}
