using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class ChangeStatusReportPointParameter: BaseParameter
    {
        public Guid ReportPointId { get; set; }
        public int Status { get; set; }
    }
}
