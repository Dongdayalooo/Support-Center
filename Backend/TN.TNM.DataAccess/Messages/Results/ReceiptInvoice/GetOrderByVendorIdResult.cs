using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.DataAccess.Messages.Results.ReceiptInvoice
{
    public class GetOrderByVendorIdResult: BaseResult
    {
        public List<VendorOrderEntityModel> ListOrder { get; set; }
    }
}
