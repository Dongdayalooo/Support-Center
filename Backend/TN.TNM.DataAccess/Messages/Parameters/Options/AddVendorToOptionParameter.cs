using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Options;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.DataAccess.Messages.Parameters.Options
{
    public class AddVendorToOptionParameter: BaseParameter
    {
        public VendorMappingOptionEntityModel VendorMappingOption { get; set; }
        public Guid OptionId { get; set; }
        public bool? ThanhToanTruoc { get; set; }

        public List<CauHinhMucHoaHongModel> ListCauHinhHoaHong { get; set; }
        
    }
}
