using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class GetDataBaoCaoDoanhThuResult: BaseResult
    {
        public List<CategoryEntityModel> ListDieuKien { get; set; }
        public DateTime? ThoiGianThucHien { get; set; }
        public decimal? TongTienKhachHangThanhToan { get; set; }
        public string GhiChu { get; set; }
        public decimal? TongTienHoaHong { get; set; }

    }
}
