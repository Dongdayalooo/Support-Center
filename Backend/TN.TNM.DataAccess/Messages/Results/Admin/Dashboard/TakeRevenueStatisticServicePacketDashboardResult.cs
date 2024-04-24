using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;

namespace TN.TNM.DataAccess.Messages.Results.Admin.Dashboard
{
    public class TakeRevenueStatisticServicePacketDashboardResult : BaseResult
    {
        public List<RevenueStatisticServicePacketModel> ListRevenueStatisticServicePacketModel { get; set; }

        public List<RevenueStatisticServicePacketModel> ListRevenueStatisticServicePacketModelByServicePacket { get; set; }

        public int? SoLanXacNhan { get; set; }
        public int? SoLanTuChoi { get; set; }
        public int? SoChoXacNhan { get; set; }

        public List<ThongKeSoLuongDichVuNccThucHienModel> SoDichVuDaThucHien { get; set; }
        
    }
}
