using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class LayDataThongTinCanNhanDiemBaoCaoResult: BaseResult
    {
        public List<CategoryEntityModel> ListDieuKien { get; set; }
    }
}
