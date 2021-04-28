﻿using System.Collections.Generic;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Results.WareHouse
{
    public class GetProductNameAndProductCodeResult:BaseResult
    {
        public List<ProductEntityModel> ProductList { get; set; }
    }
}
