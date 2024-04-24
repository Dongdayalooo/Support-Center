using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ThongKeTuChoiChapNhanDichVu
    {
        public Guid Id { get; set; }
        public Guid? OrderDetailId { get; set; }
        public int? StatusId { get; set; }
        public int? NguoiThucHienType { get; set; } //1: NCC, 2: nhân viên
        public Guid? ObjectId { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? TenantId { get; set; }
    }
}
