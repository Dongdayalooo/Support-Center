﻿using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Manufacture;

namespace TN.TNM.DataAccess.Messages.Results.Manufacture
{
    public class CreateTechniqueRequestResult : BaseResult
    {
        public Guid TechniqueRequestId { get; set; }
        public List<TechniqueRequestEntityModel> ListParent { get; set; }
    }
}
