﻿using System.Collections.Generic;
using TN.TNM.DataAccess.Messages.Results.DashboardRequest;

namespace TN.TNM.BusinessLogic.Messages.Responses.DashboardRequest
{
    public class GetAllRequestResponse : BaseResponse
    {
        public List<RequestDetail> RequestList { get; set; }
    }
}
