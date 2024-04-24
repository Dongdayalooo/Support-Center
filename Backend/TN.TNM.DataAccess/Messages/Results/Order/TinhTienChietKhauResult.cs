using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class TinhTienChietKhauResult: BaseResult
    {
        public int? LoaiChietKhau { get; set; }
        public decimal? GiaTriChietKhau { get; set; }
    }
}
