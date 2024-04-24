using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.Options;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Messages.Results.Options
{
    public class GetMasterBaoCaoTongHopResult: BaseResult
    {
        public List<CategoryEntityModel> ListNhomDichVu { get; set; }
        public List<CategoryEntityModel> ListPhanHangKh { get; set; }
        public List<OptionsEntityModel> ListDichVu { get; set; }
        public List<ServicePacketEntityModel> ListGoiDichVu { get; set; }
        public List<CustomerEntityModel> ListCustomer { get; set; }
        public List<TrangThaiGeneral> ListLoaiDoanhThu { get; set; }
        public List<TrangThaiGeneral> ListLoaiNhanVien { get; set; }
        public List<BaseType> ListChucVu { get; set; }
    }
}
