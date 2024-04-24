using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Receivable.Customer
{
    public class GetReceivableCustomerReportNewParameter
    {
        public List<Guid> KhachHangId { get; set; }
        public List<Guid> NhomKHId { get; set; }
        public List<Guid> PhanHangKHId { get; set; }
        public List<Guid> GoiDichVuId { get; set; }
        public List<Guid> DichVuId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int ReportType { get; set; } // 1: Doanh thu mang lại cho KTTN - 2: Doanh thu mang lại cho NCC
    }
}
