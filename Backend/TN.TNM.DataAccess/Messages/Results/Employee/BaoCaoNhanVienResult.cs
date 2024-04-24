using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Text;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Messages.Results.Employee
{
    public class BaoCaoNhanVienResult: BaseResult
    {
        public List<ExpandoObject> ListEmp { get; set; }
        public List<dynamic> ListColField { get; set; }
        public List<dynamic> ListColField1 { get; set; }
        public List<EmployeeEntityModel> ListAllEmp { get; set; }
    }
}
