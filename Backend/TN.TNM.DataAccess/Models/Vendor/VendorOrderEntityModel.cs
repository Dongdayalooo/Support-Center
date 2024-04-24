using System;

namespace TN.TNM.DataAccess.Models.Vendor
{
    public class VendorOrderEntityModel : BaseModel<Databases.Entities.VendorOrder>
    {
        public Guid VendorOrderId { get; set; }
        public int? VendorOrderType { get; set; }   //1: có giá, 2: Không có giá
        public string VendorOrderCode { get; set; }
        public DateTime? VendorOrderDate { get; set; }
        public Guid? CreatedById { get; set; }
        public string CreatedBy { get; set; }
        public string StatusName { get; set; }
        public int? StatusId { get; set; }
        public Guid? VendorId { get; set; }
        public string VendorName { get; set; }
        public string VendorEmail { get; set; }
        public string VendorPhone { get; set; }
        public string VendorAddress { get; set; }

        public Guid? VendorNguoiLienHeId { get; set; }
        public string VendorNguoiLienHeEmail { get; set; }
        public string VendorNguoiLienPhone { get; set; }
        public Guid? OrderActionId { get; set; }

        public string OrderActionName { get; set; }
        public Guid? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }
        public string Note { get; set; }
        public string OrderTypeName { get; set; }
        public string ListPacketServiceName { get; set; }


        public Guid? PaymentMethodId { get; set; }
        public decimal? Amount { get; set; }
        public decimal? AmountCollected { get; set; }
        public decimal? DiscountValue { get; set; }
        public int? DiscountType { get; set; }

        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }


        public decimal? TongTienDonHang { get; set; }
        public decimal? TongTienHoaHong { get; set; }

        public decimal? TotalPayment { get; set; }


        public string OptionName { get; set; }

        public VendorOrderEntityModel(Databases.Entities.VendorOrder entity)
        {
            Mapper(entity, this);
        }
        public VendorOrderEntityModel()
        {

        }
        public override Databases.Entities.VendorOrder ToEntity()
        {
            var entity = new Databases.Entities.VendorOrder();
            Mapper(this, entity);
            return entity;
        }
    }
}
