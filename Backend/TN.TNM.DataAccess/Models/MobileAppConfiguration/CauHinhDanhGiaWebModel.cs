using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.MobileAppConfiguration
{
    public class CauHinhDanhGiaWebModel
    {
        public Guid? Id { get; set; }
        public string Anh { get; set; }
        public string TenKhachHang { get; set; }
        public string NoiDung { get; set; }
        public string Sao { get; set; }
    }
}
