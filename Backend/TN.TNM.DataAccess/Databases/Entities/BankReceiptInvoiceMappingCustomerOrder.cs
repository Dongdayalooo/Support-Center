using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class PhieuThuBaoCoMappingCustomerOrder
    {
        public Guid Id { get; set; }
        public Guid? ObjectId { get; set; }
        public int? ObjectType { get; set; } //1: Báo có, 2:Phiếu thu
        public Guid? OrderId { get; set; }
        public Guid? VendorOrderId { get; set; }
        public decimal? Amount { get; set; }
        public string ListPacketServiceName { get; set; }
        public string OrderCode { get; set; }
        public string OrderTypeName { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? TenantId { get; set; }
    }
}
