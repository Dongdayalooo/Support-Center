﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Results.Lead
{
    public class SendGiftSupportLeadResult: BaseResult
    {
        public Guid LeadCareId { get; set; }
    }
}
