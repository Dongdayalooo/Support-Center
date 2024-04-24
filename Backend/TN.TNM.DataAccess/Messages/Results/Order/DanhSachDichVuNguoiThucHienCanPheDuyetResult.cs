using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.CustomerOrder;

namespace TN.TNM.DataAccess.Messages.Results.Order
{
    public class DanhSachDichVuNguoiThucHienCanPheDuyetResult: BaseResult
    {
        public List<CustomerOrderTaskEntityModel> ListOrderActionTask { get; set; }
    }
}
