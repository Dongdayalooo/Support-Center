using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class VendorMappingOption
    {
        public Guid Id { get; set; }
        public Guid VendorId { get; set; }
        public Guid OptionId { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid TenantId { get; set; }
        public decimal? Price { get; set; }
        public decimal? SoLuongToiThieu { get; set; }
        public int? YeuCauThanhToan { get; set; }
        public decimal? GiaTriThanhToan { get; set; }
        public DateTime? ThoiGianTu { get; set; }
        public DateTime? ThoiGianDen { get; set; }
        public Guid? DonViTienId { get; set; }
        public decimal? ThueGtgt { get; set; }
        public int? ChietKhauId { get; set; }
        public decimal? GiaTriChietKhau { get; set; }
    }
}
