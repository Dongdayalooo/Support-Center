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
        //<TrangThaiGeneral>: Là danh sách của đối tượng 
        public List<CauHinhHeSoKhuyenKhichModel> ListCauHinhMucThuong { get; set; }
        public List<TrangThaiGeneral> ListLoaiDoiTuong { get; set; }
        public List<TrangThaiGeneral> ListTieuChiApDungKhuyenKhich { get; set; }
        public List<BaseType> ListKieuThuong { get; set; }
        public List<OptionsEntityModel> ListOption { get; set; }
        public List<CauHinhHeSoKhuyenKhichModel> ListCauHinhHeSoKhuyenKhich { get; set; }
        public List<TrangThaiGeneral> ListTieuChiApDungPhanHangKH { get; set; }  //Danh sách của đối tượng TrangThaiGeneral, có thể chứa các tiêu chí áp dụng cho phân hạng khách hàng.
        public List<CategoryEntityModel> ListPhanLoaiKh { get; set; }
        public List<CauHinhPhanHangKhModel> ListCauHinhPhanHangKh { get; set; } //Danh sách của đối tượng CauHinhPhanHangKhModel, chứa cấu hình phân hạng khách hàng.
        public List<BaseType> ListPosition { get; set; }

        public List<TrangThaiGeneral> ListDieuKienPhanHangKh { get; set; } // Danh sách của đối tượng TrangThaiGeneral, có thể chứa điều kiện phân hạng khách hàng.
        public List<TrangThaiGeneral> ListDieuKienChietKhau { get; set; }
        public List<CauHinhMucChietKhauModel> ListCauHinhChietKhau { get; set; }
        
    }
}
