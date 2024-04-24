using System;

namespace TN.TNM.DataAccess.Models.Receivable
{
    public class ReceivableCustomerReportModel
    {
       // public Guid Id { get; set; }
       public Guid? CustomerId { get; set; }
       public Guid? ContactId { get; set; }
       public Guid? VendorOrderId { get; set; }
       public Guid? OrderId { get; set; }
        public Guid? OrderActionId { get; set; }
        public string MaKH { get; set; }
        public string TenKH { get; set; }
        public string PhanHang { get; set; }
        public string NgayDatDV { get; set; }
        public string PhieuDatDV { get; set; }
        public string PhieuHoTroDV { get; set; }
        public string GoiDichVu { get; set; }
        public string DichVu { get; set; } = "";
        public string TrangThai { get; set; }
        public decimal? TongTien { get; set; }
        public string NgayThanhToan { get; set; }
        public int? StatusOrder { get; set; }
        public string DonHang { get; set; }
        public Guid DonHangId { get; set; }
    }
}
