using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.ReceiptInvoice
{
    public class GetOrderByVendorIdParameter: BaseParameter
    {
        public Guid VendorId { get; set; }
        public int Type { get; set; } //1: Báo có, 2:Phiếu thu
    }
}
