using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Options;

namespace TN.TNM.DataAccess.Models.Vendor
{
    public class VendorMappingOptionEntityModel
    {
        public Guid? Id { get; set; }
        public Guid? VendorId { get; set; }
        public string OptionName { get; set; }
        public string OptionCode { get; set; }
        public Guid? OptionId { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public DateTime? ThoiGianTu { get; set; }
        public DateTime? ThoiGianDen { get; set; }
        public decimal? Price { get; set; }
        public decimal? SoLuongToiThieu { get; set; }
        public int? YeuCauThanhToan { get; set; }
        public decimal? GiaTriThanhToan { get; set; }
        public List<CauHinhMucHoaHongModel> ListCauHinhHoaHong { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string LoaiDichVu { get; set; }

        public string VendorName { get; set; }
        public string VendorGroupName { get; set; }
        public string VendorCode { get; set; }
        public List<string> ListErr { get; set; }
        public bool? IsNew { get; set; }

        public int? ChietKhauId { get; set; }
        public decimal? GiaTriChietKhau { get; set; }

        public Guid? DonViTienId { get; set; }
        public decimal? ThueGtgt { get; set; }
        public string DonViTien { get; set; }
        public bool? ThanhToanTruoc { get; set; }

        
    }
}
