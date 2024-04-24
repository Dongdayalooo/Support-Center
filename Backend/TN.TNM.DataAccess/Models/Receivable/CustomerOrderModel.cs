using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Models.Order
{
    public class CustomerOrderModel
    {
        //public Guid CustomerId { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? ContactId { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? VendorOrderId { get; set; }
        public Guid? OrderActionId { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? StatusOrder { get; set; }
        public string CustomerName { get; set; }
        public string CustomerCode { get; set; }
        public string GoiDichVu { get; set; }
        public List<Guid> DichVuId { get; set; }
        public string PhanHang { get; set; }
        public string PhieuHoTroDV { get; set; }
        public string PhieuDatDV { get; set; }
        public string NgayDatDV { get; set; }
        public string TrangThai { get; set; }
        public decimal? TongTien { get; set; }
        public string DichVu { get; set; } = "";
        public string NgayThanhToan { get; set; }
        public string DonHang { get; set; }
        public Guid DonHangId { get; set; }
    }
}
