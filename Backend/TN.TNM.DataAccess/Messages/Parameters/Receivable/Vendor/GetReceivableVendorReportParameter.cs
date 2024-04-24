using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Messages.Parameters.Receivable.Vendor
{
    public class GetReceivableVendorReportParameter : BaseParameter
    {
        public int Type { get; set; } //1: Công nợ phải trả Ncc, 2: Công nợ phải thu Ncc
        public List<Guid> VendorCode { get; set; }
        public string VendorName { get; set; }
        public DateTime? ReceivalbeDateTo { get; set; }
    }
}
