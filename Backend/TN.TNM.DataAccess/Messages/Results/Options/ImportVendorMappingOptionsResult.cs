using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.DataAccess.Messages.Results.Options
{
    public class ImportVendorMappingOptionsResult: BaseResult
    {
        public List<VendorMappingOptionEntityModel> ListImport { get; set; }
    }
}
