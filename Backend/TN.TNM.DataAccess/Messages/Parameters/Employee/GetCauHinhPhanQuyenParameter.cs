﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Employee
{
    public class GetCauHinhPhanQuyenParameter : BaseParameter
    {
        public Guid EmployeeId { get; set; }
    }
}
