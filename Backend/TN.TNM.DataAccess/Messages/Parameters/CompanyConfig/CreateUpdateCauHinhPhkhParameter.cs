using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Company;

namespace TN.TNM.DataAccess.Messages.Parameters.CompanyConfig
{
    //File này định nghĩa một lớp tham số (parameter) được sử dụng trong quá trình truyền dữ liệu giữa các thành phần trong ứng dụng. 
    public class CreateUpdateCauHinhPhkhParameter: BaseParameter
    {
        public CauHinhPhanHangKhModel CauHinh { get; set; }
    }
}
