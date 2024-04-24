using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.Options;

namespace TN.TNM.DataAccess.Messages.Results.Employee
{
    public class GetThongTinChungThanhVienResult : BaseResult
    {
        public ThongTinChungThanhVienModel ThongTinChung { get; set; }
        public List<CategoryEntityModel> ListMission { get; set; }
        public List<BaseType> ListChucVu { get; set; }
        public List<OptionsEntityModel> ListOption { get; set; }
        public bool IsShowButtonSua { get; set; }
    }
}
