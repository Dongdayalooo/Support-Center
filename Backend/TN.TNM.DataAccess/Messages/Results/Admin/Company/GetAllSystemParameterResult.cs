﻿using System.Collections.Generic;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.SystemParameter;

namespace TN.TNM.DataAccess.Messages.Results.Admin.Company
{
    public class GetAllSystemParameterResult : BaseResult
    {
        public List<SystemParameterEntityModel> systemParameterList { get; set; }
        public List<EmployeeEntityModel> ListNhanVien { get; set; }
        public List<EmployeeEntityModel> ListSelectedEmp { get; set; }
    }
}
