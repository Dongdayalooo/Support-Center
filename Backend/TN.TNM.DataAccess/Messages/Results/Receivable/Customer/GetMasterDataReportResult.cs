using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Results.Receivable.Customer
{
    public class GetMasterDataReportResult : BaseResult
    {
        public decimal? TotalPurchase { get; set; }
        public decimal? TotalPaid { get; set; }
        public decimal? TotalReceipt { get; set; }
        public List<CategoryEntityModel> DanhSach_PhanHangKH { get;  set; }
        public List<CategoryEntityModel> DanhSach_NhomKH { get; internal set; }
        public List<CustomerEntityModel> DanhSach_KhachHang { get; internal set; }
        public List<ServicePacketEntityModel> DanhSach_GoiDichVu { get; internal set; }
        public List<ServicePacketMappingOptionsEntityModel> DanhSach_DichVu { get; internal set; }
    }
}
