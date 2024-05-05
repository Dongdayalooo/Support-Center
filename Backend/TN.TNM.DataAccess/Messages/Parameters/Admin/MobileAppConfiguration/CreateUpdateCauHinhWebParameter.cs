using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.MobileAppConfiguration;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.MobileAppConfiguration
{
    public class CreateUpdateCauHinhWebParameter: BaseParameter
    {
        public List<string> ListSrcAnh { get; set; }
        public CauHinhThongTinWebBanHangModel CauHinhThongTinWebBanHang { get; set; }
        public List<CauHinhDanhGiaWebModel> CauHinhDanhGiaWeb { get; set; }
        public List<CauHinhGioiThieuWebModel> CauHinhGioiThieuWeb { get; set; }
        public List<CauHinhQuangCaoDoiTacModel> CauHinhQuangCaoDoiTac { get; set; }
        public List<CauHinhAnhLinkWebModel> CauHinhAnhLinkWeb { get; set; }
        

    }
}
