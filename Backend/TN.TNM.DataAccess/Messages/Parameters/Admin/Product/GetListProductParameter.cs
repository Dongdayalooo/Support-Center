﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Product
{
    public class GetListProductParameter : BaseParameter
    {
        public string FilterText { get; set; }
    }
}
