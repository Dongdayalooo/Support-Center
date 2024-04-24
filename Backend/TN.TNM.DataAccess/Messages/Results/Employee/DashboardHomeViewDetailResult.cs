﻿using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Messages.Results.Employee
{
    public class DashboardHomeViewDetailResult : BaseResult
    {
        public List<EmployeeEntityModel> ListDataDetail { get; set; }
        public int Type { get; set; }
    }
}
