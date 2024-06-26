﻿using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;

namespace TN.TNM.DataAccess.Models.Salary
{
    public class LuongTongHopModel : BaseModel<LuongTongHop>
    {
        public int LuongTongHopId { get; set; }
        public int KyLuongId { get; set; }
        public Guid EmployeeId { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid PositionId { get; set; }
        public int? SubCode1Value { get; set; }
        public int? SubCode2Value { get; set; }
        public Guid? CapBacId { get; set; }
        public decimal TongNgayTinhLuong { get; set; }
        public decimal MucLuongCu { get; set; }
        public decimal SoNgayMucLuongCu { get; set; }
        public decimal MucLuongHienTai { get; set; }
        public decimal LuongThucTe { get; set; }
        public decimal KhoanBuTruThangTruoc { get; set; }
        public decimal LuongOtTinhThue { get; set; }
        public decimal LuongOtKhongTinhThue { get; set; }
        public decimal TongTroCapCoDinh { get; set; }
        public decimal TongTroCapKhac { get; set; }
        public decimal TroCapKhacKhongTinhThue { get; set; }
        public decimal KhauTruHoanLaiTruocThue { get; set; }
        public decimal TongThuNhapBaoGomThueVaKhongThue { get; set; }
        public decimal TongThuNhapSauKhiBoCacKhoanKhongTinhThue { get; set; }
        public decimal GiamTruTruocThue { get; set; }
        public decimal ThuNhapChiDuaVaoTinhThue { get; set; }
        public decimal TongThuNhapChiuThueSauGiamTru { get; set; }
        public decimal TongThueTncnCtyVaNld { get; set; }
        public decimal ThueTncnNld { get; set; }
        public decimal LuongCoBanDongBh { get; set; }
        public decimal TongTienBhNldPhaiDong { get; set; }
        public decimal TongTienBhCtyPhaiDong { get; set; }
        public decimal ThuNhapThucNhanTruocKhiBuTruThue { get; set; }
        public decimal CacKhoanGiamTruSauThue { get; set; }
        public decimal CacKhoanHoanLaiSauThue { get; set; }
        public decimal ThuNhapThucNhan { get; set; }
        public decimal LuongTamUng { get; set; }
        public decimal LuongConLai { get; set; }
        public decimal CacKhoanCtyPhaiTraKhac { get; set; }
        public decimal TongChiPhiCtyPhaiTra { get; set; }

        /* Virtual Field */
        public string EmployeeCode { get; set; }
        public string OrganizationCode { get; set; }
        public string SubCode1 { get; set; }
        public string EmployeeName { get; set; }
        public string PositionName { get; set; }


        public LuongTongHopModel()
        {

        }

        //Map từ Entity => Model
        public LuongTongHopModel(LuongTongHop entity)
        {
            Mapper(entity, this);
        }

        //Map từ Model => Entity
        public override LuongTongHop ToEntity()
        {
            var entity = new LuongTongHop();
            Mapper(this, entity);
            return entity;
        }
    }
}
