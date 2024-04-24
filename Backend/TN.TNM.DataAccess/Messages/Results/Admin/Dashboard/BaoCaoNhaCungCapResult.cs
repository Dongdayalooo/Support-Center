using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;

namespace TN.TNM.DataAccess.Messages.Results.Admin.Dashboard
{
    public class BaoCaoNhaCungCapResult: BaseResult
    {
        public List<RevenueStatisticServicePacketModel> ListRevenueStatisticServicePacketModel { get; set; }


        public decimal? DaThanhToan { get; set; }
        public decimal? ChoThanhToan { get; set; }
        public decimal? TongDoanhThu { get; set; }

        public int? SoLanXacNhan { get; set; }
        public int? SoLanTuChoi { get; set; }
        public int? SoChoXacNhan { get; set; }

        public List<ThongKeSoLuongDichVuNccThucHienModel> SoDichVuDaThucHien { get; set; }
    }
}
