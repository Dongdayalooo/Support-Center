using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class GetDetailOrderVnpayResult: BaseResult
    {
        public decimal Amount { get; set; }
        public int StatusOrder { get; set; }
        public Guid OrderId { get; set; }
    }
}
