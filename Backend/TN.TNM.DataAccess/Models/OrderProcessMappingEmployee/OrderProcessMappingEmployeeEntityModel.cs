using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.OrderProcessMappingEmployee
{
    public class OrderProcessMappingEmployeeEntityModel
    {
        public Guid? Id { get; set; }
        public Guid? EmployeeId { get; set; }
        public Guid? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public Guid? OrderProcessId { get; set; }
        public Guid? OrderActionId { get; set; }
        public Guid? OrderId { get; set; }
        public string OrderActionCode { get; set; }
        public string TenDichVu { get; set; }
        public string RateContent { get; set; }
        public DateTime CreatedDate { get; set; }
        public string OrderCode { get; set; }
        public int? RateStar { get; set; }
        public string ObjectName { get; set; }
        public string ObjectTypeName { get; set; } 
        public int? ObjectType { get; set; } //1: Nhân viên, 2: Nhà cung cấp

    }
}
