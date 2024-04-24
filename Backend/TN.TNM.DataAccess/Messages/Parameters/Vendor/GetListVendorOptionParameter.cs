using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Vendor
{
    public class GetListVendorOptionParameter: BaseParameter
    {
        public bool? IsGetDataSearch { get; set; }
        public List<Guid> ListDvId { get; set; }
        public List<Guid> ListVendorId { get; set; }
        public DateTime? ThoiGianTu { get; set; }
        public DateTime? ThoiGianDen { get; set; }

    }
}
