using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ThuongDichVuNhanVien
    {
        public Guid Id { get; set; }
        public Guid EmpId { get; set; }
        public Guid OptionId { get; set; }
        public Guid? TenantId { get; set; }
    }
}
