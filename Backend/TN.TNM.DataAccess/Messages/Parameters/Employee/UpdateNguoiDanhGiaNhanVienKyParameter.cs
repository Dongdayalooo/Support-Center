﻿using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Messages.Parameters.Employee
{
    public class UpdateNguoiDanhGiaNhanVienKyParameter: BaseParameter
    {
        public int KyDanhGiaId { get; set; }
        public List<NhanVienKyDanhGiaEntityModel> ListNVKyDanhGia { get; set; }
    }
}
