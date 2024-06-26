﻿using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class OrderProcessMappingEmployee
    {
        public Guid Id { get; set; }
        public Guid? EmployeeId { get; set; }
        public Guid? OrderActionId  { get; set; }
        public Guid? OrderProcessId  { get; set; }
        public string RateContent { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
        public Guid? CustomerId { get; set; }
        public int? RateStar { get; set; }
        public int? ObjectType { get; set; } //1: Nhân viên, 2: Nhà cung cấp
    }
}
