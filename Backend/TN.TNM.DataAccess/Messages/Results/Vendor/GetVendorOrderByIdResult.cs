using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Folder;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.DataAccess.Messages.Results.Vendor
{
    public class GetVendorOrderByIdResult : BaseResult
    {
        public List<CategoryEntityModel> ListPaymentMethod { get; set; }
        public List<BaseType> ListKieuThuong { get; set; }
        public VendorOrderEntityModel VendorOrder { get; set; }
        public List<VendorOrderDetailEntityModel> ListVendorOrderDetail { get; set; }
        public List<VendorOrderDetailAtrModel> ListVendorOrderDetailAttr { get; set; }
        public List<FileInFolderEntityModel> ListFile { get; set; }
        public bool IsShowThanhToan { get; set; }
        public decimal? TongDaTra { get; set; }
        public List<ThongTinThanhToanVendorOrder> ListThongTinThanhToan { get; set; }
    }
}
