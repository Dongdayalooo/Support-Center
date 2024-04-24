using System.Collections.Generic;
using TN.TNM.BusinessLogic.Models.Vendor;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Messages.Parameters.Vendor;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.BusinessLogic.Messages.Requests.Vendor
{
    public class CreateVendorOrderRequest : BaseRequest<CreateVendorOrderParameter>
    {
        public VendorOrderModel VendorOrder { get; set; }
        public List<VendorOrderDetailModel> VendorOrderDetail { get; set; }
        public List<VendorOrderProcurementRequestMappingModel> ListVendorOrderProcurementRequestMapping { get; set; }
        public List<VendorOrderCostDetailModel> ListVendorOrderCostDetail { get; set; }

        public override CreateVendorOrderParameter ToParameter()
        {
            List<VendorOrderDetail> lst = new List<VendorOrderDetail>();
        
            return new CreateVendorOrderParameter() {
                UserId = UserId,
            };
        }
    }
}
