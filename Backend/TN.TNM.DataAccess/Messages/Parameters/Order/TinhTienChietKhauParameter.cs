using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class TinhTienChietKhauParameter: BaseParameter
    {
        public Guid? OrderId { get; set; }
        public Guid CustomerId { get; set; }
        public decimal? TongTienDonHang { get; set; }
    }
}
