using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Vendor
{
    public class VendorOrderDetailAtrModel
    {
        public Guid? VendorOrderDetailAtrId { get; set; }
        public Guid? OrderDetailId { get; set; }
        public Guid? DieuKienId { get; set; }
        public string DieuKien { get; set; }
        public decimal? Value { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
