using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class OrderStatus
    {
        public Guid OrderStatusId { get; set; }
        public string OrderStatusCode { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? TenantId { get; set; }
    }
}
