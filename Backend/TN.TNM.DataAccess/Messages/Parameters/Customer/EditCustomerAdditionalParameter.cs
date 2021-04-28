﻿using System;

namespace TN.TNM.DataAccess.Messages.Parameters.Customer
{
    public class EditCustomerAdditionalParameter : BaseParameter
    {
        public Guid CustomerAdditionalInformationId { get; set; }
        public string Question { get; set; }
        public string Answer { get; set; }
    }
}
