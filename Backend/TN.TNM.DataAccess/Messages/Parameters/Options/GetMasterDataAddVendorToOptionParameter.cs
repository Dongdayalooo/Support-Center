using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Options
{
    public class GetMasterDataAddVendorToOptionParameter: BaseParameter
    {
        public Guid OptionId { get; set; }
        public List<Guid> ListVendorId { get; set; }
        public decimal? DonGiaTu { get; set; }
        public decimal? DonGiaDen { get; set; }
        public DateTime? ThoiGianTu { get; set; }
        public DateTime? ThoiGianDen { get; set; }
    }
}
