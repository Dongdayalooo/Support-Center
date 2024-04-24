using AutoMapper;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Admin.Dashboard;
using TN.TNM.DataAccess.Messages.Results.Admin.Dashboard;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Order;
using TN.TNM.DataAccess.Models.Product;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class DashboardDAO : BaseDAO, IDashboardDataAccess
    {
        private readonly IMapper _mapper;

        public DashboardDAO(
            Databases.TNTN8Context _content, IMapper mapper
        )
        {
            this.context = _content;
            _mapper = mapper;

        }

        private List<CustomerOrderEntityModel> TakeListCustomerOrderEntityModel()
        {
            var listOrderType = GeneralList.GetTrangThais("OrderType").ToList();
            var listCustomerOrder = context.CustomerOrder
                                    .Where(x => x.StatusOrder == 4 || x.StatusOrder == 5)
                                    .Select(x => new CustomerOrderEntityModel
                                    {
                                        OrderId = x.OrderId,
                                        OrderCode = x.OrderCode,
                                        CustomerId = x.CustomerId,
                                        StatusOrder = x.StatusOrder,
                                        CreatedDate = x.CreatedDate,
                                        CreatedById = x.CreatedById,
                                        UpdatedDate = x.UpdatedDate,
                                        DiscountType = x.DiscountType,
                                        DiscountValue = x.DiscountValue,
                                        Vat = x.Vat,
                                        OrderTypeName = listOrderType.FirstOrDefault(y => y.Value == x.OrderType).Name,
                                    }).ToList();

            var listOrderId = listCustomerOrder.Select(x => x.OrderId).ToList();
            var listOrderDetail = context.CustomerOrderDetail.Where(x => listOrderId.Contains(x.OrderId)).Select(x => _mapper.Map<CustomerOrderDetailEntityModel>(x)).ToList();
            var listCustomerOrderDetailExten = context.CustomerOrderDetailExten.Where(x => listOrderId.Contains(x.OrderId)).Select(x => _mapper.Map<CustomerOrderDetailExtenEntityModel>(x)).ToList();
            listCustomerOrder.ForEach(item =>
            {
                #region
                //Tùy chọn của phiếu yêu cầu
                var listOrderDetailCurrent = listOrderDetail.Where(x => x.OrderId == item.OrderId).ToList();
                //Nếu có phát sinh
                var listOderDetailExtenCurrent = listCustomerOrderDetailExten.Where(x => x.OrderId == item.OrderId).ToList();
                item.Amount = CommonHelper.TinhTienCustomerOrder(item.StatusOrder, listOrderDetailCurrent,  listOderDetailExtenCurrent, item.DiscountType, item.DiscountValue);
                #endregion
            });

            return listCustomerOrder;
        }

        public TakeRevenueStatisticDashboardResult TakeRevenueStatisticDashboard(TakeRevenueStatisticDashboardParameter parameter)
        {
            try
            {
                var listCustomerOrder = TakeListCustomerOrderEntityModel();

                DateTime today = DateTime.Today;
                DateTime monday = DateTime.Today; while (monday.DayOfWeek != DayOfWeek.Monday) monday = monday.AddDays(-1);
                DateTime sunday = DateTime.Today.AddDays(7); while (sunday.DayOfWeek != DayOfWeek.Sunday) sunday = sunday.AddDays(-1);
                DateTime firstDayMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                DateTime lastDayMonth = firstDayMonth.AddMonths(1).AddTicks(-1);
                DateTime firstDayOfQuarter = new DateTime(DateTime.Now.Year, (((DateTime.Now.Month - 1) / 3 + 1) - 1) * 3 + 1, 1);
                DateTime lastDayOfQuarter = firstDayOfQuarter.AddMonths(3).AddTicks(-1);
                DateTime firstDayOfYear = new DateTime(DateTime.Now.Year, 1, 1);
                DateTime lastDayOfYear = new DateTime(DateTime.Now.Year, 12, 31).AddDays(1).AddTicks(-1);

                var revenueStatisticModel = new RevenueStatisticModel();
                revenueStatisticModel.RevenueOfDay = (decimal)listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= today && x.UpdatedDate <= today.AddDays(1).AddTicks(-1)).Sum(x => x.Amount);
                revenueStatisticModel.RevenueOfWeek = (decimal)listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= monday && x.UpdatedDate <= sunday.AddDays(1).AddTicks(-1)).Sum(x => x.Amount);
                revenueStatisticModel.RevenueOfMonth = (decimal)listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= firstDayMonth && x.UpdatedDate <= lastDayMonth).Sum(x => x.Amount);
                revenueStatisticModel.RevenueOfQuarter = (decimal)listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= firstDayOfQuarter && x.UpdatedDate <= lastDayOfQuarter).Sum(x => x.Amount);
                revenueStatisticModel.RevenueOfYear = (decimal)listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= firstDayOfYear && x.UpdatedDate <= lastDayOfYear).Sum(x => x.Amount);
                revenueStatisticModel.RevenueWaitPayment = (decimal)listCustomerOrder.Where(x => x.StatusOrder == 4).Sum(x => x.Amount);

                revenueStatisticModel.RevenueOfYesterday = (decimal)(revenueStatisticModel.RevenueOfDay - listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= today.AddDays(-1) && x.UpdatedDate <= today.AddTicks(-1)).Sum(x => x.Amount));
                revenueStatisticModel.RevenueOfLastWeek = (decimal)(revenueStatisticModel.RevenueOfWeek - listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= monday.AddDays(-7) && x.UpdatedDate <= sunday.AddDays(-7).AddDays(1).AddTicks(-1)).Sum(x => x.Amount));
                revenueStatisticModel.RevenueOfLastMonth = (decimal)(revenueStatisticModel.RevenueOfMonth - listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= firstDayMonth.AddMonths(-1) && x.UpdatedDate <= lastDayMonth.AddMonths(-1)).Sum(x => x.Amount));
                revenueStatisticModel.RevenueOfLastQuarter = (decimal)(revenueStatisticModel.RevenueOfQuarter - listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= firstDayOfQuarter.AddMonths(-3) && x.UpdatedDate <= lastDayOfQuarter.AddMonths(-3)).Sum(x => x.Amount));
                revenueStatisticModel.RevenueOfLastYear = (decimal)(revenueStatisticModel.RevenueOfYear - listCustomerOrder.Where(x => x.StatusOrder == 5 && x.UpdatedDate >= firstDayOfYear.AddYears(-1) && x.UpdatedDate <= lastDayOfYear.AddYears(-1)).Sum(x => x.Amount));

                return new TakeRevenueStatisticDashboardResult
                {
                    RevenueStatisticModel = revenueStatisticModel,
                    StatusCode = HttpStatusCode.OK,
                    Message = "Thành công"
                };
            }
            catch (Exception ex)
            {
                return new TakeRevenueStatisticDashboardResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    Message = ex.Message
                };
            }
        }

        public TakeRevenueStatisticWaitPaymentDashboardResult TakeRevenueStatisticWaitPaymentDashboard(TakeRevenueStatisticDashboardParameter parameter)
        {
            try
            {

                var user = (from u in context.User
                            join e in context.Employee on u.EmployeeId equals e.EmployeeId
                            into eData
                            from e in eData.DefaultIfEmpty()

                            join v in context.Vendor on u.EmployeeId equals v.VendorId
                            into vData
                            from v in vData.DefaultIfEmpty()

                            where u.UserId == parameter.UserId
                            select new
                            {
                                ObjectId = e == null ? v.VendorId : e.EmployeeId,
                                NguoiThucHienType = e == null ? 1 : 2,
                            }).FirstOrDefault();

                var listRevenueStatisticWaitPaymentModel = new List<RevenueStatisticWaitPaymentModel>();


                //Danh sashc đơn hàng thu tiền Ncc trạng thái chưa thanh toán
                var listVendorOrder = (from ov in context.VendorOrder
                                       where ov.StatusId == 2 && ov.VendorOrderType == 2
                                       select new
                                       {
                                           OrderActionId = ov.OrderActionId,
                                           TongTienHoaHong = ov.TongTienHoaHong,
                                       }).ToList();

                var listOrderType = GeneralList.GetTrangThais("OrderType").ToList();
                var listCustomerOrder = (from cu in context.CustomerOrder.Where(x => x.IsOrderAction == false)

                                         join orderAction in context.CustomerOrder.Where(x => x.IsOrderAction == true) on cu.OrderId equals orderAction.ObjectId
                                         into orderActionData
                                         from orderAction in orderActionData.DefaultIfEmpty()


                                         join s in context.ServicePacket on cu.ServicePacketId
                                         equals s.Id into sJoined
                                         from s in sJoined.DefaultIfEmpty()
                                         join c in context.ProductCategory on s.ProductCategoryId
                                         equals c.ProductCategoryId into csJoined
                                         from cs in csJoined.DefaultIfEmpty()
                                         where cu.StatusOrder == 4
                                         select new CustomerOrderEntityModel
                                         {
                                             OrderId = cu.OrderId,
                                             StatusOrder = cu.StatusOrder,
                                             CreatedDate = cu.CreatedDate,
                                             UpdatedDate = cu.UpdatedDate,
                                             DiscountType = cu.DiscountType,
                                             DiscountValue = cu.DiscountValue,
                                             Vat = cu.Vat,
                                             Amount = cu.Amount + (listVendorOrder.Where(x => x.OrderActionId == orderAction.OrderId).Sum(x => x.TongTienHoaHong) ?? 0),
                                             ServicePacketId = cu.ServicePacketId,
                                             OrderTypeName = listOrderType.FirstOrDefault(y => y.Value == cu.OrderType).Name,
                                             ProductCategoryName = cs.ProductCategoryName,
                                             OrderActionId = orderAction.OrderId,
                                         }).ToList();


           


                var listOrderId = listCustomerOrder.Select(x => x.OrderId).ToList();
                var listOrderDetail = context.CustomerOrderDetail.Where(x => listOrderId.Contains(x.OrderId)).ToList();
                var listCustomerOrderDetailExten = context.CustomerOrderDetailExten.Where(x => listOrderId.Contains(x.OrderId)).ToList();

                var listCustomerOrderGroup = listCustomerOrder.GroupBy(x => x.ProductCategoryName).ToList();
                foreach (var item in listCustomerOrderGroup)
                {
                    var revenueStatisticWaitPayment = new RevenueStatisticWaitPaymentModel();
                    revenueStatisticWaitPayment.ProductCategoryName = item.FirstOrDefault().ProductCategoryName;
                    revenueStatisticWaitPayment.Amount = listCustomerOrder.Where(x => x.ProductCategoryName == item.Key).Sum(x => x.Amount);
                    revenueStatisticWaitPayment.Percent = (item.Sum(x => x.Amount) / listCustomerOrder.Sum(x => x.Amount) * 100);
                    listRevenueStatisticWaitPaymentModel.Add(revenueStatisticWaitPayment);
                }

                var listServicePacket = context.ServicePacket
                                        .Select(x => new ServicePacketEntityModel
                                        {
                                            Id = x.Id,
                                            Name = x.Name
                                        });
                var listCustomerOrderGroupByServicePacketId = listCustomerOrder.GroupBy(x => x.ServicePacketId).ToList();
                var listRevenueStatisticWaitPaymentByServicePacketId = new List<RevenueStatisticWaitPaymentModel>();
                foreach (var item in listCustomerOrderGroupByServicePacketId)
                {
                    var revenueStatisticWaitPayment = new RevenueStatisticWaitPaymentModel();
                    revenueStatisticWaitPayment.ProductCategoryName = item.FirstOrDefault().ProductCategoryName;
                    revenueStatisticWaitPayment.PercentOfServicePacket = (item.Sum(x => x.Amount) / listRevenueStatisticWaitPaymentModel.Where(x => x.ProductCategoryName == item.FirstOrDefault().ProductCategoryName).FirstOrDefault().Amount) * 100;
                    revenueStatisticWaitPayment.Amount = item.Sum(x => x.Amount);
                    revenueStatisticWaitPayment.ServicePacketName = listServicePacket.Where(x => x.Id == item.FirstOrDefault().ServicePacketId).FirstOrDefault().Name;
                    listRevenueStatisticWaitPaymentByServicePacketId.Add(revenueStatisticWaitPayment);
                }

                foreach (var item in listRevenueStatisticWaitPaymentModel)
                {
                    item.ListRevenueStatisticWaitPaymentModel = listRevenueStatisticWaitPaymentByServicePacketId.Where(x => x.ProductCategoryName == item.ProductCategoryName).ToList();
                }

                return new TakeRevenueStatisticWaitPaymentDashboardResult
                {
                    ListRevenueStatisticWaitPaymentModel = listRevenueStatisticWaitPaymentModel,
                    StatusCode = HttpStatusCode.OK,
                    Message = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeRevenueStatisticWaitPaymentDashboardResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }

        public TakeStatisticServiceTicketDashboardResult TakeStatisticServiceTicketDashboard(TakeRevenueStatisticDashboardParameter parameter)
        {
            try
            {
                var listServicePacket = context.ServicePacket
                                  .Select(x => new ServicePacketEntityModel
                                  {
                                      Id = x.Id,
                                      Name = x.Name,
                                  }).ToList();

                var listCustomerOrder = (from cu in context.OrderProcess
                                         join s in listServicePacket on cu.ServicePacketId equals s.Id into sJoined
                                         from s in sJoined.DefaultIfEmpty()
                                         join c in context.ProductCategory on s.ProductCategoryId equals c.ProductCategoryId into csJoined
                                         from cs in csJoined.DefaultIfEmpty()
                                         select new OrderProcessEntityModel
                                         {
                                             ServicePacketId = cu.ServicePacketId,
                                             Status = cu.Status,
                                             ProductCategoryName = cs.ProductCategoryName
                                         }).ToList();

                var listIdOrderProcess = context.OrderProcess.Where(x => x.Status == 2).Select(x => x.Id).ToList();
                int countOrderProcessInCustomerOrder = context.CustomerOrder.Count(x => listIdOrderProcess.Contains((Guid)x.OrderProcessId) && x.StatusOrder == 2 && x.IsOrderAction == false);
          
                var listCustomerOrderGroupByServicePacketId = listCustomerOrder.GroupBy(x => x.ServicePacketId).ToList();
                var listStatisticServicePacketNewStatus = new List<NewStatus>();
                var listStatisticServicePacketProgressStatus = new List<ProgressStatus>();
                var listStatisticServicePacketDoneStatus = new List<DoneStatus>();
                var listStatisticServicePacketCancelStatus = new List<CancelStatus>();
                foreach (var item in listCustomerOrderGroupByServicePacketId)
                {
                    var statisticServicePacketNewStatus = new NewStatus();
                    statisticServicePacketNewStatus.ServicePacketName = listServicePacket.Where(x => x.Id == item.Key).FirstOrDefault()?.Name;
                    statisticServicePacketNewStatus.ProductCategoryName = item.FirstOrDefault()?.ProductCategoryName;
                    statisticServicePacketNewStatus.Count = listCustomerOrder.Count(x => x.Status == 1 && x.ServicePacketId == item.Key);
                    listStatisticServicePacketNewStatus.Add(statisticServicePacketNewStatus);

                    var statisticServicePacketProgressStatus = new ProgressStatus();
                    statisticServicePacketProgressStatus.ServicePacketName = listServicePacket.Where(x => x.Id == item.Key).FirstOrDefault()?.Name;
                    statisticServicePacketProgressStatus.ProductCategoryName = item.FirstOrDefault()?.ProductCategoryName;
                    statisticServicePacketProgressStatus.Count = listCustomerOrder.Count(x => x.Status == 2 && x.ServicePacketId == item.Key);
                    listStatisticServicePacketProgressStatus.Add(statisticServicePacketProgressStatus);

                    var statisticServicePacketDoneStatus = new DoneStatus();
                    statisticServicePacketDoneStatus.ServicePacketName = listServicePacket.Where(x => x.Id == item.Key).FirstOrDefault()?.Name;
                    statisticServicePacketDoneStatus.ProductCategoryName = item.FirstOrDefault()?.ProductCategoryName;
                    statisticServicePacketDoneStatus.Count = listCustomerOrder.Count(x => x.Status == 3 && x.ServicePacketId == item.Key);
                    listStatisticServicePacketDoneStatus.Add(statisticServicePacketDoneStatus);

                    var statisticServicePacketCancelStatus = new CancelStatus();
                    statisticServicePacketCancelStatus.ServicePacketName = listServicePacket.Where(x => x.Id == item.Key).FirstOrDefault()?.Name;
                    statisticServicePacketCancelStatus.ProductCategoryName = item.FirstOrDefault()?.ProductCategoryName;
                    statisticServicePacketCancelStatus.Count = listCustomerOrder.Count(x => (x.Status == 4 || x.Status == 5 || x.Status == 6) && x.ServicePacketId == item.Key);
                    listStatisticServicePacketCancelStatus.Add(statisticServicePacketCancelStatus);
                }

                var listCustomerOrderGroup = listCustomerOrder.GroupBy(x => x.ProductCategoryName);
                var listNewStatus = new List<NewStatus>();
                var listProgressStatus = new List<ProgressStatus>();
                var listDoneStatus = new List<DoneStatus>();
                var listCancelStatus = new List<CancelStatus>();

                foreach (var item in listCustomerOrderGroup)
                {
                    var newStatus = new NewStatus();
                    newStatus.Count = listCustomerOrder.Count(x => x.Status == 1 && x.ProductCategoryName == item.Key);
                    newStatus.ProductCategoryName = item.Key;
                    newStatus.ListStatisticServicePacketNewStatus = listStatisticServicePacketNewStatus.Where(x => x.ProductCategoryName == item.Key).ToList();
                    listNewStatus.Add(newStatus);

                    var progressStatus = new ProgressStatus();
                    progressStatus.Count = listCustomerOrder.Count(x => x.Status == 2 && x.ProductCategoryName == item.Key);
                    progressStatus.ProductCategoryName = item.Key;
                    progressStatus.ListStatisticServicePacketProgressStatus = listStatisticServicePacketProgressStatus.Where(x => x.ProductCategoryName == item.Key).ToList();
                    listProgressStatus.Add(progressStatus);

                    var doneStatus = new DoneStatus();
                    doneStatus.Count = listCustomerOrder.Count(x => x.Status == 3 && x.ProductCategoryName == item.Key);
                    doneStatus.ProductCategoryName = item.Key;
                    doneStatus.ListStatisticServicePacketDoneStatus = listStatisticServicePacketDoneStatus.Where(x => x.ProductCategoryName == item.Key).ToList();
                    listDoneStatus.Add(doneStatus);

                    var cancelStatus = new CancelStatus();
                    cancelStatus.Count = listCustomerOrder.Count(x => (x.Status == 4 || x.Status == 5 || x.Status == 6) && x.ProductCategoryName == item.Key);
                    cancelStatus.ProductCategoryName = item.Key;
                    cancelStatus.ListStatisticServicePacketCancelStatus = listStatisticServicePacketCancelStatus.Where(x => x.ProductCategoryName == item.Key).ToList();
                    listCancelStatus.Add(cancelStatus);
                }

                return new TakeStatisticServiceTicketDashboardResult
                {
                    ListNewStatus = listNewStatus,
                    ListProgressStatus = listProgressStatus,
                    ListDoneStatus = listDoneStatus,
                    ListCancelStatus = listCancelStatus,
                    CountOrderProcess = countOrderProcessInCustomerOrder,
                    StatusCode = HttpStatusCode.OK,
                    Message = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeStatisticServiceTicketDashboardResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }

        public TakeRevenueStatisticEmployeeDashboardResult TakeRevenueStatisticEmployeeDashboard(TakeRevenueStatisticDashboardByFilterParameter parameter)
        {
            try
            {
                var listOrderType = GeneralList.GetTrangThais("OrderType").ToList();
                var listCustomerOrder = (from cu in context.CustomerOrder
                                         join u in context.User on cu.CreatedById equals u.UserId into uJoind
                                         from u in uJoind.DefaultIfEmpty()
                                         join e in context.Employee on u.EmployeeId equals e.EmployeeId into euJoined
                                         from eu in euJoined.DefaultIfEmpty()
                                         where cu.StatusOrder == 5 && cu.UpdatedDate >= ((DateTime)(parameter.StartDate)).Date && cu.UpdatedDate <= ((DateTime)(parameter.EndDate)).Date.AddDays(1).AddTicks(-1)
                                         select new CustomerOrderEntityModel
                                         {
                                             OrderId = cu.OrderId,
                                             DiscountType = cu.DiscountType,
                                             DiscountValue = cu.DiscountValue,
                                             Vat = cu.Vat,
                                             StatusOrder = cu.StatusOrder,
                                             EmployeeName = eu.EmployeeName,
                                             EmployeeId = eu.EmployeeId
                                         }).ToList();

                var listOrderId = listCustomerOrder.Select(x => x.OrderId).ToList();
                var listOrderDetail = context.CustomerOrderDetail.Where(x => listOrderId.Contains(x.OrderId)).Select(x => _mapper.Map<CustomerOrderDetailEntityModel>(x)).ToList();
                var listCustomerOrderDetailExten = context.CustomerOrderDetailExten.Where(x => listOrderId.Contains(x.OrderId)).Select(x => _mapper.Map<CustomerOrderDetailExtenEntityModel>(x)).ToList();
                listCustomerOrder.ForEach(item =>
                {
                    #region
                   
                    //Tùy chọn của phiếu yêu cầu
                    var listOrderDetailCurrent = listOrderDetail.Where(x => x.OrderId == item.OrderId).ToList();
                    //Nếu có phát sinh
                    var listOderDetailExtenCurrent = listCustomerOrderDetailExten.Where(x => x.OrderId == item.OrderId).ToList();
                    item.Amount = CommonHelper.TinhTienCustomerOrder(item.StatusOrder, listOrderDetailCurrent, listOderDetailExtenCurrent, item.DiscountType, item.DiscountValue);
                    #endregion
                });

                var listRevenueStatisticEmployeeModel = new List<RevenueStatisticEmployeeModel>();
                var listCustomerOrderGroup = listCustomerOrder.GroupBy(x => x.EmployeeId).ToList();
                foreach (var item in listCustomerOrderGroup)
                {
                    if(item.FirstOrDefault().EmployeeId != null)
                    {
                        var revenueStatisticEmployee = new RevenueStatisticEmployeeModel();
                        revenueStatisticEmployee.EmployeeName = item.FirstOrDefault().EmployeeName;
                        revenueStatisticEmployee.Amount = item.Where(x => x.EmployeeId == item.Key).Sum(x => x.Amount);
                        listRevenueStatisticEmployeeModel.Add(revenueStatisticEmployee);
                    }
                }

                return new TakeRevenueStatisticEmployeeDashboardResult
                {
                    ListRevenueStatisticEmployeeModel = listRevenueStatisticEmployeeModel.OrderByDescending(x => x.Amount).Take((parameter.Count == null || (int)parameter.Count == 0) ? 100000 : (int)parameter.Count).ToList(),
                    StatusCode = HttpStatusCode.OK,
                    Message = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeRevenueStatisticEmployeeDashboardResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }

        public TakeRevenueStatisticServicePacketDashboardResult TakeRevenueStatisticServicePacketDashboard(TakeRevenueStatisticDashboardByFilterParameter parameter)
        {
            try
            {
                var listRevenueStatisticServicePacketModel = new List<RevenueStatisticServicePacketModel>();
                var listRevenueStatisticServicePacketModelByServicePacket = new List<RevenueStatisticServicePacketModel>();

                int? soLanXacNhan = 0;
                int? soLanTuChoi = 0;
                int? soChoXacNhan = 0;
                var soDichVuDaThucHien = new List<ThongKeSoLuongDichVuNccThucHienModel>();

                var user = (from u in context.User
                            join e in context.Employee on u.EmployeeId equals e.EmployeeId
                            into eData
                            from e in eData.DefaultIfEmpty()

                            join v in context.Vendor on u.EmployeeId equals v.VendorId
                            into vData
                            from v in vData.DefaultIfEmpty()

                            where u.UserId == parameter.UserId
                            select new
                            {
                                ObjectId = e == null ? v.VendorId : e.EmployeeId,
                                NguoiThucHienType = e == null ? 1 : 2,
                            }).FirstOrDefault();


                var dates = new List<DateTime>();
                for (var dt = (DateTime)parameter.StartDate; dt <= ((DateTime)(parameter.EndDate)); dt = dt.AddDays(1))
                {
                    dates.Add(dt.Date);
                }

                //Danh sashc đơn hàng thu tiền Ncc tt đã thanh toán, thanh toán 1 phần
                var listVendorOrder = (from ov in context.VendorOrder
                                       where ov.StatusId == 2 && (ov.VendorOrderType == 3 || ov.VendorOrderType == 4)
                                       select new
                                       {
                                           OrderActionId = ov.OrderActionId,
                                           TongTienHoaHong = ov.TongTienHoaHong,
                                       }).ToList();


                var listOrderType = GeneralList.GetTrangThais("OrderType").ToList();
                    var listCustomerOrder = (from cu in context.CustomerOrder

                                             join orderAction in context.CustomerOrder.Where(x => x.IsOrderAction == true) on cu.OrderId equals orderAction.ObjectId
                                             into orderActionData
                                             from orderAction in orderActionData.DefaultIfEmpty()

                                             join s in context.ServicePacket on cu.ServicePacketId
                                             equals s.Id into sJoined
                                             from s in sJoined.DefaultIfEmpty()
                                             join c in context.ProductCategory on s.ProductCategoryId
                                             equals c.ProductCategoryId into csJoined
                                             from cs in csJoined.DefaultIfEmpty()
                                             where cu.StatusOrder == 5 && cu.UpdatedDate >= ((DateTime)(parameter.StartDate)).Date && cu.UpdatedDate <= ((DateTime)(parameter.EndDate)).Date.AddDays(1).AddTicks(-1)
                                             select new CustomerOrderEntityModel
                                             {
                                                 OrderId = cu.OrderId,
                                                 StatusOrder = cu.StatusOrder,
                                                 CreatedDate = cu.CreatedDate,
                                                 UpdatedDate = cu.UpdatedDate,
                                                 DiscountType = cu.DiscountType,
                                                 DiscountValue = cu.DiscountValue,
                                                 Vat = cu.Vat,
                                                 Amount = cu.Amount + (listVendorOrder.Where(x => x.OrderActionId == orderAction.OrderId).Sum(x => x.TongTienHoaHong) ?? 0),
                                                 OrderActionId = orderAction.OrderId,
                                                 OrderTypeName = listOrderType.FirstOrDefault(y => y.Value == cu.OrderType).Name,
                                                 ProductCategoryName = cs.ProductCategoryName,
                                                 ServicePacketId = cu.ServicePacketId
                                             }).ToList();

                 


                if (listCustomerOrder != null && listCustomerOrder.Count > 0)
                {
                    var listOrderId = listCustomerOrder.Select(x => x.OrderId).ToList();
               
                    var listServicePacket = (from s in context.ServicePacket
                                             join p in context.ProductCategory
                                             on s.ProductCategoryId equals p.ProductCategoryId
                                             into spJoined
                                             from sp in spJoined.DefaultIfEmpty()
                                             select new ServicePacketEntityModel
                                             {
                                                 Id = s.Id,
                                                 Name = s.Name,
                                                 ProductCategoryName = sp.ProductCategoryName
                                             }).ToList();

                    foreach (var item in listServicePacket)
                    {
                        var revenueStatisticServicePacketModel = new RevenueStatisticServicePacketModel();
                        var listAmountByDate = new List<decimal?>();
                        foreach (var date in dates)
                        {
                            listAmountByDate.Add(listCustomerOrder.Where(x => x.ServicePacketId == item.Id && ((DateTime)(x.UpdatedDate)).Date == date.Date && ((DateTime)(x.UpdatedDate)).Year == date.Year).Sum(x => x.Amount));
                        }
                        revenueStatisticServicePacketModel.ListAmount = listAmountByDate;
                        revenueStatisticServicePacketModel.ProductCategoryName = item.ProductCategoryName;
                        revenueStatisticServicePacketModel.ServicePacketName = item.Name;
                        listRevenueStatisticServicePacketModelByServicePacket.Add(revenueStatisticServicePacketModel);
                    }

                    var listCustomerOrderGroup = listCustomerOrder.GroupBy(x => x.ProductCategoryName);
                    foreach (var item in listCustomerOrderGroup)
                    {
                        var revenueStatisticServicePacketModel = new RevenueStatisticServicePacketModel();
                        var listAmountByDate = new List<decimal?>();
                        foreach (var date in dates)
                        {
                            listAmountByDate.Add(listCustomerOrder.Where(x => x.ProductCategoryName == item.Key && ((DateTime)(x.UpdatedDate)).Date == date.Date && ((DateTime)(x.UpdatedDate)).Year == date.Year).Sum(x => x.Amount));
                        }
                        revenueStatisticServicePacketModel.ListAmount = listAmountByDate;
                        revenueStatisticServicePacketModel.ProductCategoryName = item.Key;
                        listRevenueStatisticServicePacketModel.Add(revenueStatisticServicePacketModel);
                    }

                }
                return new TakeRevenueStatisticServicePacketDashboardResult
                {
                    ListRevenueStatisticServicePacketModel = listRevenueStatisticServicePacketModel.OrderByDescending(x => x.ListAmount.Sum()).Take((parameter.Count == null || (int)parameter.Count == 0) ? 100000 : (int)parameter.Count).ToList(),
                    ListRevenueStatisticServicePacketModelByServicePacket = listRevenueStatisticServicePacketModelByServicePacket,
                    SoDichVuDaThucHien = soDichVuDaThucHien,
                    SoLanXacNhan = soLanXacNhan,
                    SoLanTuChoi = soLanTuChoi,
                    SoChoXacNhan = soChoXacNhan,
                    StatusCode = HttpStatusCode.OK,
                    Message = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeRevenueStatisticServicePacketDashboardResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }


        public BaoCaoNhaCungCapResult BaoCaoNhaCungCap(BaoCaoNhaCungCapParameter parameter)
        {
            try
            {
                var listRevenueStatisticServicePacketModel = new List<RevenueStatisticServicePacketModel>();
                var listRevenueStatisticServicePacketModelByServicePacket = new List<RevenueStatisticServicePacketModel>();

                int? soLanXacNhan = 0;
                int? soLanTuChoi = 0;
                int? soChoXacNhan = 0;
                var soDichVuDaThucHien = new List<ThongKeSoLuongDichVuNccThucHienModel>();

                var user = (from u in context.User

                            join v in context.Vendor on u.EmployeeId equals v.VendorId
                            into vData
                            from v in vData.DefaultIfEmpty()

                            where u.UserId == parameter.UserId
                            select new
                            {
                                ObjectId =  v.VendorId,
                                NguoiThucHienType =  1 ,
                            }).FirstOrDefault();

                if(user == null)
                {
                    return new BaoCaoNhaCungCapResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        Message = "Không tìm thấy nhà cung cấp trên hệ thống!"
                    };
                }


                var dates = new List<DateTime>();
                for (var dt = (DateTime)parameter.StartDate; dt <= ((DateTime)(parameter.EndDate)); dt = dt.AddDays(1))
                {
                    dates.Add(dt.Date);
                }

                var tienUyNhiemChi = (from bpim in context.BankPayableInvoiceMapping
                                           join bpi in context.BankPayableInvoice on bpim.BankPayableInvoiceId equals bpi.BankPayableInvoiceId
                                           where bpim.ObjectId == user.ObjectId &&
                                                 parameter.StartDate.Value.Date <= bpi.CreatedDate.Date &&
                                                 bpi.CreatedDate.Date <= parameter.EndDate.Value.Date

                                           select new
                                           {
                                               CreatedDate = bpi.CreatedDate,
                                               Amount = bpi.BankPayableInvoiceAmount,
                                           }).Sum(x => x.Amount);

                var tienPhieuChi = (from bpim in context.PayableInvoiceMapping
                                           join bpi in context.PayableInvoice on bpim.PayableInvoiceId equals bpi.PayableInvoiceId
                                           where bpim.ObjectId == user.ObjectId &&
                                                 parameter.StartDate.Value.Date <= bpi.CreatedDate.Date &&
                                                 bpi.CreatedDate.Date <= parameter.EndDate.Value.Date
                                           select new
                                           {
                                               CreatedDate = bpi.CreatedDate,
                                               Amount = bpi.Amount,
                                           }).Sum(x => x.Amount);

                var tongThanhToan = tienUyNhiemChi + tienUyNhiemChi;

                //Lấy tổng doanh thu tiền thu KH và tiền Kttn thanh toán



                var listOptionMappingVendor = (from mapp in context.VendorMappingOption.Where(x => x.VendorId == user.ObjectId)
                                                   join o in context.Options on mapp.OptionId equals o.Id
                                                   select new
                                                   {
                                                       OptionId = o.Id,
                                                       Name = o.Name,
                                                   }).GroupBy(x => x.OptionId)
                                                   .Select(x => new
                                                   {
                                                       OptionId = x.Key,
                                                       Name = x.FirstOrDefault().Name
                                                   }).ToList();

                var listTrangThai = new List<int> { 2, 3, 4 };
                var listVendorOrder = (from ov in context.VendorOrder
                                       join dt in context.VendorOrderDetail on ov.VendorOrderId equals dt.VendorOrderId
                                       join o in context.Options on dt.OptionId equals o.Id
                                       where ov.VendorId == user.ObjectId && listTrangThai.Contains(ov.StatusId)
                                       select new
                                       {
                                           OptionId = o.Id,
                                           OptionName = o.Name,
                                           VendorOrderType = ov.VendorOrderType,
                                           TongTienDonHang = ov.TongTienDonHang,
                                           TienThuKH = dt.TongTienKhachHangThanhToan,
                                           CreatedDate = ov.CreatedDate,
                                       }).ToList();

                var tienThuKH = listVendorOrder.Where(x => x.VendorOrderType == 2).Sum(x => x.TienThuKH);
                var tienThuNcc = listVendorOrder.Where(x => x.VendorOrderType == 1).Sum(x => x.TongTienDonHang);
                var tongDoanhThu = tienThuKH + tienThuNcc;

                var tongChoThanhToan = tongDoanhThu - tongThanhToan;


                foreach (var item in listOptionMappingVendor)
                    {
                        var revenueStatisticServicePacketModel = new RevenueStatisticServicePacketModel();
                        var listAmountByDate = new List<decimal?>();
                        foreach (var date in dates)
                        {

                            var amountThuTienKh = listVendorOrder.Where(x => x.VendorOrderType == 2 && x.OptionId == item.OptionId && ((DateTime)(x.CreatedDate)).Date == date.Date && ((DateTime)(x.CreatedDate)).Year == date.Year).Sum(x => x.TienThuKH ?? 0);
                            var amountThuTienKttn = listVendorOrder.Where(x => x.VendorOrderType == 1 && x.OptionId == item.OptionId && ((DateTime)(x.CreatedDate)).Date == date.Date && ((DateTime)(x.CreatedDate)).Year == date.Year).Sum(x => x.TongTienDonHang ?? 0);
                            listAmountByDate.Add(amountThuTienKh + amountThuTienKttn);
                        }
                        revenueStatisticServicePacketModel.ListAmount = listAmountByDate;
                        revenueStatisticServicePacketModel.ProductCategoryName = item.Name;
                        revenueStatisticServicePacketModel.ServicePacketName = item.Name;
                        listRevenueStatisticServicePacketModelByServicePacket.Add(revenueStatisticServicePacketModel);
                    }


                var thongKeTrangThaiYeuCau = context.ThongKeTuChoiChapNhanDichVu.Where(x => x.NguoiThucHienType == user.NguoiThucHienType
                                                                                   && x.ObjectId == user.ObjectId).ToList();

                soLanXacNhan = thongKeTrangThaiYeuCau.Count(x => x.StatusId == 2);
                soLanTuChoi = thongKeTrangThaiYeuCau.Count(x => x.StatusId == 3);
                soChoXacNhan = context.CustomerOrderTask.Where(x => x.NguoiThucHienType == user.NguoiThucHienType && x.VendorId == user.ObjectId && x.StatusId == 1).Count();

                soDichVuDaThucHien = (from t in context.CustomerOrderTask
                                      join dt in context.CustomerOrderDetail on t.OrderDetailId equals dt.OrderDetailId
                                      join mapp in context.ServicePacketMappingOptions on dt.OptionId equals mapp.Id
                                      join o in context.Options on mapp.OptionId equals o.Id
                                      join or in context.CustomerOrder.Where(x => x.IsOrderAction == true) on t.OrderActionId equals or.OrderId
                                      where t.NguoiThucHienType == user.NguoiThucHienType && t.VendorId == user.ObjectId
                                      select new
                                      {
                                          DichVu = o.Name,
                                          VendorId = t.VendorId,
                                          OptionId = o.Id,
                                      }).GroupBy(x => x.OptionId)
                                      .Select(x => new ThongKeSoLuongDichVuNccThucHienModel
                                      {
                                          DichVu = x.FirstOrDefault().DichVu,
                                          SoLuong = x.Count()
                                      }).ToList();
                

                return new BaoCaoNhaCungCapResult
                {
                    ListRevenueStatisticServicePacketModel = listRevenueStatisticServicePacketModelByServicePacket,
                    DaThanhToan = tongThanhToan,
                    TongDoanhThu = tongDoanhThu,
                    ChoThanhToan = tongChoThanhToan,
                    SoDichVuDaThucHien = soDichVuDaThucHien,
                    SoLanXacNhan = soLanXacNhan,
                    SoLanTuChoi = soLanTuChoi,
                    SoChoXacNhan = soChoXacNhan,
                    StatusCode = HttpStatusCode.OK,
                    Message = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new BaoCaoNhaCungCapResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }






        public TakeRatingStatistictDashboardResult TakeRatingStatisticDashboard(TakeRevenueStatisticDashboardByFilterParameter parameter)
        {
            try
            {
                var listOrderProcess = (from o in context.OrderProcess
                                        join s in context.ServicePacket on o.ServicePacketId
                                        equals s.Id into sJoined
                                        from s in sJoined.DefaultIfEmpty()
                                        join c in context.ProductCategory on s.ProductCategoryId
                                        equals c.ProductCategoryId into csJoined
                                        from cs in csJoined.DefaultIfEmpty()
                                        where o.RateStar > 0 && o.UpdatedDate >= ((DateTime)(parameter.StartDate)).Date && o.UpdatedDate <= (((DateTime)(parameter.EndDate)).Date.AddDays(1).AddTicks(-1))
                                        select new OrderProcessEntityModel
                                        {
                                            RateStar = o.RateStar,
                                            ServicePacketId = o.ServicePacketId,
                                            ServicePacketName = s.Name,
                                            ProductCategoryName = cs.ProductCategoryName,
                                            UpdatedDate = o.UpdatedDate
                                        }).ToList();

                if (listOrderProcess != null && listOrderProcess.Count > 0)
                {
                    var dates = new List<DateTime>();
                    for (var dt = (DateTime)parameter.StartDate; dt <= ((DateTime)(parameter.EndDate)); dt = dt.AddDays(1))
                    {
                        dates.Add(dt.Date);
                    }

                    var listServicePacket = (from s in context.ServicePacket
                                             join p in context.ProductCategory
                                             on s.ProductCategoryId equals p.ProductCategoryId
                                             into spJoined
                                             from sp in spJoined.DefaultIfEmpty()
                                             select new ServicePacketEntityModel
                                             {
                                                 Id = s.Id,
                                                 Name = s.Name,
                                                 ProductCategoryName = sp.ProductCategoryName
                                             }).ToList();

                    var listRatingStatisticServicePacketModelByServicePacket = new List<RatingStatisticServicePacketModel>();
                    foreach (var item in listServicePacket)
                    {

                        var ratingStatisticServicePacketModel = new RatingStatisticServicePacketModel();
                        var listRateByDate = new List<int>();
                        foreach (var date in dates)
                        {
                            listRateByDate.Add(listOrderProcess.Where(x => x.ServicePacketId == item.Id && ((DateTime)(x.UpdatedDate)).Date == date.Date && ((DateTime)(x.UpdatedDate)).Year == date.Year).ToList().Count());
                        }
                        ratingStatisticServicePacketModel.ProductCategoryName = item.ProductCategoryName;
                        ratingStatisticServicePacketModel.ServicePacketName = item.Name;
                        ratingStatisticServicePacketModel.ListRate = listRateByDate;
                        listRatingStatisticServicePacketModelByServicePacket.Add(ratingStatisticServicePacketModel);
                    }

                    var listOrderProcessGroup = listOrderProcess.GroupBy(x => x.ProductCategoryName);
                    var listRatingStatisticServicePacketModel = new List<RatingStatisticServicePacketModel>();
                    foreach (var item in listOrderProcessGroup)
                    {
                        var ratingStatisticServicePacketModel = new RatingStatisticServicePacketModel();
                        var listRateByDate = new List<int>();
                        foreach (var date in dates)
                        {
                            listRateByDate.Add(listOrderProcess.Where(x => x.ProductCategoryName == item.Key && ((DateTime)(x.UpdatedDate)).Date == date.Date && ((DateTime)(x.UpdatedDate)).Year == date.Year).ToList().Count());
                        }
                        ratingStatisticServicePacketModel.ProductCategoryName = item.Key;
                        ratingStatisticServicePacketModel.ListRate = listRateByDate;
                        listRatingStatisticServicePacketModel.Add(ratingStatisticServicePacketModel);
                    }

                    var listRatingStatisticStarServicePacketModel = new List<RatingStatisticStarServicePacketModel>();
                    var listOrderProcessGroupByServicePacketId = listOrderProcess.GroupBy(x => x.ServicePacketId);
                    var listOrderProcessGroupByStar = listOrderProcess.GroupBy(x => x.RateStar);
                    foreach (var item in listOrderProcessGroupByServicePacketId)
                    {
                        foreach (var star in listOrderProcessGroupByStar)
                        {
                            var ratingStatisticStarServicePacketModel = new RatingStatisticStarServicePacketModel();
                            ratingStatisticStarServicePacketModel.ServicePacketName = item.FirstOrDefault().ServicePacketName;
                            ratingStatisticStarServicePacketModel.RateStar = (int)star.Key;
                            ratingStatisticStarServicePacketModel.Count = listOrderProcess.Where(x => x.RateStar == star.Key && x.ServicePacketId == item.Key).Count();
                            listRatingStatisticStarServicePacketModel.Add(ratingStatisticStarServicePacketModel);
                        }
                    }
                    return new TakeRatingStatistictDashboardResult
                    {
                        ListRatingStatisticServicePacketModel = listRatingStatisticServicePacketModel.OrderByDescending(x => x.ListRate.Sum()).Take((parameter.Count == null || (int)parameter.Count == 0) ? 100000 : (int)parameter.Count).ToList(),
                        ListRatingStatisticServicePacketModelByServicePacket = listRatingStatisticServicePacketModelByServicePacket,
                        ListRatingStatisticStarServicePacketModel = listRatingStatisticStarServicePacketModel,
                        StatusCode = HttpStatusCode.OK,
                        Message = "Thành công"
                    };
                }
                else
                {
                    return new TakeRatingStatistictDashboardResult
                    {
                        StatusCode = HttpStatusCode.OK,
                        Message = "Thành công"
                    };
                }
            }
            catch (Exception e)
            {
                return new TakeRatingStatistictDashboardResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }

    }
}
