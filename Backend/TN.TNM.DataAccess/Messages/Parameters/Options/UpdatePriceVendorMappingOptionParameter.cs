using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Options
{
    public class UpdatePriceVendorMappingOptionParameter : BaseParameter
    {
        public Guid VendorId { get; set; }

        public Guid OptionId { get; set; }

        public decimal? Price { get; set; }
    }
}
