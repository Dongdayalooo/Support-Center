using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Address;

namespace TN.TNM.DataAccess.Messages.Results.Options
{
    public class GetOptionCategoryResult : BaseResult
    {
        public List<OptionCategory> OptionCategory { get; set; }
        public List<ProvinceEntityModel> ListProvince { get; set; }
        public List<DistrictEntityModel> ListDistrict { get; set; }
        public List<WardEntityModel> ListWard { get; set; }

    }
    public class OptionCategory
    {
        public string CategoryName { get; set; }
        public Guid CategoryId { get; set; }
    }
}
