using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Models.Order
{
    public class ReportPointEntityModel
    {
        public Guid? Id { get; set; }
        public string Name { get; set; }
        public Guid? OptionId { get; set; }
        public string OptionName { get; set; }
        public bool? IsReporter { get; set; }
        public bool? BaoCaoDoanhThu { get; set; }
        public Guid? OrderDetailId { get; set; }
        public Guid? OrderActionId { get; set; }
        public int? Order { get; set; }
        public Guid? EmpId { get; set; }
        public Guid? VendorId { get; set; }
        public string EmpName { get; set; }
        public List<EmployeeEntityModel> ListEmployeeEntityModel { get; set; }
        public DateTime? Deadline { get; set; }
        public bool? IsCusView { get; set; }
        public string Content { get; set; }
        public int? Status { get; set; }
        public string StatusName { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int? NguoiThucHienType { get; set; } //1: Nhà cung cấp, 2: Nhân viên HĐTL
        public string VendorName { get; set; }

    }
}
