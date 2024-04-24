using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Options;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.DataAccess.Messages.Results.Vendor
{
    public class GetListVendorOptionResult : BaseResult
    {
        public List<VendorEntityModel> ListVendor {get;set;}
        public List<OptionsEntityModel> ListOption {get; set; }
        public List<VendorMappingOptionEntityModel> ListOptionVendor { get; set; }
        public List<CategoryEntityModel> ListDieuKienHoaHong { get; set; }
        public List<CategoryEntityModel> ListDonViTien { get; set; }
        public List<BaseType> ListKieuThanhToan { get; set; }
    }
}
