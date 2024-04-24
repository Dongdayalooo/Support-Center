using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.File;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin
{
    public class RegisterParameter: BaseParameter
    {
        public int Type { get; set; } //1: KH, 2 Ncc, 3: Nhân viên
        public Guid? CustomerId { get; set; }
        public string FirstNameLastName { get; set; }

        public string Password { get; set; }

        public string PhoneNumber { get; set; }

        public string Email { get; set; }
        public string Gender { get; set; }

        public string Address { get; set; }
        public string AvatarUrl { get; set; }

        public Guid ProvinceId { get; set; }
        public string MaNguoiGioiThieu { get; set; }
        public FileBase64Model FileBase64 { get; set; }

    }
}
