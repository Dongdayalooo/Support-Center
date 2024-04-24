using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Options;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Results.Admin.Product
{
    public class GetMasterDataPriceProductResult : BaseResult
    {
        public List<OptionsEntityModel> ListOption { get; set; }
        public List<PriceProductEntityModel> ListPriceOption { get; set; }
    }
}
