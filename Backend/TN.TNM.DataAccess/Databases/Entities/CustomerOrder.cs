using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CustomerOrder
    {
        public Guid OrderId { get; set; }
        public string OrderCode { get; set; }
        public DateTime OrderDate { get; set; }
        public string Description { get; set; }
        public string Note { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? PaymentMethod { get; set; }
        public Guid? BankAccountId { get; set; }
        public decimal? Amount { get; set; }
        public decimal? DiscountValue { get; set; }
        public bool? Active { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? TenantId { get; set; }
        public decimal Vat { get; set; }
        public int? StatusOrder { get; set; }
        public int? OrderType { get; set; }
        public bool? IsOrderAction { get; set; }
        public Guid? ObjectId { get; set; }
        public Guid? OrderProcessId { get; set; }
        public Guid? ServicePacketId { get; set; }
        public string PaymentContent { get; set; }
        public string PaymentMethodNote { get; set; }
        public Guid? ProvinceId { get; set; }
        public Guid? DistrictId { get; set; }
        public Guid? WardId { get; set; }
        public bool? ChuyenTiepPddvps { get; set; }
        public bool? ChuyenTiepPdbs { get; set; }
        public string RateContent { get; set; }
        public int? RateStar { get; set; }
        public int? DiscountType { get; set; }
    }
}
