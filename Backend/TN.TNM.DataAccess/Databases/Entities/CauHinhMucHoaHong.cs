using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhMucHoaHong
    {
        public Guid Id { get; set; }
        public Guid? VendorMappingOptionId { get; set; }
        public int? LoaiHoaHong { get; set; }
        public decimal? GiaTriHoaHong { get; set; }
        public Guid? DieuKienId { get; set; }
        public decimal? GiaTriTu { get; set; }
        public decimal? GiaTriDen { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? ParentId { get; set; }
        public Guid? TenantId { get; set; }
    }
}
