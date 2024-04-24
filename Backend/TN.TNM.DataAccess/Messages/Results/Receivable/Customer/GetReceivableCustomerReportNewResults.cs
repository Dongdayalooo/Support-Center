using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Receivable;

namespace TN.TNM.DataAccess.Messages.Results.Receivable.Customer
{
    public class GetReceivableCustomerReportNewResults : BaseResult
    {
        public List<ReceivableCustomerReportModel> ReceivableCustomerReport { get; set; }
        public decimal? TongDatHang { get; set; }
        public decimal? TongThanhToan { get; set; }
        public decimal? TongChoThanhToan { get; set; }
    }
}
