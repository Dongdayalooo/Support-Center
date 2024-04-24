using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.Options
{
    public class CauHinhMucHoaHongModel
    {
        public Guid? Id { get; set; }
        public Guid? VendorMappingOptionId { get; set; }
        public int? LoaiHoaHong { get; set; }
        public decimal? GiaTriHoaHong { get; set; }
        public Guid? DieuKienId { get; set; }
        public decimal? GiaTriTu { get; set; }
        public decimal? GiaTriDen { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? ParentId { get; set; }
        public int? Index { get; set; }
        public int? IndexParent { get; set; }
        public string DieuKienName { get; set; }
    }
}
