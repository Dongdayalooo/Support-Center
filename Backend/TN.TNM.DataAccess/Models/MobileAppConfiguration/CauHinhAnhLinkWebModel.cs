using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.MobileAppConfiguration
{
    public class CauHinhAnhLinkWebModel
    {
        public Guid? Id { get; set; }
        public string Anh { get; set; }
        public string Link { get; set; }
        public int? Type { get; set; }
    }
}
