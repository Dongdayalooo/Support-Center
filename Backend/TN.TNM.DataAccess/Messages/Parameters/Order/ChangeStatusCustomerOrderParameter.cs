using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Order;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class ChangeStatusCustomerOrderParameter: BaseParameter
    {
        public Guid? OrderId { get; set; }
        public int StatusOrder { get; set; }
        public Guid? PaymentMethod { get; set; }
        public int? LoaiChieuKhauId { get; set; } //1:Theo %, 2: Theo số tiền
        public decimal? GiaTriChietKhau { get; set; }
        public decimal? GiaTriDonHang { get; set; }

        public List<CustomerOrderDetailEntityModel> ListDetail { get; set; }
        public List<CustomerOrderDetailExtenEntityModel> ListDetailExtend { get; set; }
    }
}
