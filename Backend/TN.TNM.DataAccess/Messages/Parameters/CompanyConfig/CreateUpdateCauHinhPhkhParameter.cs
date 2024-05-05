using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Company;

namespace TN.TNM.DataAccess.Messages.Parameters.CompanyConfig
{
    public class CreateUpdateCauHinhPhkhParameter: BaseParameter
    {
        public CauHinhPhanHangKhModel CauHinh { get; set; }
    }
}
