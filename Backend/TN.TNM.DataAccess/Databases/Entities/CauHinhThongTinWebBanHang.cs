using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhThongTinWebBanHang
    {
        public Guid Id { get; set; }
        public string ThongTinLienHe { get; set; }
        public string HotLine { get; set; }
        public string LinkVideo { get; set; }
        public string ThongTinVideo1 { get; set; }
        public string ThongTinVideo2 { get; set; }
        public string ThongTinVideo3 { get; set; }
        public string ThongTinVideo4 { get; set; }
        public string GioiThieu { get; set; }
        public string TrangChu { get; set; }
        public string FooterMoTa { get; set; }
        public string FooterLienHe { get; set; }
        public string DiaChi { get; set; }
        public string Email { get; set; }
        public string BanDo { get; set; }
        public Guid TenantId { get; set; }
    }
}
