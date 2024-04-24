using System;

namespace TN.TNM.DataAccess.Messages.Parameters.Receivable.Vendor
{
    public class GetReceivableVendorDetailParameter : BaseParameter
    {
        public int Type { get; set; } //1: Công nợ phải trả Ncc, 2: Công nợ phải thu Ncc
        public Guid VendorId { get; set; }
        public DateTime? ReceivalbeDateFrom { get; set; }
        public DateTime? ReceivalbeDateTo { get; set; }
    }
}
