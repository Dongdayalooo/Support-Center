using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class ChapNhanTuChoiDonHangParameter: BaseParameter
    {
        public Guid VendorOrderId { get; set; }
        public int Type { get; set; }    //1: Xác nhận, 2: Từ chối
    }
}
