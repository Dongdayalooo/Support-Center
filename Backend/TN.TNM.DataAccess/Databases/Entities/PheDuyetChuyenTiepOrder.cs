using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class PheDuyetChuyenTiepOrder
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid EmpId { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid TenantId { get; set; }
        public int? StatusOrder { get; set; }
    }
}
