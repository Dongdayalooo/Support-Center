﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class ChangeStatusReportPointResult: BaseResult
    {
        public List<Guid> ListEmpId { get; set; }

    }
}
