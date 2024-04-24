using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class CapNhatHinhThucThanhToanCustomerOrderParameter: BaseParameter
    {
        public Guid OrderId { get; set; }
        public Guid PaymentMethodId { get; set; }
        public string Note { get; set; }
        public string Content { get; set; }
    }
}
