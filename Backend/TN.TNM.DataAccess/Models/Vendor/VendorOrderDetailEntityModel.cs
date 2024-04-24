using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Models.Vendor
{
    public class VendorOrderDetailEntityModel : BaseModel<Databases.Entities.VendorOrderDetail>
    {
        public Guid VendorOrderDetailId { get; set; }
        public Guid VendorOrderId { get; set; }
        public Guid? OrderDetailId { get; set; }
        public Guid? ServicePacketId { get; set; }
        public Guid? OptionId { get; set; }
        public bool? IsExtend { get; set; }
        public decimal? Quantity { get; set; }
        public Guid? CurrencyUnit { get; set; }
        public decimal? Vat { get; set; }
        public bool? DiscountType { get; set; }
        public decimal? DiscountValue { get; set; }
        public decimal? PriceAfterVat { get; set; }
        public decimal? ThanhToanTruoc { get; set; }
        public decimal? TongTienHoaHong { get; set; }
        public string GhiChu { get; set; }

        public string TenDichVu { get; set; }
        public List<string> ThongTinChiTiet { get; set; }
        public string CurrencyUnitName { get; set; }
        public decimal? Price { get; set; }


        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public DateTime? VendorOrderDate { get; set; }

        public string DonViTien { get; set; }
        public int? YeuCauThanhToan { get; set; }
        public decimal? GiaTriThanhToan { get; set; }
        public Guid? DonViTienId { get; set; }
        public decimal? ThueGtgt { get; set; }
        public int? ChietKhauId { get; set; }
        public decimal? GiaTriChietKhau { get; set; }

        public decimal? ThanhTienSauThue { get; set; }

        public int? StatusVendorOrderId { get; set; }


        public int? LoaiHoaHongId { get; set; }
        public decimal? GiaTriHoaHong { get; set; }
        public DateTime? ThoiGianThucHien { get; set; }
        public decimal? TongTienKhachHangThanhToan { get; set; }


        public List<VendorOrderProductDetailProductAttributeValueEntityModel> VendorOrderProductDetailProductAttributeValue { get; set; }

        public VendorOrderDetailEntityModel()
        {
            this.VendorOrderProductDetailProductAttributeValue = new List<VendorOrderProductDetailProductAttributeValueEntityModel>();
        }

        public VendorOrderDetailEntityModel(Databases.Entities.VendorOrderDetail model)
        {
            Mapper(model, this);
        }

        public override Databases.Entities.VendorOrderDetail ToEntity()
        {
            var entity = new Databases.Entities.VendorOrderDetail();
            Mapper(this, entity);
            return entity;
        }
    }
}
