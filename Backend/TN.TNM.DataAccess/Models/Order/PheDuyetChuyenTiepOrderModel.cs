using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Order
{
    public class PheDuyetChuyenTiepOrderModel
    {
        public Guid? Id { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? EmpId { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
