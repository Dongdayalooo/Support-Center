using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ThongBaoHetHanDuyetThucHienDichVu
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public string Url { get; set; }
        public Guid? OrderId { get; set; }
        public DateTime? Date { get; set; }
        public Guid? EmployeeId { get; set; }
        public string ObjectType { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid TenantId { get; set; }
        public int NguoiThucHienType { get; set; } //1: Ncc, 2 Emp
        public Guid TaskId { get; set; }//CustomerOrderTask or OrderTaskEmp
    }
}
