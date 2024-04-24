﻿using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Options;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.DataAccess.Messages.Results.Options
{
    public class GetMasterDataAddVendorToOptionResult: BaseResult
    {
        public List<VendorEntityModel> VendorList { get; set; }
        public List<CategoryEntityModel> ListVendorGroup { get; set; }
        public List<CategoryEntityModel> ListBank { get; set; }
        public List<VendorMappingOptionEntityModel> ListVendorMappingOption { get; set; }
        public List<CauHinhMucHoaHongModel> ListCauHinhHoaHong { get; set; }
        public List<CategoryEntityModel> ListDieuKienHoaHong { get; set; }
        public List<CategoryEntityModel> ListDonViTien { get; set; }
        public List<BaseType> ListKieuThanhToan { get; set; }

        public bool? ThanhToanTruoc { get; set; }
        
    }
}
