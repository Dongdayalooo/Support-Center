using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class XacNhanThucHienDichVuPhieuHoTroParameter: BaseParameter
    {
        public Guid CustomerOrderTaskId { get; set; }
        public int StatusId { get; set; }
        public string LyDo { get; set; }
    }
}
