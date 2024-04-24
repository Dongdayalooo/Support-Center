using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class LuuNhanVienPheDuyetChuyenTiepParameter: BaseParameter
    {
        public List<Guid> ListEmpId { get; set; }
        public Guid OrderId { get; set; }
    }
}
