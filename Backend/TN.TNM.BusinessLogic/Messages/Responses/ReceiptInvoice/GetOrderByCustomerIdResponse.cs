using System.Collections.Generic;
using TN.TNM.BusinessLogic.Models.ReceiptInvoice;
using TN.TNM.DataAccess.Models.Order;

namespace TN.TNM.BusinessLogic.Messages.Responses.ReceiptInvoice
{
    public class GetOrderByCustomerIdResponse : BaseResponse
    {
        public List<CustomerOrderEntityModel> ListOrder { get; set; }
    }
}
