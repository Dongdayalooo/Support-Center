﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.BusinessLogic.Messages.Responses.Leads
{
    public class SendGiftSupportLeadResponse: BaseResponse
    {
        public Guid LeadCareId { get; set; }
    }
}
