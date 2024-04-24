using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class VendorOrderDetailAtr
    {
        public Guid VendorOrderDetailAtrId { get; set; }
        public Guid? DieuKienId { get; set; }
        public Guid? OrderDetailId { get; set; }
        public decimal? Value { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? TenantId { get; set; }
    }
}
