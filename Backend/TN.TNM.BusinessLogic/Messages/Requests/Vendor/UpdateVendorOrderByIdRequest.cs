using System.Collections.Generic;
using TN.TNM.BusinessLogic.Models.Vendor;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Messages.Parameters.Vendor;
using TN.TNM.DataAccess.Models.Vendor;

namespace TN.TNM.BusinessLogic.Messages.Requests.Vendor
{
    public class UpdateVendorOrderByIdRequest : BaseRequest<UpdateVendorOrderByIdParameter>
    {
        public VendorOrderModel VendorOrder { get; set; }
        public List<VendorOrderDetailModel> VendorOrderDetail { get; set; }
        public bool IsSendApproval { get; set; }
        public List<VendorOrderProcurementRequestMappingModel> ListVendorOrderProcurementRequestMapping { get; set; }
        public List<VendorOrderCostDetailModel> ListVendorOrderCostDetail { get; set; }

        public override UpdateVendorOrderByIdParameter ToParameter()
        {
            List<VendorOrderDetail> ListVendorOrderDetail = new List<VendorOrderDetail>();
          

          

            return new UpdateVendorOrderByIdParameter() {
                UserId = UserId,
            };
        }
    }
}
