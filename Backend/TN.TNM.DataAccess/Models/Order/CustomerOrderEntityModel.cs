using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Models.CustomerOrder;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Models.Order
{
    public class CustomerOrderEntityModel : BaseModel<Databases.Entities.CustomerOrder>
    {
        public Guid? OrderId { get; set; }
        public Guid? OrderActionId { get; set; }
        public Guid? ObjectId { get; set; }
        public Guid? ServicePacketId { get; set; }
        public string OrderRequireCode { get; set; }
        public string OrderCode { get; set; }
        public string OrderActionCode { get; set; }
        public DateTime? OrderDate { get; set; }
        public Guid? Seller { get; set; }
        public string Description { get; set; }
        public string Note { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? PaymentMethod { get; set; }
        public int? DiscountType { get; set; }
        public bool? ChuyenTiepPDDVPS { get; set; }
        public bool? ChuyenTiepPDBS { get; set; }
        public decimal? Amount { get; set; }
        public decimal? AmountCollected { get; set; }
        public decimal? AmountReceivable { get; set; }
        public decimal? DiscountValue { get; set; }
        public string StatusCode { get; set; }
        public bool? Active { get; set; }
        public bool? IsOrderAction { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int? StatusOrder { get; set; }
        public bool? CanDelete { get; set; }

        public string OrderStatusName { get; set; }
        public string CustomerName { get; set; }
        public int? TypeAccount { get; set; }
        public string ListOrderDetail { get; set; }
        public string ReasonCancel { get; set; }
        public string CustomerAddress { get; set; }
        public Guid? PersonInChargeIdOfCus { get; set; }
        public decimal? Vat { get; set; }
        public string Creatorname { get; set; }
        public Guid? CreatorId { get; set; }
        public string ListPacketServiceName { get; set; }
        public List<Guid> ListPacketServiceId { get; set; }
        public string ServicePacketName { get; set; }
        public int? OrderType { get; set; }
        public string OrderTypeName { get; set; }
        public string StatusOrderName { get; set; }
        public string StatusOrderActionName { get; set; }
        public string PaymentMethodName { get; set; }
        public string CusName { get; set; }
        public string CusAddress { get; set; }
        public string CusPhone { get; set; }
        public DateTime? CusOrderDate { get; set; }
        public string CusNote { get; set; }
        public string SupporterName { get; set; }
        public Guid? OrderProcessId { get; set; }
        //Danh sách người tạo + người phụ trách bước của phiếu
        public List<Guid> ListPersonInCharge { get; set; }
        public bool? IsCreate { get; set; }
        public bool? IsConfirm { get; set; }
        public bool? IsCreateAction { get; set; }
        public bool? IsReport { get; set; }
        public bool? IsComplete { get; set; }
        public string ProductCategoryName { get; set; }
        public Guid? EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int? PaymentMethodOrder { get; set; }
        public string PaymentContent { get; set; }
        public string PaymentMethodNote { get; set; }
        public Guid? OrderProcesId { get; set; }
        public int? RateStar { get; set; }
        public string RateConent { get; set; }
        public Guid? ProvinceId { get; set; }
        public Guid? DistrictId { get; set; }
        public Guid? WardId { get; set; }
        public string ProvinceName { get; set; }
        public string DistrictName { get; set; }
        public string WardName { get; set; }
        public string PaymentMethodCode { get; set; }
        public List<CustomerOrderEntityModel> ListOrderExtend { get; set; }
        public List<CustomerOrderDetailEntityModel> ListCustomerOrderDetail{ get; set; }
        public List<CustomerOrderDetailExtenEntityModel> ListCustomerOrderDetailExten { get; set; }

        public List<CustomerOrderTaskEntityModel> ListVendor { get; set; }
        public List<EmployeeEntityModel> ListEmployeeEntityModel { get; set; }

        public string PhieuHoTroDV { get; set; }

        public CustomerOrderEntityModel(Databases.Entities.CustomerOrder entity)
        {
            Mapper(entity, this);
        }
        public CustomerOrderEntityModel()
        {
            
        }
        public override Databases.Entities.CustomerOrder ToEntity()
        {
            var entity = new Databases.Entities.CustomerOrder();
            Mapper(this, entity);
            return entity;
        }
    }
}
