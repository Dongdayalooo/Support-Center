using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Vendor
{
    public class UpdateVendorOrderParameter: BaseParameter
    {
        public Guid VendorOrderId { get; set; }
        public int? DiscountType { get; set; }
        public decimal? DiscountValue { get; set; }
        public Guid PaymentMethodId { get; set; }
        public string Note { get; set; }
    }
}
