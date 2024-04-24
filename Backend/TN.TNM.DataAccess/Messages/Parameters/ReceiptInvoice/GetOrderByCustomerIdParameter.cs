using System;

namespace TN.TNM.DataAccess.Messages.Parameters.ReceiptInvoice
{
    public class GetOrderByCustomerIdParameter : BaseParameter
    {
        public Guid CustomerId { get; set; }
        public Guid? OrderId { get; set; }
        public int Type { get; set; } //1: Báo có, 2:Phiếu thu


    }
}
