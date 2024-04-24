using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class VendorOrder
    {
        public Guid VendorOrderId { get; set; }
        public string VendorOrderCode { get; set; }
        public int? VendorOrderType { get; set; } //1: KTTN thanh toán, 2: NCC thanh toán
        public DateTime VendorOrderDate { get; set; }
        public Guid? OrderActionId { get; set; }
        public int StatusId { get; set; }
        public Guid? VendorId { get; set; }
        public Guid? VendorNguoiLienHeId { get; set; }
        public Guid? CustomerId { get; set; }
        public string Note { get; set; }
        public Guid? PaymentMethodId { get; set; }
        public decimal? Amount { get; set; }
        public decimal? DiscountValue { get; set; }

        public decimal? TongTienDonHang { get; set; }
        public decimal? TongTienHoaHong { get; set; }

        public int? DiscountType { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? TenantId { get; set; }
    }
}
