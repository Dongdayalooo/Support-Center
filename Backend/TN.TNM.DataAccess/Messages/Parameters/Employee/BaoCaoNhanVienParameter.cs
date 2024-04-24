using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Employee
{
    public class BaoCaoNhanVienParameter: BaseParameter
    {
        public int EmployeeType { get; set; } //1: Nv hỗ trợ, 2: Quản lý dịch vụ
     
        public List<Guid> ListEmpId { get; set; }
        public DateTime TuNgay { get; set; }
        public DateTime DenNgay { get; set; }

    }
}
