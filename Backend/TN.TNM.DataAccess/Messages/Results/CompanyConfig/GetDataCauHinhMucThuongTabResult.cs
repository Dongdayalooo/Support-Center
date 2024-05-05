using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Company;
using TN.TNM.DataAccess.Models.Options;

namespace TN.TNM.DataAccess.Messages.Results.CompanyConfig
{
    public class GetDataCauHinhMucThuongTabResult: BaseResult
    {
        public List<CauHinhHeSoKhuyenKhichModel> ListCauHinhMucThuong { get; set; }
        public List<TrangThaiGeneral> ListLoaiDoiTuong { get; set; }
        public List<TrangThaiGeneral> ListTieuChiApDungKhuyenKhich { get; set; }
        public List<BaseType> ListKieuThuong { get; set; }
        public List<OptionsEntityModel> ListOption { get; set; }
        public List<CauHinhHeSoKhuyenKhichModel> ListCauHinhHeSoKhuyenKhich { get; set; }
        public List<TrangThaiGeneral> ListTieuChiApDungPhanHangKH { get; set; }
        public List<CategoryEntityModel> ListPhanLoaiKh { get; set; }
        public List<CauHinhPhanHangKhModel> ListCauHinhPhanHangKh { get; set; }
        public List<BaseType> ListPosition { get; set; }

        public List<TrangThaiGeneral> ListDieuKienPhanHangKh { get; set; }
        public List<TrangThaiGeneral> ListDieuKienChietKhau { get; set; }
        public List<CauHinhMucChietKhauModel> ListCauHinhChietKhau { get; set; }
        
    }
}
