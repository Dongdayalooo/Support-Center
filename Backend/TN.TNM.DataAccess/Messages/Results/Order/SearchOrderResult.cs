﻿using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Order;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class SearchOrderResult : BaseResult
    {
        public List<CustomerOrderEntityModel> ListOrder { get; set; }
        public List<OrderProcessEntityModel> ListOrderProcess { get; set; }
        
    }
}
