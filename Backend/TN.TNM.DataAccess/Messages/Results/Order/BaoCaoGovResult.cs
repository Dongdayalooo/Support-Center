using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class BaoCaoGovResult: BaseResult
    {
        public decimal SoLuongTruyCap { get; set; }
        public decimal SoNguoiBan { get; set; }
        public decimal SoNguoiBanMoi { get; set; }
        public decimal TongSoSanPham { get; set; }
        public decimal SoSanPhamMoi { get; set; }
        public decimal SoLuongGiaoDich { get; set; }
        public decimal TongSoDonHangThanhCong { get; set; }
        public decimal TongSoDonHangKhongThanhCong { get; set; }
        public decimal TongGiaTriGiaoDich { get; set; }
    }
}
