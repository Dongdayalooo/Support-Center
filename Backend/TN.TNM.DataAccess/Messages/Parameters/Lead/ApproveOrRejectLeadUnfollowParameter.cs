﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Lead
{
    public class ApproveOrRejectLeadUnfollowParameter: BaseParameter
    {
        public List<Guid> LeadIdList { get; set; }
        public bool IsApprove { get; set; }
    }
}
