using Firebase.Database;
using Firebase.Database.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using TN.TNM.DataAccess.Consts.Product;
using TN.TNM.DataAccess.Databases;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Messages.Parameters.Order;
using TN.TNM.DataAccess.Messages.Results;
using TN.TNM.DataAccess.Messages.Results.Order;
using TN.TNM.DataAccess.Models;

namespace TN.TNM.DataAccess.Helper
{
    public static class AccessHelper
    {
        public static FirebaseClient _firebaseClient = new FirebaseClient("https://hello-world-34e33.firebaseio.com");

        public static List<CategoryEntityModel> GetListCategoryByCategoryTypeCode(TNTN8Context context, string categoryTypeCode)
        {

            var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == categoryTypeCode)?.CategoryTypeId;
            var listCategory = context.Category.Where(x => x.CategoryTypeId == categoryTypeId).Select(x => new CategoryEntityModel
            {
                CategoryId = x.CategoryId,
                CategoryCode = x.CategoryCode,
                CategoryName = x.CategoryName
            }).ToList();

            return listCategory;
        }


        public static bool GetAccessDataOfOrganization(TNTN8Context context, Guid userId)
        {
            var user = context.User.FirstOrDefault(x => x.UserId == userId);

            if (user != null)
            {
                var orgIdOfEmp = context.Employee.FirstOrDefault(x => x.EmployeeId == user.EmployeeId)?.OrganizationId;             
                return context.Organization.FirstOrDefault(x => x.Active == true && x.OrganizationId == orgIdOfEmp).IsAccess == null ? false : true;
            }
            return false;
        }
        public static ChangeStatusCustomerOrderResult ChangeStatusCustomerOrder(TNTN8Context context, ChangeStatusCustomerOrderParameter parameter, decimal amount)
        {
            try
            {
                var customerOrder = context.CustomerOrder.FirstOrDefault(x => x.OrderId == parameter.OrderId);
                if (customerOrder == null)
                {
                    return new ChangeStatusCustomerOrderResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tìm thấy phiếu yêu cầu trên hệ thống!"
                    };
                }
                if (parameter.PaymentMethod != null)
                {
                    customerOrder.PaymentMethod = parameter.PaymentMethod.Value;
                }
                var listEmp = new List<Guid>();
                //Lấy list thông báo
                var notificationCateTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == ProductConsts.CategoryTypeCodeNotificationConfig).CategoryTypeId;
                var listNotifi = context.Category.Where(x => x.CategoryTypeId == notificationCateTypeId).ToList();

                var listNotificationConfiguration = context.NotificationConfiguration.Where(x => x.ServicePacketId == customerOrder.ServicePacketId).ToList();
                var listNotificationConfigurationId = listNotificationConfiguration.Select(x => x.Id).ToList();

                var listEmpNoti = context.EmployeeMappingNotificationConfiguration.Where(x => listNotificationConfigurationId.Contains(x.NotificationConfigurationId.Value)).ToList();

                var messagae = "Đã xác nhận thanh toán!";
                customerOrder.StatusOrder = GeneralList.GetTrangThais("CustomerOrder").FirstOrDefault(x => x.Value == 5).Value;
                customerOrder.Amount = amount;
                
                //Cập nhật bước quy trình: OrderProcessDetail
                var result = UpdateOrderProcess(context, ProductConsts.CategoryCodeConfirmStep, customerOrder.OrderProcessId, customerOrder.OrderType.Value,
                    false, customerOrder.OrderId, null);
                
                //Nếu có lỗi thì báo lỗi
                if (result.StatusCode == System.Net.HttpStatusCode.ExpectationFailed)
                {
                    return new ChangeStatusCustomerOrderResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = result.Message,
                    };
                }

                var body = "Phiếu " + customerOrder.OrderCode + ": " + messagae;
                var title = "Phiếu " + customerOrder.OrderCode;
                var type = 1; //1 : order, 2: orderAction
                listEmp = AccessHelper.ThongBaoDayQuyTrinh(context, listNotifi, listNotificationConfiguration, listEmpNoti, customerOrder, body, title, type, "D");

                customerOrder.UpdatedById = parameter.UserId;
                customerOrder.UpdatedDate = DateTime.Now;

                //Tính tiền đơn hàng
                customerOrder.Amount = CommonHelper.TinhTienCustomerOrder(customerOrder.StatusOrder, parameter.ListDetail,
                                                                         parameter.ListDetailExtend, customerOrder.DiscountType, customerOrder.DiscountValue);

                context.CustomerOrder.Update(customerOrder);
                context.SaveChanges();

                PushNotificationFireBase(customerOrder.OrderCode, customerOrder.OrderId, "/order/create;OrderId=", messagae, listEmp.Distinct().ToList());
                return new ChangeStatusCustomerOrderResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = messagae,
                    ListEmpId = listEmp.Distinct().ToList(),
                };
            }
            catch (Exception e)
            {
                return new ChangeStatusCustomerOrderResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        private static void PushNotificationFireBase(string orderCode, Guid orderId, string url, string message, List<Guid> listEmployeeId)
        {
            try
            {
                foreach (var employeeId in listEmployeeId)
                {
                    var notification = new
                    {
                        content = "Phiếu " + orderCode + ": " + message,
                        status = false,
                        url = url + orderId,
                        orderId = orderId,
                        date = DateTime.Now.ToString("dd/MM/yyy HH:mm:ss"),
                        employeeId = employeeId
                    };
                    _firebaseClient.Child("notification").Child($"{employeeId}").PostAsync(notification);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public static List<Guid> ThongBaoDayQuyTrinh(TNTN8Context context, List<Category> listNotifi, List<NotificationConfiguration> listNotificationConfiguration,
                    List<EmployeeMappingNotificationConfiguration> listEmpNoti, CustomerOrder customerOrder, string body, string title, int type, string categoryCode)
        {
             
            //Lấy ra người cần nhận thông báo ở sự kiện đặt dịch vụ
            var datDichVuId = listNotifi.FirstOrDefault(x => x.CategoryCode == categoryCode).CategoryId;
            var listEmpId = new List<Guid>();
            var notiConfigure = listNotificationConfiguration.FirstOrDefault(x => x.CategoryId == datDichVuId);
            var listEmp = listEmpNoti.Where(x => x.NotificationConfigurationId == notiConfigure.Id).Select(x => x.EmployeeId.Value).ToList();
            //Thông báo
            var notificationReceiver = CommonHelper.GetListEmployeeIdNotifi(context, customerOrder, notiConfigure, null, null);
            var getListEmpId = notificationReceiver.ListEmployeeId;

            var deviceId = context.User.Where(x => x.EmployeeId == notificationReceiver.CustomerId || (getListEmpId != null && getListEmpId.Contains(x.EmployeeId.Value))).ToList();
            listEmp.AddRange(getListEmpId);

            deviceId.ForEach(item =>
            {
                if (item.DeviceId != null)
                {
                    //var type = 1; //1 : order, 2: orderAction
                    CommonHelper.PushNotificationToDevice(item.DeviceId, title, body, type.ToString(), customerOrder.OrderId.ToString());
                }
            });
            return listEmp;
        }

        //Code bước, Quy trình id, loại phiếu (1: yêu cầu, 2: bổ sung), là phiếu yêu cầu hay bổ sung (false | true)
        public static BaseResult UpdateOrderProcess(TNTN8Context context, string StepCode, Guid? OrderProcessId, int OrderType, bool isExten, Guid OrderId, int? StatusOrder)
        {
            var result = new BaseResult();
            result.StatusCode = System.Net.HttpStatusCode.OK;
            result.Message = "Cập nhật quy trình thành công!";
            //nếu loại phiếu là phiếu yêu cầu thì mới cập nhật
            if (OrderType == 1)
            {
                //Lấy quy trình
                var orderProcess = context.OrderProcess.FirstOrDefault(x => x.Id == OrderProcessId);
                if (orderProcess == null)
                {
                    result.StatusCode = System.Net.HttpStatusCode.ExpectationFailed;
                    result.Message = "Không tìm thấy quy trình trên hệ thống!";
                    return result;
                }

                //Trạng thái của các bước
                var listStatus = GeneralList.GetTrangThais("OrderProcessDetail").ToList();

                var listAllProcessDetail = context.OrderProcessDetail.Where(x => x.OrderProcessId == OrderProcessId).OrderByDescending(x => x.StepId).ToList();
                //Nếu là bước k mặc định
                if (String.IsNullOrEmpty(StepCode))
                {
                    //Lấy bước trước đó 
                    var lastStep = listAllProcessDetail.Where(x => x.OrderProcessId == OrderProcessId && x.Status == 3).First();
                    var indexOfLastStep = listAllProcessDetail.IndexOf(lastStep);
                    var currentStep = listAllProcessDetail[indexOfLastStep + 1];

                    //và cập nhật thành hoàn thành(status == 3: Hoàn thành)
                    currentStep.Status = listStatus.FirstOrDefault(x => x.Value == 3).Value;
                    context.OrderProcessDetail.Update(currentStep);
                }
                //Nếu là bước mặc định
                else
                {
                    //Lấy ra các bước
                    var cateTypeIdOfStep = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == ProductConsts.CategoryTypeCodeActionStep).CategoryTypeId;
                    var currentStepId = context.Category.FirstOrDefault(x => x.CategoryTypeId == cateTypeIdOfStep && x.CategoryCode == StepCode).CategoryId;

                    //Lấy bước hiện tại và cập nhật thành hoàn thành
                    var currentStep = listAllProcessDetail.FirstOrDefault(x => x.CategoryId == currentStepId);

                    //Nếu là bước khác hỗ trợ dịch vụ mặc định => Chuyển sạng hoàn thành (3)
                    if (StepCode != ProductConsts.CategoryCodeSupportStep)
                    {
                        currentStep.Status = listStatus.FirstOrDefault(x => x.Value == 3).Value;
                    }
                    //Nếu là bước hỗ trợ dịch vụ mặc định => Cập nhật theo biến chuyền vào
                    else if (StepCode == ProductConsts.CategoryCodeSupportStep && isExten)
                    {
                        currentStep.Status = listStatus.FirstOrDefault(x => x.Value == StatusOrder).Value;
                    }
                    context.OrderProcessDetail.Update(currentStep);
                }

                //Cập nhật trạng thái của quy trình (OrderProcess): Nếu tất cả các bước là hoàn thành (3) => trạng thái quy trình chuyển thành hoàn thành
                if (listAllProcessDetail.Where(x => x.Status == 3).Count() == (listAllProcessDetail.Count() - 1))
                {
                    var statusDoneOrderProcess = GeneralList.GetTrangThais("OrderProcess").FirstOrDefault(x => x.Value == 3).Value;
                    orderProcess.Status = statusDoneOrderProcess;
                    context.OrderProcess.Update(orderProcess);
                }

                context.SaveChanges();

            }
            return result;
        }
    }
}
