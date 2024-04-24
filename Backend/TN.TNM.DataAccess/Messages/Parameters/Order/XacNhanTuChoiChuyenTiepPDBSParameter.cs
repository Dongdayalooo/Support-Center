using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class XacNhanTuChoiChuyenTiepPDBSParameter: BaseParameter
    {
        public int Type { get; set; } //1: xác nhận, 2: Từ chối
        public Guid OrderId { get; set; } //1: xác nhận, 2: Từ chối
    }
}
