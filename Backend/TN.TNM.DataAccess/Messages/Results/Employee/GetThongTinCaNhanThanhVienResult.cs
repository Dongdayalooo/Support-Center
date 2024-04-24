using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.OrderProcessMappingEmployee;

namespace TN.TNM.DataAccess.Messages.Results.Employee
{
    public class GetThongTinCaNhanThanhVienResult : BaseResult
    {
        public ThongTinCaNhanThanhVienModel ThongTinCaNhan { get; set; }
        public List<OrderProcessMappingEmployeeEntityModel> ListDanhGia { get; set; }
    }
}
