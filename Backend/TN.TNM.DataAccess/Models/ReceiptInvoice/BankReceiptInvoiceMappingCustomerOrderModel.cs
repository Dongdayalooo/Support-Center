using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Models.ReceiptInvoice
{
    public class PhieuThuBaoCoMappingCustomerOrderModel
    {
        public Guid Id { get; set; }
        public Guid? ObjectId { get; set; }
        public int? ObjectType { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? VendorOrderId { get; set; }
        public decimal? Amount { get; set; }
        public string OrderCode { get; set; }
        public string ListPacketServiceName { get; set; }
        public string OrderTypeName { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
