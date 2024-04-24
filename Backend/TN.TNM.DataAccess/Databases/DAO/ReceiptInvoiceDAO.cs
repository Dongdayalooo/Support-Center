using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using AutoMapper;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using SelectPdf;
using TN.TNM.Common;
using TN.TNM.Common.NotificationSetting;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Order;
using TN.TNM.DataAccess.Messages.Parameters.ReceiptInvoice;
using TN.TNM.DataAccess.Messages.Results.ReceiptInvoice;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.Order;
using TN.TNM.DataAccess.Models.ReceiptInvoice;
using TN.TNM.DataAccess.Models.Vendor;
using SystemParameter = TN.TNM.DataAccess.Databases.Entities.SystemParameter;

//using Syncfusion.Pdf;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class ReceiptInvoiceDAO : BaseDAO, IReceiptInvoiceDataAccess
    {
        private IConverter _converter;
        private readonly IMapper _mapper;
        private readonly IHostingEnvironment _hostingEnvironment;
        //private readonly CustomerOrderDAO _customerOrderDAO;

        

        public ReceiptInvoiceDAO(TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace, IConverter converter, IHostingEnvironment hostingEnvironment, IMapper mapper)
        {
            context = _content;
            iAuditTrace = _iAuditTrace;
            iAuditTrace = _iAuditTrace;
            converter = _converter;
            _hostingEnvironment = hostingEnvironment;
            _mapper = mapper;
            //_customerOrderDAO = customerOrderDAO;
        }

        public CreateReceiptInvoiceResult CreateReceiptInvoice(CreateReceiptInvoiceParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    if (parameter.ReceiptInvoice.ExchangeRate <= 0)
                    {
                        return new CreateReceiptInvoiceResult()
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Tỉ giá không được âm hoặc bằng 0"
                        };
                    }

                    if (parameter.ReceiptInvoice.DoiTuong == "THA")
                    {
                        var listOrderId = parameter.ListMapping.Select(x => x.OrderId).ToList();
                        //Kiểm tra trong các đơn hàng chọn thanh toán có đơn nào đã có báo có hay chưa
                        var checkExist = (from map in context.PhieuThuBaoCoMappingCustomerOrder
                                          join order in context.CustomerOrder on map.OrderId equals order.OrderId
                                          where listOrderId.Contains(map.OrderId.Value)
                                          select order.OrderCode).ToList();

                        if (checkExist.Count() != 0)
                        {
                            return new CreateReceiptInvoiceResult()
                            {
                                StatusCode = HttpStatusCode.ExpectationFailed,
                                MessageCode = "Đơn hàng có mã " + string.Join(", ", checkExist) + "đã được gán trong phiếu báo có!"
                            };
                        }
                    }

                    var newReceiptInvoice = parameter.ReceiptInvoice;
                    var newReceiptInvoiceMapping = parameter.ReceiptInvoiceMapping;
                    var organizationCode = context.Organization .FirstOrDefault(o => o.OrganizationId == parameter.ReceiptInvoice.OrganizationId)?.OrganizationCode;
                    newReceiptInvoice.ReceiptInvoiceId = Guid.NewGuid();
                    newReceiptInvoice.CreatedById = parameter.UserId;
                    newReceiptInvoice.CreatedDate = DateTime.Now;

                    newReceiptInvoice.ReceiptInvoiceCode = "PT" + "-" + organizationCode + DateTime.Now.Year
                        + (context.ReceiptInvoice.Count(r => r.CreatedDate.Year == DateTime.Now.Year) + 1).ToString("D5");

                    var receiptInvoiceDupblicase = context.ReceiptInvoice.FirstOrDefault(x => x.ReceiptInvoiceCode == newReceiptInvoice.ReceiptInvoiceCode);
                    if (receiptInvoiceDupblicase != null)
                    {
                        return new CreateReceiptInvoiceResult
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Mã phiếu thu đã tồn tại"
                        };
                    }
                    newReceiptInvoiceMapping.ReceiptInvoiceMappingId = Guid.NewGuid();
                    newReceiptInvoiceMapping.ReceiptInvoiceId = parameter.ReceiptInvoice.ReceiptInvoiceId.Value;
                    newReceiptInvoiceMapping.CreatedById = parameter.UserId;
                    newReceiptInvoiceMapping.CreatedDate = DateTime.Now;
                    newReceiptInvoiceMapping.ObjectId = parameter.ReceiptInvoiceMapping.ObjectId;

                    ////cập nhật thành trạng thái đã vào sổ 
                    //var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TCH")?.CategoryTypeId;
                    //var daNhapSo = context.Category.FirstOrDefault(x => x.CategoryTypeId == categoryTypeId && x.CategoryCode == "DSO")?.CategoryId;


                    //Thêm các customerorder/ vendorOrder gán vói phiếu báo cáo
                    var listMapping = new List<PhieuThuBaoCoMappingCustomerOrder>();


                    //Nếu thu tiền KH
                    if (parameter.ReceiptInvoice.DoiTuong == "THA")
                    {
                        var listCusOrderId = parameter.ListMapping.Where(x => x.OrderId != null).Select(x => x.OrderId).ToList();
                        var listCustomerOrder = context.CustomerOrder.Where(x => listCusOrderId.Contains(x.OrderId)).ToList();

                        for (int i = 0; i < parameter.ListMapping.Count(); i++)
                        {
                            var item = parameter.ListMapping[i];
                            var newObj = _mapper.Map<PhieuThuBaoCoMappingCustomerOrder>(item);
                            newObj.Id = Guid.NewGuid();
                            newObj.ObjectId = newReceiptInvoice.ReceiptInvoiceId;
                            newObj.ObjectType = 2; //Phiếu thu
                         
                            var param = new ChangeStatusCustomerOrderParameter();
                            param.OrderId = item.OrderId;
                            param.StatusOrder = 4;//Xác nhận thanh toán
                            var result = AccessHelper.ChangeStatusCustomerOrder(context, param, item.Amount ?? 0);
                            if (result.StatusCode != HttpStatusCode.OK)
                            {
                                transaction.Rollback();
                                return new CreateReceiptInvoiceResult()
                                {
                                    StatusCode = result.StatusCode,
                                    MessageCode = result.MessageCode
                                };
                            }
                            
                            listMapping.Add(newObj);
                        }
                    }
                    //Nếu thu tiền Ncc
                    else if (parameter.ReceiptInvoice.DoiTuong == "TTA")
                    {
                        var listVendorOrderId = parameter.ListMapping.Where(x => x.VendorOrderId != null).Select(x => x.VendorOrderId).ToList();
                        var listVendorOrder = context.VendorOrder.Where(x => listVendorOrderId.Contains(x.VendorOrderId)).ToList();

                        //Phương thức thanh toán
                        var paymentMethodCateTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PaymentMethod").CategoryTypeId;
                        var phuongThucId = context.Category.FirstOrDefault(x => x.CategoryTypeId == paymentMethodCateTypeId && x.CategoryCode == "TM").CategoryId;

                        var listVendorOrderPay = (from ov in context.VendorOrder.Where(x => listVendorOrderId.Contains(x.VendorOrderId))
                                                  join phieuThu in context.PhieuThuBaoCoMappingCustomerOrder.Where(x => listVendorOrderId.Contains(x.VendorOrderId)) on ov.VendorOrderId equals phieuThu.VendorOrderId
                                                  select new
                                                  {
                                                      VendorOrderId = ov.VendorOrderId,
                                                      TongTienHoaHong = ov.TongTienHoaHong,
                                                      DaThanhToan = phieuThu.Amount,
                                                  }).GroupBy(x => x.VendorOrderId)
                                                   .Select(x => new
                                                   {
                                                       VendorOrderId = x.Key,
                                                       TongTienHoaHong = x.FirstOrDefault().TongTienHoaHong,
                                                       TongTienConLai = (x.FirstOrDefault().TongTienHoaHong ?? 0) - (x.Sum(y => y.DaThanhToan) ?? 0),
                                                   }).ToList();


                        for (int i = 0; i < parameter.ListMapping.Count(); i++)
                        {
                            var item = parameter.ListMapping[i];
                            var newObj = _mapper.Map<PhieuThuBaoCoMappingCustomerOrder>(item);
                            newObj.Id = Guid.NewGuid();
                            newObj.ObjectId = newReceiptInvoice.ReceiptInvoiceId;
                            newObj.ObjectType = 2; //Phiếu thu

                            var vendorOrder = listVendorOrder.FirstOrDefault(x => x.VendorOrderId == item.VendorOrderId);
                            if (vendorOrder == null)
                            {
                                return new CreateReceiptInvoiceResult()
                                {
                                    StatusCode = HttpStatusCode.FailedDependency,
                                    MessageCode = "Không tìm thấy đơn hàng trên hệ thống!"
                                };
                            }
                            vendorOrder.PaymentMethodId = phuongThucId;

                            //Kiểm tra đã thanh toán đủ hay chưa
                            var soTienConLai = listVendorOrderPay.FirstOrDefault(x => x.VendorOrderId == item.VendorOrderId)?.TongTienConLai;
                            //Chuyển sang trạng thái đã thanh toán
                            if (item.Amount == soTienConLai)
                            {
                                vendorOrder.StatusId = 4;
                            }
                            //Chuyển sang trạng thái thanh toán 1 phần
                            else
                            {
                                vendorOrder.StatusId = 3;
                            }

                            listMapping.Add(newObj);
                        }
                        context.VendorOrder.UpdateRange(listVendorOrder);
                    }

                    context.ReceiptInvoiceMapping.Add(newReceiptInvoiceMapping.ToEntity());
                    context.ReceiptInvoice.Add(newReceiptInvoice.ToEntity());
                    if(listMapping.Count() > 0) context.PhieuThuBaoCoMappingCustomerOrder.AddRange(listMapping);

                    context.SaveChanges();

                    transaction.Commit();
                    return new CreateReceiptInvoiceResult
                    {
                        ReceiptInvoiceId = newReceiptInvoiceMapping.ReceiptInvoiceId.Value,
                        StatusCode = HttpStatusCode.OK,
                        MessageCode = CommonMessage.ReceiptInvoice.ADD_SUCCESS
                    };
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new CreateReceiptInvoiceResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = e.Message
                    };
                }
            }
        }

        public GetReceiptInvoiceByIdResult GetReceiptInvoiceById(GetReceiptInvoiceByIdParameter parameter)
        {
            try
            {
                var reasonCategoryTypeId =
                    context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "LTH").CategoryTypeId;
                var listAllReason = context.Category.Where(c => c.CategoryTypeId == reasonCategoryTypeId).ToList();

                var statusCateoryTypeId =
                    context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TCH").CategoryTypeId;
                var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusCateoryTypeId).ToList();

                var listAllOrg = context.Organization.ToList();

                var currencyUnitId = context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "DTI").CategoryTypeId;
                var listAllCurrencyUnit = context.Category.Where(x => x.CategoryTypeId == currencyUnitId).ToList();

                var receiptInvoice = context.ReceiptInvoice.FirstOrDefault(c =>
                    parameter.ReceiptInvoiceId == null || parameter.ReceiptInvoiceId == Guid.Empty ||
                    c.ReceiptInvoiceId == parameter.ReceiptInvoiceId);

                var receiptInvoiceMapping = context.ReceiptInvoiceMapping.FirstOrDefault(c =>
                    parameter.ReceiptInvoiceId == null || parameter.ReceiptInvoiceId == Guid.Empty ||
                    c.ReceiptInvoiceId == parameter.ReceiptInvoiceId);

                ReceiptInvoiceEntityModel data = new ReceiptInvoiceEntityModel();
                data.ReceiptInvoiceId = receiptInvoice.ReceiptInvoiceId;
                data.ReceiptInvoiceCode = receiptInvoice.ReceiptInvoiceCode;
                data.ReceiptInvoiceDetail = receiptInvoice.ReceiptInvoiceDetail;
                data.ReceiptInvoiceReason = receiptInvoice.ReceiptInvoiceReason;
                data.ReceiptInvoiceNote = receiptInvoice.ReceiptInvoiceNote;
                data.RegisterType = receiptInvoice.RegisterType;
                data.OrganizationId = receiptInvoice.OrganizationId;
                data.StatusId = receiptInvoice.StatusId;
                data.RecipientName = receiptInvoice.RecipientName;
                data.RecipientAddress = receiptInvoice.RecipientAddress;
                data.UnitPrice = receiptInvoice.UnitPrice;
                data.CurrencyUnit = receiptInvoice.CurrencyUnit;
                data.ExchangeRate = receiptInvoice.ExchangeRate;
                data.Amount = receiptInvoice.Amount;
                data.AmountText = receiptInvoice.AmountText;
                data.Active = receiptInvoice.Active;
                data.CreatedById = receiptInvoice.CreatedById;
                data.CreatedDate = receiptInvoice.CreatedDate;
                data.UpdatedById = receiptInvoice.UpdatedById;
                data.UpdatedDate = receiptInvoice.UpdatedDate;
                data.ObjectId = receiptInvoiceMapping?.ObjectId;
                data.ReceiptDate = receiptInvoice.ReceiptDate;
                data.IsSendMail = receiptInvoice.IsSendMail;
                data.StatusName = listAllStatus.FirstOrDefault(c => c.CategoryId == receiptInvoice.StatusId)?.CategoryName;
                data.StatusCode = listAllStatus.FirstOrDefault(c => c.CategoryId == receiptInvoice.StatusId)?.CategoryCode;
                data.AmountText = MoneyHelper.Convert((decimal)data.Amount);
                data.NameCreateBy = GetCreateByName(receiptInvoice.CreatedById);
                data.NameObjectReceipt = GetObjectName(data.ObjectId);
                if (data.ReceiptInvoiceReason != null && data.ReceiptInvoiceReason != Guid.Empty)
                {
                    data.NameReceiptInvoiceReason = listAllReason.FirstOrDefault(c => c.CategoryId == receiptInvoice.ReceiptInvoiceReason).CategoryName;
                }
                if (data.OrganizationId != null && data.OrganizationId != Guid.Empty)
                {
                    data.OrganizationName = listAllOrg.FirstOrDefault(c => c.OrganizationId == data.OrganizationId).OrganizationName;
                }
                if (data.CurrencyUnit != null && data.CurrencyUnit != Guid.Empty)
                {
                    data.CurrencyUnitName = listAllCurrencyUnit.FirstOrDefault(c => c.CategoryId == data.CurrencyUnit).CategoryName;
                }

                var listMapping = context.PhieuThuBaoCoMappingCustomerOrder.Where(x => x.ObjectId == parameter.ReceiptInvoiceId && x.ObjectType == 2)
                                                                    .Select(item => _mapper.Map<PhieuThuBaoCoMappingCustomerOrderModel>(item)).ToList();

                return new GetReceiptInvoiceByIdResult
                {
                    ListMapping = listMapping,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ReceiptInvoice = data
                };
            }
            catch (Exception e)
            {
                return new GetReceiptInvoiceByIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public SearchReceiptInvoiceResult SearchReceiptInvoice(SearchReceiptInvoiceParameter parameter)
        {
            try
            {
                var reasonCategoryTypeId =
                    context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "LTH").CategoryTypeId;
                var listAllReason = context.Category.Where(c => c.CategoryTypeId == reasonCategoryTypeId).ToList();

                var statusCategoryTypeId =
                    context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "TCH").CategoryTypeId;
                var listAllStatus = context.Category.Where(c => c.CategoryTypeId == statusCategoryTypeId).ToList();

                var receiptInvoiceCode =
                    parameter.ReceiptInvoiceCode == null ? "" : parameter.ReceiptInvoiceCode.Trim();
                var receiptInvoiceReason = parameter.ReceiptInvoiceReason;
                var objectIds = parameter.ObjectReceipt;
                var listIdUser = parameter.CreateById;
                var createdByIds = new List<Guid>();

                if (listIdUser != null)
                {
                    foreach (var item in listIdUser)
                    {
                        var temp = context.User.FirstOrDefault(u => u.EmployeeId == item).UserId;
                        createdByIds.Add(temp);
                    }
                }
                else
                {
                    createdByIds = listIdUser;
                }

                var fromDate = parameter.CreateDateFrom;
                var toDate = parameter.CreateDateTo;
                var statusIds = parameter.Status;

                var lstReceiptMap = context.ReceiptInvoiceMapping.Where(c =>
                    objectIds == null || objectIds.Count == 0 || objectIds.Contains(c.ObjectId)).ToList();
                var lstReceiptMapId = lstReceiptMap.Select(c => c.ReceiptInvoiceId).ToList();

                var lst = context.ReceiptInvoice
                    .Where(x => (receiptInvoiceCode == "" || x.ReceiptInvoiceCode.Contains(receiptInvoiceCode)) &&
                                (receiptInvoiceReason == null || receiptInvoiceReason.Count == 0 ||
                                 receiptInvoiceReason.Contains(x.ReceiptInvoiceReason.Value)) &&
                                (lstReceiptMapId.Contains(x.ReceiptInvoiceId)) &&
                                (createdByIds == null || createdByIds.Count == 0 ||
                                 createdByIds.Contains(x.CreatedById)) &&
                                (fromDate == null || fromDate == DateTime.MinValue || fromDate <= x.CreatedDate) &&
                                (toDate == null || toDate == DateTime.MinValue || toDate >= x.CreatedDate) &&
                                (statusIds == null || statusIds.Count == 0 || statusIds.Contains(x.StatusId)))
                    .Select(m => new ReceiptInvoiceEntityModel
                    {
                        ReceiptInvoiceId = m.ReceiptInvoiceId,
                        ReceiptInvoiceCode = m.ReceiptInvoiceCode,
                        ReceiptInvoiceDetail = m.ReceiptInvoiceDetail,
                        ReceiptInvoiceReason = m.ReceiptInvoiceReason,
                        ReceiptInvoiceNote = m.ReceiptInvoiceNote,
                        RegisterType = m.RegisterType,
                        OrganizationId = m.OrganizationId,
                        StatusId = m.StatusId,
                        RecipientName = m.RecipientName,
                        RecipientAddress = m.RecipientAddress,
                        UnitPrice = m.UnitPrice,
                        CurrencyUnit = m.CurrencyUnit,
                        ExchangeRate = m.ExchangeRate,
                        Amount = m.Amount,
                        AmountText = m.AmountText,
                        Active = m.Active,
                        CreatedById = m.CreatedById,
                        CreatedDate = m.CreatedDate,
                        UpdatedById = m.UpdatedById,
                        UpdatedDate = m.UpdatedDate,
                        NameReceiptInvoiceReason = listAllReason
                            .FirstOrDefault(s => s.CategoryId == m.ReceiptInvoiceReason).CategoryName,
                        ReceiptDate = m.ReceiptDate,
                        StatusName = listAllStatus.FirstOrDefault(c => c.CategoryId == m.StatusId).CategoryName,
                    }).ToList();

                lst.ForEach(item =>
                {
                    var temp = lstReceiptMap.FirstOrDefault(c => c.ReceiptInvoiceId == item.ReceiptInvoiceId);
                    if (temp != null)
                    {
                        item.ObjectId = temp.ObjectId;
                        item.NameObjectReceipt = GetObjectName(temp.ObjectId);
                    }
                    item.NameCreateBy = GetCreateByName(item.CreatedById);
                    if (item.StatusId != null && item.StatusId != Guid.Empty)
                    {
                        var status = listAllStatus.FirstOrDefault(c => c.CategoryId == item.StatusId);
                        switch (status.CategoryCode)
                        {
                            case "CSO":
                                item.BackgroundColorForStatus = "#ffcc00";
                                break;
                            case "DSO":
                                item.BackgroundColorForStatus = "#007aff";
                                break;
                        }
                    }
                });

                lst = lst.OrderByDescending(x => x.CreatedDate).ToList();

                return new SearchReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    lstReceiptInvoiceEntity = lst
                };
            }
            catch (Exception ex)
            {
                return new SearchReceiptInvoiceResult
                {
                    MessageCode = ex.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public SearchCashBookReceiptInvoiceResult SearchCashBookReceiptInvoice(SearchCashBookReceiptInvoiceParameter parameter)
        {
            try
            {
                var reasonCategoryTypeId =
                    context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "LTH").CategoryTypeId;
                var listAllReason = context.Category.Where(c => c.CategoryTypeId == reasonCategoryTypeId);

                var listIdUser = parameter.CreateById;
                var createdByIds = new List<Guid>();

                if (listIdUser != null)
                {
                    foreach (var item in listIdUser)
                    {
                        var temp = context.User.FirstOrDefault(u => u.EmployeeId == item).UserId;
                        createdByIds.Add(temp);
                    }
                }
                else
                {
                    createdByIds = listIdUser;
                }
                var fromDate = parameter.ReceiptDateFrom;
                var toDate = parameter.ReceiptDateTo;
                var organizations = parameter.OrganizationList;
                var receiptInvoiceList = context.ReceiptInvoice
                    .Where(c =>
                        (createdByIds == null || createdByIds.Count == 0 || createdByIds.Contains(c.CreatedById)) &&
                        (organizations == null || organizations.Count == 0 ||
                         organizations.Contains(c.OrganizationId)) &&
                        (fromDate == null || fromDate == DateTime.MinValue || fromDate <= c.CreatedDate) &&
                        (toDate == null || toDate == DateTime.MinValue || toDate >= c.CreatedDate))
                    .Select(v => new ReceiptInvoiceEntityModel
                    {
                        Active = v.Active,
                        Amount = v.Amount,
                        CreatedById = v.CreatedById,
                        CreatedDate = v.CreatedDate,
                        CurrencyUnit = v.CurrencyUnit,
                        ExchangeRate = v.ExchangeRate,
                        OrganizationId = v.OrganizationId,
                        ReceiptInvoiceCode = v.ReceiptInvoiceCode,
                        ReceiptInvoiceDetail = v.ReceiptInvoiceDetail,
                        ReceiptInvoiceId = v.ReceiptInvoiceId,
                        ReceiptInvoiceNote = v.ReceiptInvoiceNote ?? "",
                        ReceiptInvoiceReason = v.ReceiptInvoiceReason,
                        ReceiptDate = v.ReceiptDate,
                        RecipientAddress = v.RecipientAddress ?? "",
                        RecipientName = v.RecipientName ?? "",
                        RegisterType = v.RegisterType,
                        StatusId = v.StatusId,
                        UnitPrice = v.UnitPrice,
                        UpdatedById = v.UpdatedById,
                        UpdatedDate = v.UpdatedDate,
                        NameReceiptInvoiceReason =
                            listAllReason.FirstOrDefault(c => c.CategoryId == v.ReceiptInvoiceReason).CategoryName ?? ""
                    }).ToList();

                receiptInvoiceList.ForEach(item =>
                {
                    item.NameCreateBy = GetCreateByName(item.CreatedById);
                });

                receiptInvoiceList.OrderByDescending(c => c.CreatedDate).ToList();

                return new SearchCashBookReceiptInvoiceResult
                {
                    MessageCode = "Success!",
                    StatusCode = HttpStatusCode.OK,
                    lstReceiptInvoiceEntity = receiptInvoiceList,
                };
            }
            catch (Exception ex)
            {
                return new SearchCashBookReceiptInvoiceResult
                {
                    MessageCode = ex.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public SearchBankReceiptInvoiceResult SearchBankReceiptInvoice(SearchBankReceiptInvoiceParameter parameter)
        {
            try
            {
                var reasonCategoryTypeId =
                    context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "LTH").CategoryTypeId;
                var listAllReason = context.Category.Where(c => c.CategoryTypeId == reasonCategoryTypeId);

                var statusCateoryTypeId =
                    context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TCH").CategoryTypeId;
                var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusCateoryTypeId).ToList();

                var bankReceiptInvoice = parameter.ReceiptInvoiceCode == null ? "" : parameter.ReceiptInvoiceCode;
                var bankReceiptInvoiceReasonIds = parameter.ReceiptReasonIdList;
                var objectIds = parameter.ObjectIdList;
                var listIdUser = parameter.CreatedByIdList;
                var createdByIds = new List<Guid>();

                if (listIdUser != null)
                {
                    foreach (var item in listIdUser)
                    {
                        var temp = context.User.FirstOrDefault(u => u.EmployeeId == item).UserId;
                        createdByIds.Add(temp);
                    }
                }
                else
                {
                    createdByIds = listIdUser;
                }

                var fromDate = parameter.FromDate;
                var toDate = parameter.ToDate;
                var statusIds = parameter.SttList;
                var lstBankReceiptMap = context.BankReceiptInvoiceMapping
                    .Where(c => objectIds == null || objectIds.Count == 0 || objectIds.Contains(c.ObjectId.Value)).ToList();
                var lstBankReceiptMapId = lstBankReceiptMap.Select(c => c.BankReceiptInvoiceId).ToList();

                var lst = context.BankReceiptInvoice
                    .Where(x => (bankReceiptInvoice == "" || x.BankReceiptInvoiceCode.Contains(bankReceiptInvoice)) &&
                                (bankReceiptInvoiceReasonIds == null || bankReceiptInvoiceReasonIds.Count == 0 ||
                                 bankReceiptInvoiceReasonIds.Contains(x.BankReceiptInvoiceReason.Value)) &&
                                (lstBankReceiptMapId.Contains(x.BankReceiptInvoiceId)) &&
                                (createdByIds == null || createdByIds.Count == 0 ||
                                 createdByIds.Contains(x.CreatedById)) &&
                                (fromDate == null || fromDate == DateTime.MinValue || fromDate <= x.CreatedDate) &&
                                (toDate == null || toDate == DateTime.MinValue || toDate >= x.CreatedDate) &&
                                (statusIds == null || statusIds.Count == 0 || statusIds.Contains(x.StatusId.Value)))
                    .Select(m => new BankReceiptInvoiceEntityModel
                    {
                        BankReceiptInvoiceId = m.BankReceiptInvoiceId,
                        BankReceiptInvoiceCode = m.BankReceiptInvoiceCode,
                        BankReceiptInvoiceDetail = m.BankReceiptInvoiceDetail,
                        BankReceiptInvoicePrice = m.BankReceiptInvoicePrice,
                        BankReceiptInvoicePriceCurrency = m.BankReceiptInvoicePriceCurrency,
                        BankReceiptInvoiceExchangeRate = m.BankReceiptInvoiceExchangeRate,
                        BankReceiptInvoiceReason = m.BankReceiptInvoiceReason,
                        BankReceiptInvoiceNote = m.BankReceiptInvoiceNote,
                        BankReceiptInvoiceBankAccountId = m.BankReceiptInvoiceBankAccountId,
                        BankReceiptInvoiceAmount = m.BankReceiptInvoiceAmount,
                        BankReceiptInvoiceAmountText = m.BankReceiptInvoiceAmountText,
                        BankReceiptInvoicePaidDate = m.BankReceiptInvoicePaidDate,
                        OrganizationId = m.OrganizationId,
                        StatusId = m.StatusId,
                        Active = m.Active,
                        CreatedById = m.CreatedById,
                        CreatedDate = m.CreatedDate,
                        UpdatedById = m.UpdatedById,
                        UpdatedDate = m.UpdatedDate,
                        BankReceiptInvoiceReasonText = listAllReason
                            .FirstOrDefault(c => c.CategoryId == m.BankReceiptInvoiceReason).CategoryName,
                        StatusName = listAllStatus.FirstOrDefault(c => c.CategoryId == m.StatusId).CategoryName,
                    }).ToList();

                lst.ForEach(item =>
                {
                    var tmp = lstBankReceiptMap.FirstOrDefault(c => c.BankReceiptInvoiceId == item.BankReceiptInvoiceId);
                    if (tmp != null)
                    {
                        item.ObjectId = tmp.ObjectId;
                        item.ObjectName = GetObjectName(item.ObjectId);
                    }
                    item.CreatedByName = GetCreateByName(item.CreatedById);
                    if (item.StatusId != null && item.StatusId != Guid.Empty)
                    {
                        var status = listAllStatus.FirstOrDefault(c => c.CategoryId == item.StatusId);
                        switch (status.CategoryCode)
                        {
                            case "CSO":
                                item.BackgroundColorForStatus = "#ffcc00";
                                break;
                            case "DSO":
                                item.BackgroundColorForStatus = "#007aff";
                                break;
                        }
                    }
                });

                lst = lst.OrderByDescending(x => x.CreatedDate).ToList();

                return new SearchBankReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    BankReceiptInvoiceList = lst
                };
            }
            catch (Exception ex)
            {
                return new SearchBankReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }
        public CreateBankReceiptInvoiceResult CreateBankReceiptInvoice(CreateBankReceiptInvoiceParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    if (parameter.BankReceiptInvoice.BankReceiptInvoiceExchangeRate <= 0)
                    {
                        return new CreateBankReceiptInvoiceResult()
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Tỉ giá không được âm hoặc bằng 0"
                        };
                    }

                    if (parameter.BankReceiptInvoice.DoiTuong == "THA")
                    {
                        var listOrderId = parameter.ListMapping.Select(x => x.OrderId).ToList();
                        //Kiểm tra trong các đơn hàng chọn thanh toán có đơn nào đã có báo có hay chưa
                        var checkExist = (from map in context.PhieuThuBaoCoMappingCustomerOrder
                                          join order in context.CustomerOrder on map.OrderId equals order.OrderId
                                          where listOrderId.Contains(map.OrderId.Value)
                                          select order.OrderCode).ToList();

                        if (checkExist.Count() != 0)
                        {
                            return new CreateBankReceiptInvoiceResult()
                            {
                                StatusCode = HttpStatusCode.ExpectationFailed,
                                MessageCode = "Đơn hàng có mã " + string.Join(", ", checkExist) + "đã được gán trong phiếu báo có!"
                            };
                        }
                    }
                   

                    var newBankReceiptInvoiceId = Guid.NewGuid();
                    parameter.BankReceiptInvoice.BankReceiptInvoiceId = newBankReceiptInvoiceId;
                    parameter.BankReceiptInvoice.CreatedDate = DateTime.Now;
                    parameter.BankReceiptInvoice.CreatedById = parameter.UserId;
                    parameter.BankReceiptInvoice.BankReceiptInvoiceCode =
                        "BC" + "-" + "KTTN" + DateTime.Now.Year +
                        (context.BankReceiptInvoice.Count(b => b.CreatedDate.Year == DateTime.Now.Year) + 1).ToString("D5");
                    var bankReceiptInvoiceDupblicase = context.BankReceiptInvoice.FirstOrDefault(x =>
                        x.BankReceiptInvoiceCode == parameter.BankReceiptInvoice.BankReceiptInvoiceCode);

                    if (bankReceiptInvoiceDupblicase != null)
                    {
                        return new CreateBankReceiptInvoiceResult
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Mã báo có đã tồn tại"
                        };
                    }

                    var newBankReceiptInvoiceMapping = parameter.BankReceiptInvoiceMapping;
                    newBankReceiptInvoiceMapping.BankReceiptInvoiceMappingId = Guid.NewGuid();
                    newBankReceiptInvoiceMapping.CreatedById = parameter.UserId;
                    newBankReceiptInvoiceMapping.CreatedDate = DateTime.Now;
                    newBankReceiptInvoiceMapping.BankReceiptInvoiceId = newBankReceiptInvoiceId;
                    newBankReceiptInvoiceMapping.ObjectId = parameter.BankReceiptInvoiceMapping.ObjectId;
                    newBankReceiptInvoiceMapping.ReferenceType = 3; //Khách hàng

                    //cập nhật thành trạng thái đã vào sổ 
                    //var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TCH")?.CategoryTypeId;
                    //var daNhapSo = context.Category.FirstOrDefault(x => x.CategoryTypeId == categoryTypeId && x.CategoryCode == "DSO")?.CategoryId;

             

                    //Thêm các customerorder/ vendorOrder gán vói phiếu báo cáo
                    var listMapping = new List<PhieuThuBaoCoMappingCustomerOrder>();


                    //Nếu thu tiền KH
                    if (parameter.BankReceiptInvoice.DoiTuong == "THA")
                    {
                        var listCusOrderId = parameter.ListMapping.Where(x => x.OrderId != null).Select(x => x.OrderId).ToList();
                        var listCustomerOrder = context.CustomerOrder.Where(x => listCusOrderId.Contains(x.OrderId)).ToList();

                        for (int i = 0; i < parameter.ListMapping.Count(); i++)
                        {
                            var item = parameter.ListMapping[i];
                            var newObj = _mapper.Map<PhieuThuBaoCoMappingCustomerOrder>(item);
                            newObj.Id = Guid.NewGuid();
                            newObj.ObjectId = newBankReceiptInvoiceId;
                            newObj.ObjectType = 1;//Báo có

                            //Nếu thu tiền KH => chuyển trạng thái đã thanh toán
                            if (parameter.BankReceiptInvoice.DoiTuong == "THA")
                            {
                                var param = new ChangeStatusCustomerOrderParameter();
                                param.OrderId = item.OrderId;
                                param.StatusOrder = 4;//Xác nhận thanh toán
                                var result = AccessHelper.ChangeStatusCustomerOrder(context, param, item.Amount ?? 0);
                                if (result.StatusCode != HttpStatusCode.OK)
                                {
                                    transaction.Rollback();
                                    return new CreateBankReceiptInvoiceResult()
                                    {
                                        StatusCode = result.StatusCode,
                                        MessageCode = result.MessageCode
                                    };
                                }
                            }
                            listMapping.Add(newObj);
                        }
                    }
                    //Nếu thu tiền Ncc
                    else if(parameter.BankReceiptInvoice.DoiTuong == "TTA")
                    {

                        //Phương thức thanh toán
                        var paymentMethodCateTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PaymentMethod").CategoryTypeId;
                        var phuongThucId = context.Category.FirstOrDefault(x => x.CategoryTypeId == paymentMethodCateTypeId && x.CategoryCode == "CK").CategoryId;

                        var listVendorOrderId = parameter.ListMapping.Where(x => x.VendorOrderId != null).Select(x => x.VendorOrderId).ToList();
                        var listVendorOrder = context.VendorOrder.Where(x => listVendorOrderId.Contains(x.VendorOrderId)).ToList();

                        var listVendorOrderPay = (from ov in context.VendorOrder.Where(x => listVendorOrderId.Contains(x.VendorOrderId))
                                           join phieuThu in context.PhieuThuBaoCoMappingCustomerOrder.Where(x => listVendorOrderId.Contains(x.VendorOrderId)) on ov.VendorOrderId equals phieuThu.VendorOrderId
                                           select new
                                           {
                                               VendorOrderId = ov.VendorOrderId,
                                               TongTienHoaHong = ov.TongTienHoaHong,
                                               DaThanhToan = phieuThu.Amount,
                                           }).GroupBy(x => x.VendorOrderId)
                                           .Select(x => new
                                           {
                                               VendorOrderId = x.Key,
                                               TongTienHoaHong = x.FirstOrDefault().TongTienHoaHong,
                                               TongTienConLai = (x.FirstOrDefault().TongTienHoaHong ?? 0) - ( x.Sum(y => y.DaThanhToan)  ?? 0),
                                           }).ToList();

                
                        for (int i = 0; i < parameter.ListMapping.Count(); i++)
                        {
                            var item = parameter.ListMapping[i];
                            var newObj = _mapper.Map<PhieuThuBaoCoMappingCustomerOrder>(item);
                            newObj.Id = Guid.NewGuid();
                            newObj.ObjectId = newBankReceiptInvoiceId;
                            newObj.ObjectType = 1;//Báo có

                            var vendorOrder = listVendorOrder.FirstOrDefault(x => x.VendorOrderId == item.VendorOrderId);
                            if(vendorOrder == null)
                            {
                                return new CreateBankReceiptInvoiceResult()
                                {
                                    StatusCode = HttpStatusCode.FailedDependency,
                                    MessageCode = "Không tìm thấy đơn hàng trên hệ thống!"
                                };
                            }
                            vendorOrder.PaymentMethodId = phuongThucId;

                            //Kiểm tra đã thanh toán đủ hay chưa
                            var soTienConLai = listVendorOrderPay.FirstOrDefault(x => x.VendorOrderId == item.VendorOrderId)?.TongTienConLai;
                            //Chuyển sang trạng thái đã thanh toán
                            if (item.Amount == soTienConLai)
                            {
                                vendorOrder.StatusId = 4;
                            }
                            //Chuyển sang trạng thái thanh toán 1 phần
                            else
                            {
                                vendorOrder.StatusId = 3;
                            }

                            listMapping.Add(newObj);
                        }
                        context.VendorOrder.UpdateRange(listVendorOrder);
                    }

                    context.BankReceiptInvoice.Add(parameter.BankReceiptInvoice.ToEntity());
                    context.BankReceiptInvoiceMapping.Add(newBankReceiptInvoiceMapping.ToEntity());
                    if (listMapping.Count() > 0) context.PhieuThuBaoCoMappingCustomerOrder.AddRange(listMapping);
                    context.SaveChanges();

                    transaction.Commit();
                    return new CreateBankReceiptInvoiceResult()
                    {
                        BankReceiptInvoiceId = parameter.BankReceiptInvoice.BankReceiptInvoiceId,
                        StatusCode = HttpStatusCode.OK,
                        MessageCode = CommonMessage.BankReceiptInvoice.ADD_SUCCESS
                    };
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new CreateBankReceiptInvoiceResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = e.Message
                    };
                }
            }
        }
    
        public SearchBankBookReceiptResult SearchBankBookReceipt(SearchBankBookReceiptParameter parameter)
        {
            try
            {
                var reasonCategoryTypeId =
                    context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "LTH").CategoryTypeId;
                var listAllReason = context.Category.Where(c => c.CategoryTypeId == reasonCategoryTypeId);

                var listIdUser = parameter.ListCreateById;
                var createdByIds = new List<Guid>();

                if (listIdUser != null)
                {
                    foreach (var item in listIdUser)
                    {
                        var temp = context.User.FirstOrDefault(u => u.EmployeeId == item).UserId;
                        createdByIds.Add(temp);
                    }
                }
                else
                {
                    createdByIds = listIdUser;
                }

                var fromDate = parameter.FromPaidDate;
                var toDate = parameter.ToPaidDate;

                var lst = context.BankReceiptInvoice.Join(context.BankReceiptInvoiceMapping,
                        bi => bi.BankReceiptInvoiceId,
                        bm => bm.BankReceiptInvoiceId,
                        (bi, bm) => new {bi, bm})
                    .Where(x => (parameter.BankAccountId == null || parameter.BankAccountId.Count == 0 ||
                                 parameter.BankAccountId.Contains(x.bi.BankReceiptInvoiceBankAccountId.Value)) &&
                                (createdByIds == null || createdByIds.Count == 0 ||
                                 createdByIds.Contains(x.bi.CreatedById)) &&
                                (fromDate == null || fromDate == DateTime.MinValue || fromDate <= x.bi.CreatedDate) &&
                                (toDate == null || toDate == DateTime.MinValue || toDate >= x.bi.CreatedDate))
                    .Select(m => new BankReceiptInvoiceEntityModel
                    {
                        BankReceiptInvoiceId = m.bi.BankReceiptInvoiceId,
                        BankReceiptInvoiceCode = m.bi.BankReceiptInvoiceCode,
                        BankReceiptInvoiceDetail = m.bi.BankReceiptInvoiceDetail,
                        BankReceiptInvoicePrice = m.bi.BankReceiptInvoicePrice,
                        BankReceiptInvoicePriceCurrency = m.bi.BankReceiptInvoicePriceCurrency,
                        BankReceiptInvoiceExchangeRate = m.bi.BankReceiptInvoiceExchangeRate,
                        BankReceiptInvoiceReason = m.bi.BankReceiptInvoiceReason,
                        BankReceiptInvoiceNote = m.bi.BankReceiptInvoiceNote,
                        BankReceiptInvoiceBankAccountId = m.bi.BankReceiptInvoiceBankAccountId,
                        BankReceiptInvoiceAmount = m.bi.BankReceiptInvoiceAmount,
                        BankReceiptInvoiceAmountText = m.bi.BankReceiptInvoiceAmountText,
                        BankReceiptInvoicePaidDate = m.bi.BankReceiptInvoicePaidDate,
                        OrganizationId = m.bi.OrganizationId,
                        StatusId = m.bi.StatusId,
                        Active = m.bi.Active,
                        CreatedById = m.bi.CreatedById,
                        CreatedDate = m.bi.CreatedDate,
                        UpdatedById = m.bi.UpdatedById,
                        UpdatedDate = m.bi.UpdatedDate,
                        BankReceiptInvoiceReasonText =
                            listAllReason.FirstOrDefault(c => c.CategoryId == m.bi.BankReceiptInvoiceReason)
                                .CategoryName ??
                            "",
                        ObjectId = m.bm.ObjectId,
                        StatusName = "",
                        BackgroundColorForStatus = ""
                    }).ToList();

                lst.ForEach(item =>
                {
                    item.ObjectName = GetObjectName(item.ObjectId);
                    item.CreatedByName = GetCreateByName(item.CreatedById);
                    item.BankReceiptInvoiceDetail = item.BankReceiptInvoiceDetail ?? "";
                    item.BankReceiptInvoiceNote = item.BankReceiptInvoiceNote ?? "";
                });

                lst = lst.OrderByDescending(x => x.CreatedDate).ToList();

                return new SearchBankBookReceiptResult()
                {
                    StatusCode = lst.Count > 0 ? HttpStatusCode.OK : HttpStatusCode.ExpectationFailed,
                    MessageCode = lst.Count > 0 ? "" : CommonMessage.BankReceiptInvoice.NO_INVOICE,
                    BankReceiptInvoiceList = lst.OrderByDescending(l => l.CreatedDate).ToList(),
                };
            }
            catch (Exception e)
            {
                return new SearchBankBookReceiptResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetBankReceiptInvoiceByIdResult GetBankReceiptInvoiceById(GetBankReceiptInvoiceByIdParameter parameter)
        {
            try
            {
                var bri = context.BankReceiptInvoice.FirstOrDefault(b =>
                    b.BankReceiptInvoiceId == parameter.BankReceiptInvoiceId);
                var brim = context.BankReceiptInvoiceMapping
                    .FirstOrDefault(b => b.BankReceiptInvoiceId == parameter.BankReceiptInvoiceId).ObjectId;
                var reasontext = context.Category.FirstOrDefault(rt => rt.CategoryId == bri.BankReceiptInvoiceReason);
                var org = context.Organization.FirstOrDefault(o => o.OrganizationId == bri.OrganizationId);
                var status = context.Category.FirstOrDefault(st => st.CategoryId == bri.StatusId);
                var pricecrr = context.Category.FirstOrDefault(pr => pr.CategoryId == bri.BankReceiptInvoicePriceCurrency);
                var empId = context.User.FirstOrDefault(u => u.UserId == bri.CreatedById)?.EmployeeId;
                var createdName = context.Employee.FirstOrDefault(e => e.EmployeeId == empId)?.EmployeeName;
                var objectName = GetObjectName(brim);
                var bankaccount =
                    context.BankAccount.FirstOrDefault(ba => ba.BankAccountId == bri.BankReceiptInvoiceBankAccountId);

                bri.BankReceiptInvoiceAmountText = MoneyHelper.Convert(bri.BankReceiptInvoiceAmount.Value);

                var listMapping = context.PhieuThuBaoCoMappingCustomerOrder.Where(x => x.ObjectId == parameter.BankReceiptInvoiceId && x.ObjectType == 1)
                                                                    .Select(item => _mapper.Map<PhieuThuBaoCoMappingCustomerOrderModel>(item)).ToList();

                var statusCodeBankInvoice = context.Category.FirstOrDefault(x => x.CategoryId == bri.StatusId)?.CategoryCode;
                return new GetBankReceiptInvoiceByIdResult()
                {
                    StatusCodeBankInvoice = statusCodeBankInvoice,
                    BankReceiptInvoice = new BankReceiptInvoiceEntityModel(bri),
                    BankReceiptInvoiceReasonText = reasontext?.CategoryName,
                    BankReceiptTypeText = (bankaccount != null) ? bankaccount.BankName : "",
                    OrganizationText = org?.OrganizationName,
                    StatusText = status?.CategoryName,
                    PriceCurrencyText = pricecrr?.CategoryName,
                    CreateName = string.IsNullOrEmpty(createdName) ? "Hệ thống tạo" : createdName,
                    ObjectName = objectName,
                    ListMapping = listMapping,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new GetBankReceiptInvoiceByIdResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public ExportReceiptinvoiceResult ExportPdfReceiptInvoice(ExportReceiptInvoiceParameter parameter)
        {
            try
            {
                string html = ExportPdf.GetStringHtml("ReceiptInvoiceTemplatePDF.html");
                string css = ExportPdf.GetstrgCss("bootstrap.min.css");
                var company = context.CompanyConfiguration.FirstOrDefault(c => c.CompanyId != null);
                var receiptInvoice =
                    context.ReceiptInvoice.FirstOrDefault(r => r.ReceiptInvoiceId == parameter.ReceiptInvoiceId);

                if (receiptInvoice == null)
                {
                    return new ExportReceiptinvoiceResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Bản ghi không tồn tại trên hệ thống"
                    };
                }

                var reason = context.Category.FirstOrDefault(rs => rs.CategoryId == receiptInvoice.ReceiptInvoiceReason)?.CategoryName;
                html = html.Replace("[CompanyName]", company.CompanyName.ToUpper());
                html = html.Replace("[CompanyAddress]", company.CompanyAddress);
                html = html.Replace("[ReceiptInvCode]", receiptInvoice.ReceiptInvoiceCode);
                html = html.Replace("[Date]", receiptInvoice.CreatedDate.Day.ToString());
                html = html.Replace("[Month]", receiptInvoice.CreatedDate.Month.ToString());
                html = html.Replace("[Year]", receiptInvoice.CreatedDate.Year.ToString());
                html = html.Replace("[RecipientName]", receiptInvoice.RecipientName);
                if (receiptInvoice.RecipientAddress != null)
                    html = html.Replace("[ReceipientAddress]", receiptInvoice.RecipientAddress);
                html = html.Replace("[ReceiptInvReason]", reason);
                html = html.Replace("[ReceiptInvDetail]", receiptInvoice.ReceiptInvoiceDetail);
                decimal price = (decimal)((receiptInvoice.ExchangeRate != null)
                    ? receiptInvoice.ExchangeRate * receiptInvoice.UnitPrice
                    : receiptInvoice.UnitPrice);
                html = html.Replace("[ReceiptInvPrice]", price.ToString("#,#."));
                html = html.Replace("[ReceiptInvPriceText]", MoneyHelper.Convert(price));
                html = html.Replace("[Note]",
                    receiptInvoice.ReceiptInvoiceNote == null ? "" : receiptInvoice.ReceiptInvoiceNote);

                // Export html to Pdf
                string rootFolder = _hostingEnvironment.WebRootPath + "\\ExportedPDF";
                string fileName = @"ExportedReceipt.pdf";
                var receiptInvoicePdf = ExportPdf.HtmlToPdfExport(html, Path.Combine(rootFolder, fileName),
                    PdfPageSize.A5, PdfPageOrientation.Landscape, string.Empty);

                return new ExportReceiptinvoiceResult
                {
                    ReceiptInvoicePdf = receiptInvoicePdf,
                    Code = receiptInvoice.ReceiptInvoiceCode,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success"
                };
            }
            catch (Exception e)
            {
                return new ExportReceiptinvoiceResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public ExportBankReceiptInvoiceResult ExportBankReceiptInvoice(ExportBankReceiptInvoiceParameter parameter)
        {
            string html = ExportPdf.GetStringHtml("BankReceiptInvTemplate.html");
            string css = ExportPdf.GetstrgCss("bootstrap.min.css");
            var company = context.CompanyConfiguration.FirstOrDefault(c => c.CompanyId != null);
            var bankInvoice =
                context.BankReceiptInvoice.FirstOrDefault(r => r.BankReceiptInvoiceId == parameter.BankReceiptInvoiceId);

            if (bankInvoice == null)
            {
                return new ExportBankReceiptInvoiceResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Bản ghi không tồn tại trên hệ thống"
                };
            }

            var reason = context.Category.FirstOrDefault(c => c.CategoryId == bankInvoice.BankReceiptInvoiceReason)
                .CategoryName;
            var status = context.Category.FirstOrDefault(c => c.CategoryId == bankInvoice.StatusId).CategoryName;
            var currency = context.Category
                .FirstOrDefault(c => c.CategoryId == bankInvoice.BankReceiptInvoicePriceCurrency).CategoryName;
            var org = context.Organization.FirstOrDefault(o => o.OrganizationId == bankInvoice.OrganizationId)?.OrganizationName;
            var obj = context.BankReceiptInvoiceMapping.FirstOrDefault(bp =>
                bp.BankReceiptInvoiceId == bankInvoice.BankReceiptInvoiceId);
            var objectId = obj == null ? Guid.Empty : obj.ObjectId;
            var empId = context.User.FirstOrDefault(u => u.UserId == bankInvoice.CreatedById)?.EmployeeId;
            var name = context.Employee.FirstOrDefault(e => e.EmployeeId == empId)?.EmployeeName;
            string objectName = GetObjectNameWithoutCode(objectId);
            html = html.Replace("[CompanyName]", company.CompanyName.ToUpper());
            html = html.Replace("[CompanyAddress]", company.CompanyAddress);
            html = html.Replace("[Code]", bankInvoice.BankReceiptInvoiceCode);
            html = html.Replace("[CreateDateDay]", bankInvoice.CreatedDate.Day.ToString());
            html = html.Replace("[CreateMonth]", bankInvoice.CreatedDate.Month.ToString());
            html = html.Replace("[CreateYear]", bankInvoice.CreatedDate.Year.ToString());
            html = html.Replace("[Content]", bankInvoice.BankReceiptInvoiceDetail);
            html = html.Replace("[Price]", bankInvoice.BankReceiptInvoiceAmount.Value.ToString("#,#."));
            html = html.Replace("[PriceString]", MoneyHelper.Convert(bankInvoice.BankReceiptInvoiceAmount.Value));
            html = html.Replace("[Note]", bankInvoice.BankReceiptInvoiceNote);
            html = html.Replace("[PaidDate]", bankInvoice.BankReceiptInvoicePaidDate.ToString("dd/MM/yyyy"));
            html = html.Replace("[Reason]", reason);
            html = html.Replace("[Object]", objectName);
            html = html.Replace("[Status]", status);
            html = html.Replace("[Organization]", org);
            html = html.Replace("[CurrencyCode]", currency);
            html = html.Replace("[CreatedBy]", name);

            // Export html to Pdf
            string rootFolder = _hostingEnvironment.WebRootPath + "\\ExportedPDF";
            string fileName = @"ExportedBankReceipt.pdf";
            var bankInvoicePdf = ExportPdf.HtmlToPdfExport(html, Path.Combine(rootFolder, fileName), PdfPageSize.A5,
                PdfPageOrientation.Landscape, string.Empty);

            return new ExportBankReceiptInvoiceResult()
            {
                BankReceiptInvoicePdf = bankInvoicePdf,
                Code = bankInvoice.BankReceiptInvoiceCode,
                StatusCode = HttpStatusCode.OK,
                MessageCode = "Success"
            };
        }

        private string GetCreateByName(Guid? createById)
        {
            if (createById != null && createById != Guid.Empty)
            {
                var empId = context.User.FirstOrDefault(u => u.UserId == createById)?.EmployeeId;

                if (empId != null && empId != Guid.Empty)
                {
                    var emp = context.Employee.FirstOrDefault(x => x.EmployeeId == empId);

                    if (emp != null)
                    {
                        return emp.EmployeeCode + " - " + emp.EmployeeName;
                    }
                }
            }
            return "";
        }

        private string GetObjectName(Guid? objId)
        {
            if (objId != null && objId != Guid.Empty)
            {
                var emp = context.Employee.FirstOrDefault(e => e.EmployeeId == objId);
                var cus = context.Customer.FirstOrDefault(cu => cu.CustomerId == objId);
                var con = context.Contact.FirstOrDefault(c => c.ObjectId == objId);
                var ven = context.Vendor.FirstOrDefault(e => e.VendorId == objId);

                if (emp != null && con != null)
                {
                    return con.IdentityId + " - " + emp.EmployeeName;
                }

                if (ven != null)
                {
                    return ven.VendorCode + " - " + ven.VendorName;
                }
                if (cus != null)
                {
                    return cus.CustomerCode + " - " + cus.CustomerName;
                }

                return "";
            }

            return "";
        }

        private string GetObjectNameWithoutCode(Guid? objId)
        {
            if (objId != null && objId != Guid.Empty)
            {
                var emp = context.Employee.FirstOrDefault(e => e.EmployeeId == objId);
                var cus = context.Customer.FirstOrDefault(cu => cu.CustomerId == objId);
                var con = context.Contact.FirstOrDefault(c => c.ObjectId == objId);
                var ven = context.Vendor.FirstOrDefault(e => e.VendorId == objId);

                if (emp != null && con != null)
                {
                    return emp.EmployeeName;
                }

                if (ven != null)
                {
                    return ven.VendorName;
                }
                if (cus != null)
                {
                    return cus.CustomerName;
                }

                return "";
            }

            return "";
        }

        public GetOrderByCustomerIdResult GetOrderByCustomerId(GetOrderByCustomerIdParameter parameter)
        {
            try
            {

                var listOrderType = GeneralList.GetTrangThais("OrderType").ToList();

                //Trạng thái chờ thanh toán
                var choThanhToanStatus = GeneralList.GetTrangThais("CustomerOrder").FirstOrDefault(x => x.Value == 4).Value;

                //Khách hàng mặc định thu đủ

                //Phương thức thanh toán
                var paymentMethodCateTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PaymentMethod").CategoryTypeId;

                var listPaymentMethod = (from c in context.Category.Where(x => x.CategoryTypeId == paymentMethodCateTypeId)
                                         join p in context.PaymentMethodConfigure on c.CategoryId equals p.CategoryId
                                     select new PaymentMethodConfigureEntityModel()
                                     {
                                         Id = p.Id,
                                         CategoryId = p.CategoryId,
                                         CategoryName = c.CategoryName,
                                         CategoryCode = c.CategoryCode,
                                         Content = p.Content,
                                         CreatedById = p.CreatedById,
                                     }).ToList();

                var phuongThucId = Guid.Empty;
                if(parameter.Type == 1) phuongThucId = (Guid)listPaymentMethod.FirstOrDefault(x => x.CategoryCode == "CK").Id;
                if(parameter.Type == 2) phuongThucId = (Guid)listPaymentMethod.FirstOrDefault(x => x.CategoryCode == "TM").Id;
               
                //Lấy đơn hàng đã có phiếu báo có
                var listOrderIdBaoCo = context.PhieuThuBaoCoMappingCustomerOrder.Select(x => x.OrderId).ToList();

                //Lấy danh sách đơn hàng của khách hàng ở trạng thái và chưa gán với phiếu báo có
                var listOrder = (from order in context.CustomerOrder.Where(x => x.StatusOrder == choThanhToanStatus && x.CustomerId == parameter.CustomerId &&
                                                                !listOrderIdBaoCo.Contains(x.OrderId) && x.PaymentMethod == phuongThucId)

                                 join dt in context.CustomerOrderDetail on order.OrderId equals dt.OrderId

                                 join mapping in context.ServicePacketMappingOptions on dt.OptionId equals mapping.Id

                                 join o in context.Options on mapping.OptionId equals o.Id

                                 join type in listOrderType on order.OrderType equals type.Value

                                 join dtExtend in context.CustomerOrderDetailExten on order.OrderId equals dtExtend.OrderId
                                 into dtExtendData
                                 from dtExtend in dtExtendData.DefaultIfEmpty()

                                 select new
                                 {
                                     OrderId = order.OrderId,
                                     OrderCode = order.OrderCode,
                                     StatusOrder = order.StatusOrder,
                                     ListDv = o.Name,
                                     OrderTypeName = type.Name,
                                     Detail = dt,
                                     DetailExtend = dtExtend,
                                     Vat = order.Vat,
                                     Amount = order.Amount,
                                     CreatedDate = order.CreatedDate,
                                 }).GroupBy(x => x.OrderId)
                                .Select(x => new CustomerOrderEntityModel { 
                                
                                    OrderId = x.Key,
                                    OrderCode = x.FirstOrDefault().OrderCode,
                                    ListPacketServiceName = string.Join(", ", x.Select(y => y.ListDv).Distinct().ToList()),
                                    OrderTypeName = x.FirstOrDefault().OrderTypeName,
                                    Amount = x.FirstOrDefault().Amount,
                                    AmountReceivable = x.FirstOrDefault().Amount,
                                    AmountCollected = x.FirstOrDefault().Amount,
                                    CreatedDate = x.FirstOrDefault().CreatedDate,
                                }).ToList();

                return new GetOrderByCustomerIdResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lấy danh sách đơn hàng thành công",
                    ListOrder = listOrder,
                };
            }
            catch (Exception e)
            {
                return new GetOrderByCustomerIdResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetOrderByVendorIdResult GetOrderByVendorId(GetOrderByVendorIdParameter parameter)
        {
            try
            {
                //Phương thức thanh toán
                var paymentMethodCateTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PaymentMethod").CategoryTypeId;

                var listPaymentMethod = (from c in context.Category.Where(x => x.CategoryTypeId == paymentMethodCateTypeId)
                                         select new CategoryEntityModel()
                                         {
                                             CategoryId = c.CategoryId,
                                             CategoryName = c.CategoryName,
                                             CategoryCode = c.CategoryCode,
                                         }).ToList();

                var phuongThucId = Guid.Empty;
                if (parameter.Type == 1) phuongThucId = (Guid)listPaymentMethod.FirstOrDefault(x => x.CategoryCode == "CK").CategoryId;
                if (parameter.Type == 2) phuongThucId = (Guid)listPaymentMethod.FirstOrDefault(x => x.CategoryCode == "TM").CategoryId;

                //Trạng thái chờ thanh toán, thanh toán 1 phần
                var listTrangThaiThuTienId = GeneralList.GetTrangThais("VendorOrder").Where(x => x.Value == 2 || x.Value == 3).Select(x => x.Value).ToList();

                //Lấy danh sách đơn hàng của nhà cung cấp ở trạng thái chờ thanh toán, thanh toán 1 phần
                var listVendorOrder = (from ov in context.VendorOrder.Where(x => listTrangThaiThuTienId.Contains(x.StatusId) 
                                                                                    && x.VendorId == parameter.VendorId &&  x.PaymentMethodId == phuongThucId)

                                       join ovdt in context.VendorOrderDetail on ov.VendorOrderId equals ovdt.VendorOrderId
                                       join o in context.Options on ovdt.OptionId equals o.Id
                                       into oData
                                       from o in oData.DefaultIfEmpty()



                                          join phieuThu in context.PhieuThuBaoCoMappingCustomerOrder on ov.VendorOrderId equals phieuThu.VendorOrderId
                                          into phieuThuData 
                                          from phieuThu in phieuThuData.DefaultIfEmpty()
                                          select new
                                          {
                                              VendorOrderId = ov.VendorOrderId,
                                              TongTienHoaHong = ov.TongTienHoaHong,
                                              VendorOrderCode = ov.VendorOrderCode,
                                              CreatedDate = ov.CreatedDate,
                                              DaThanhToan = phieuThu.Amount,
                                              ListDv = o.Name
                                          }).GroupBy(x => x.VendorOrderId)
                                         .Select(x => new VendorOrderEntityModel
                                         {
                                             VendorOrderId = x.Key,
                                             VendorOrderCode = x.FirstOrDefault().VendorOrderCode,
                                             CreatedDate = x.FirstOrDefault().CreatedDate,
                                             AmountCollected = 0,
                                             OrderTypeName = "Ncc thanh toán",
                                             TongTienHoaHong = (x.FirstOrDefault().TongTienHoaHong ?? 0) - (x.Sum(y => y.DaThanhToan) ?? 0),
                                             ListPacketServiceName = string.Join(", ", x.Select(y => y.ListDv).Distinct().ToList())
                                         }).ToList();

                return new GetOrderByVendorIdResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lấy danh sách đơn hàng thành công",
                    ListOrder = listVendorOrder,
                };
            }
            catch (Exception e)
            {
                return new GetOrderByVendorIdResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }


        private static decimal CalculatorTotalPurchaseProduct(decimal amount, bool discountType, decimal discountValue)
        {
            decimal result = 0;

            if (discountType)
            {
                //Chiết khấu được tính theo %
                result = amount - (amount * discountValue) / 100;
            }
            else
            {
                //Chiết khấu được tính theo tiền mặt
                result = amount - discountValue;
            }

            return result;
        }

        public GetMasterDataSearchBankReceiptInvoiceResult GetMasterDataSearchBankReceiptInvoice(GetMasterDataSearchBankReceiptInvoiceParameter parameter)
        {
            try
            {
                var reasonCategoryTypeId =
                    context.CategoryType.FirstOrDefault(c => c.CategoryTypeCode == "LTH").CategoryTypeId;
                var listAllReason = context.Category.Where(c => c.CategoryTypeId == reasonCategoryTypeId).Select(x => new CategoryEntityModel
                {
                    CategoryId = x.CategoryId,
                    CategoryName = x.CategoryName,
                    CategoryCode = x.CategoryCode,
                }).ToList();

                var statusCateoryTypeId =
                    context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TCH").CategoryTypeId;
                var listAllStatus = context.Category.Where(x => x.CategoryTypeId == statusCateoryTypeId).Select(x => new CategoryEntityModel
                {
                    CategoryId = x.CategoryId,
                    CategoryName = x.CategoryName,
                    CategoryCode = x.CategoryCode,
                }).ToList();

                var listEmpployee = context.Employee.Where(x => x.Active == true).Select(x => new EmployeeEntityModel
                {
                    EmployeeId = x.EmployeeId,
                    EmployeeName = x.EmployeeCode + "-" + x.EmployeeName,
                }).ToList();

                return new GetMasterDataSearchBankReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ReasonOfReceiptList = listAllReason,
                    StatusOfReceiptList = listAllStatus,
                    EmployeeList = listEmpployee
                };
            }
            catch (Exception ex)
            {
                return new GetMasterDataSearchBankReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }

        public GetMasterDataReceiptInvoiceResult GetMasterDataReceiptInvoice(GetMasterDataReceiptInvoiceParameter parameter)
        {
            try
            {
                var listCategoryType = context.CategoryType.ToList();
                var listCategory = context.Category.ToList();
                var _listOrganization = context.Organization.Where(o => o.IsFinancialIndependence.Value).ToList();
                var listOrganization = new List<OrganizationEntityModel>();
                _listOrganization.ForEach(item =>
                {
                    var org = new OrganizationEntityModel(item);
                    listOrganization.Add(org);
                });

                var categoryReasonType = listCategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "LTH");
                var reasonReceiptList = new List<CategoryEntityModel>();

                if (categoryReasonType != null)
                {
                    reasonReceiptList = listCategory
                        .Where(ct => ct.Active == true && ct.CategoryTypeId == categoryReasonType.CategoryTypeId)
                        .Select(c => new CategoryEntityModel()
                        {
                            CategoryTypeId = c.CategoryTypeId,
                            CategoryId = c.CategoryId,
                            CategoryName = c.CategoryName,
                            CategoryCode = c.CategoryCode,
                            IsDefault = c.IsDefauld
                        }).ToList();
                }

                var categoryStatusType = listCategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TCH");
                var statusOfReceiptList = new List<CategoryEntityModel>();
                if (categoryStatusType != null)
                {
                    statusOfReceiptList = listCategory
                        .Where(c => c.Active == true && c.CategoryTypeId == categoryStatusType.CategoryTypeId).Select(
                            c => new CategoryEntityModel()
                            {
                                CategoryTypeId = c.CategoryTypeId,
                                CategoryId = c.CategoryId,
                                CategoryName = c.CategoryName,
                                CategoryCode = c.CategoryCode,
                                IsDefault = c.IsDefauld
                            }).ToList();
                }

                var categoryType = listCategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "LSO");
                var typeOfReceiptList = new List<CategoryEntityModel>();
                if (categoryType != null)
                {
                    typeOfReceiptList = listCategory
                        .Where(c => c.Active == true && c.CategoryTypeId == categoryType.CategoryTypeId).Select(c =>
                            new CategoryEntityModel()
                            {
                                CategoryTypeId = c.CategoryTypeId,
                                CategoryId = c.CategoryId,
                                CategoryName = c.CategoryName,
                                CategoryCode = c.CategoryCode,
                                IsDefault = c.IsDefauld
                            }).ToList();
                }

                var categoryUnitMoneyType = listCategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "DTI");
                var unitMoneyOfReceiptList = new List<CategoryEntityModel>();
                if (categoryStatusType != null)
                {
                    unitMoneyOfReceiptList = listCategory
                        .Where(c => c.Active == true && c.CategoryTypeId == categoryUnitMoneyType.CategoryTypeId)
                        .Select(c => new CategoryEntityModel()
                        {
                            CategoryTypeId = c.CategoryTypeId,
                            CategoryId = c.CategoryId,
                            CategoryName = c.CategoryName,
                            CategoryCode = c.CategoryCode,
                            IsDefault = c.IsDefauld
                        }).ToList();
                }

                var _customerList = context.Customer.Where(c => c.Active == true).OrderBy(x => x.CustomerName).ToList();
                var customerList = new List<CustomerEntityModel>();
                _customerList.ForEach(item =>
                {
                    var cus = new CustomerEntityModel(item);
                    customerList.Add(cus);
                });

                return new GetMasterDataReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListReason = reasonReceiptList,
                    ListStatus = statusOfReceiptList,
                    TypesOfReceiptList = typeOfReceiptList,
                    UnitMoneyList = unitMoneyOfReceiptList,
                    OrganizationList = listOrganization,
                    CustomerList = customerList
                };
            }
            catch (Exception ex)
            {
                return new GetMasterDataReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }

        public GetMasterDataSearchReceiptInvoiceResult GetMasterDataSearchReceiptInvoice(GetMasterDataSearchReceiptInvoiceParameter parameter)
        {
            try
            {
                var listCategoryType = context.CategoryType.ToList();
                var listCategory = context.Category.ToList();

                var categoryReasonType = listCategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "LTH");
                var reasonReceiptList = new List<CategoryEntityModel>();

                if (categoryReasonType != null)
                {
                    reasonReceiptList = listCategory
                        .Where(ct => ct.Active == true && ct.CategoryTypeId == categoryReasonType.CategoryTypeId)
                        .Select(c => new CategoryEntityModel()
                        {
                            CategoryTypeId = c.CategoryTypeId,
                            CategoryId = c.CategoryId,
                            CategoryName = c.CategoryName,
                            CategoryCode = c.CategoryCode,
                            IsDefault = c.IsDefauld
                        }).ToList();
                }

                var categoryStatusType = listCategoryType.FirstOrDefault(ct => ct.CategoryTypeCode == "TCH");
                var statusOfReceiptList = new List<CategoryEntityModel>();
                if (categoryStatusType != null)
                {
                    statusOfReceiptList = listCategory.Where(c => c.CategoryTypeId == categoryStatusType.CategoryTypeId)
                        .Select(c => new CategoryEntityModel()
                        {
                            CategoryTypeId = c.CategoryTypeId,
                            CategoryId = c.CategoryId,
                            CategoryName = c.CategoryName,
                            CategoryCode = c.CategoryCode,
                            IsDefault = c.IsDefauld
                        }).ToList();
                }

                var listEmployee = context.Employee.Select(x => new EmployeeEntityModel {
                    EmployeeId = x.EmployeeId,
                    EmployeeCode = x.EmployeeCode,
                    EmployeeName = x.EmployeeName,
                }).Where(e => e.Active == true).ToList();

                return new GetMasterDataSearchReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Success",
                    ListReason = reasonReceiptList,
                    ListStatus = statusOfReceiptList,
                    ListEmployee = listEmployee,
                };
            }
            catch (Exception ex)
            {
                return new GetMasterDataSearchReceiptInvoiceResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }

        public ConfirmPaymentResult ConfirmPayment(ConfirmPaymentParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {

                try
                {
                    //cập nhật thành trạng thái đã vào sổ 
                    var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TCH")?.CategoryTypeId;
                    var listTrangThai = context.Category.Where(x => x.CategoryTypeId == categoryTypeId).ToList();
                    var daNhapSo = listTrangThai.FirstOrDefault(x => x.CategoryCode == "DSO").CategoryId;
                    var chuaNhapSo = listTrangThai.FirstOrDefault(x => x.CategoryCode == "CSO").CategoryId;

                    //Phiếu thu
                    if (parameter.Type == "cash")
                    {
                        var receiptInvoice = context.ReceiptInvoice.FirstOrDefault(x => x.ReceiptInvoiceId == parameter.ReceiptInvoiceId);

                        if (receiptInvoice.StatusId != chuaNhapSo)
                        {
                            return new ConfirmPaymentResult()
                            {
                                StatusCode = HttpStatusCode.FailedDependency,
                                MessageCode = "Phiếu ở trạng thái khác chưa nhập số, vui lòng kiểm tra lại!"
                            };
                        }

                        var maDoiTuong = context.Category.FirstOrDefault(x => x.CategoryId == receiptInvoice.ReceiptInvoiceReason);

                        //Nếu đôi tượng là Khách hàng
                        if (maDoiTuong?.CategoryCode == "THA")
                        {
                            //Chuyển trạng thái phiếu yêu cầu
                            var listPhieu = context.PhieuThuBaoCoMappingCustomerOrder.Where(x => x.ObjectId == parameter.ReceiptInvoiceId && x.ObjectType == 2).ToList();
                            for (int i = 0; i < listPhieu.Count(); i++)
                            {
                                var item = listPhieu[i];
                                var param = new ChangeStatusCustomerOrderParameter();
                                param.OrderId = item.OrderId;
                                param.StatusOrder = 4;//Xác nhận thanh toán
                                var result = AccessHelper.ChangeStatusCustomerOrder(context, param, item.Amount ?? 0);
                                if (result.StatusCode != HttpStatusCode.OK)
                                {
                                    transaction.Rollback();
                                    return new ConfirmPaymentResult()
                                    {
                                        StatusCode = result.StatusCode,
                                        MessageCode = result.MessageCode
                                    };
                                }
                            }
                        }
                        //Nếu là nhà cung cấp
                        else if (maDoiTuong?.CategoryCode == "TTA")
                        {

                        }

                        receiptInvoice.StatusId = daNhapSo;
                        context.Update(receiptInvoice);
                    }
                    //Phiếu báo có
                    else if (parameter.Type == "bank")
                    {
                        var bankReceiptInvoice = context.BankReceiptInvoice.FirstOrDefault(x => x.BankReceiptInvoiceId == parameter.ReceiptInvoiceId);

                        var maDoiTuong = context.Category.FirstOrDefault(x => x.CategoryId == bankReceiptInvoice.BankReceiptInvoiceReason);

                        var orderId = context.PhieuThuBaoCoMappingCustomerOrder.FirstOrDefault(x => x.ObjectId == parameter.ReceiptInvoiceId)?.OrderId;

                        if (bankReceiptInvoice.StatusId != chuaNhapSo)
                        {
                            return new ConfirmPaymentResult()
                            {
                                StatusCode = HttpStatusCode.FailedDependency,
                                MessageCode = "Phiếu ở trạng thái khác chưa nhập số, vui lòng kiểm tra lại!"
                            };
                        }

                        //Nếu đôi tượng là Khách hàng
                        if (maDoiTuong?.CategoryCode == "THA")
                        {
                            //Chuyển trạng thái phiếu yêu cầu
                            var listPhieu = context.PhieuThuBaoCoMappingCustomerOrder.Where(x => x.ObjectId == parameter.ReceiptInvoiceId && x.ObjectType == 1).ToList();
                            for (int i = 0; i < listPhieu.Count(); i++)
                            {
                                var item = listPhieu[i];
                                var param = new ChangeStatusCustomerOrderParameter();
                                param.OrderId = item.OrderId;
                                param.StatusOrder = 4;//Xác nhận thanh toán
                                var result = AccessHelper.ChangeStatusCustomerOrder(context, param, item.Amount ?? 0);
                                if (result.StatusCode != HttpStatusCode.OK)
                                {
                                    transaction.Rollback();
                                    return new ConfirmPaymentResult()
                                    {
                                        StatusCode = result.StatusCode,
                                        MessageCode = result.MessageCode
                                    };
                                }
                            }
                        }
                        //Nếu là nhà cung cấp
                        else if (maDoiTuong?.CategoryCode == "TTA")
                        {

                        }

                        bankReceiptInvoice.StatusId = daNhapSo;
                        context.Update(bankReceiptInvoice);
                    }

                    context.SaveChanges();
                    transaction.Commit();

                    return new ConfirmPaymentResult()
                    {
                        StatusCode = HttpStatusCode.OK,
                        MessageCode = "Chuyển trạng thái đã nhập sổ thành công!"
                    };
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new ConfirmPaymentResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = e.Message
                    };
                }
            }
        }


        public TaoBaoCoChoKHChuyenKhoanVnPayResult TaoBaoCoChoKHChuyenKhoanVnPay(TaoBaoCoChoKHChuyenKhoanVnPayParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var listOrderId = parameter.ListOrderId;
                    //Kiểm tra trong các đơn hàng chọn thanh toán có đơn nào đã có báo có hay chưa
                    var checkExist = (from map in context.PhieuThuBaoCoMappingCustomerOrder
                                      join order in context.CustomerOrder on map.OrderId equals order.OrderId
                                      where listOrderId.Contains(map.OrderId.Value)
                                      select order.OrderCode).ToList();

                    if (checkExist.Count() != 0)
                    {
                        return new TaoBaoCoChoKHChuyenKhoanVnPayResult()
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Đơn hàng có mã " + string.Join(", ", checkExist) + "đã được gán trong phiếu báo có!"
                        };
                    }

                    var listCustomerOrder = (from order in context.CustomerOrder.Where(x => listOrderId.Contains(x.OrderId))
                                             join dt in context.CustomerOrderDetail on order.OrderId equals dt.OrderId
                                             into dtData
                                             from dt in dtData.DefaultIfEmpty()

                                             join mapp in context.ServicePacketMappingOptions on dt.OptionId equals mapp.Id
                                             into mappData
                                             from mapp in mappData.DefaultIfEmpty()

                                             join o in context.Options on mapp.OptionId equals o.Id
                                             into oData
                                             from o in oData.DefaultIfEmpty()

                                             select new
                                             {
                                                 OrderId = order.OrderId,
                                                 CustomerId = order.CustomerId,
                                                 OrderCode = order.OrderCode,
                                                 Amount = order.Amount,
                                                 OptionName = o.Name,
                                                 OrderType = order.OrderType,
                                             })
                                            .GroupBy(x => x.OrderId)
                                            .Select(x => new
                                            {
                                                OrderId = x.Key,
                                                OrderCode = x.FirstOrDefault().OrderCode,
                                                CustomerId = x.FirstOrDefault().CustomerId,
                                                Amount = x.FirstOrDefault().Amount,
                                                OptionName = string.Join(", ", x.Select(u => u.OptionName).ToList()),
                                                OrderType = x.FirstOrDefault().OrderType,
                                            })
                                            .ToList();

                    //Lý do thu
                    var category = (from type in context.CategoryType.Where(x => x.CategoryTypeCode == "LTH" || x.CategoryTypeCode == "DTI")
                                   join cate in context.Category.Where(x => x.CategoryCode == "THA" || x.CategoryCode == "VND") on type.CategoryTypeId equals cate.CategoryTypeId
                                   select new
                                   {
                                       Code = cate.CategoryCode,
                                       CateId = cate.CategoryId,
                                   }).ToList();

                    //cập nhật thành trạng thái đã vào sổ 
                    var categoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "TCH")?.CategoryTypeId;
                    var listTrangThai = context.Category.Where(x => x.CategoryTypeId == categoryTypeId).ToList();
                    var daNhapSo = listTrangThai.FirstOrDefault(x => x.CategoryCode == "DSO").CategoryId;

                    var bankReceiptInvoice = new BankReceiptInvoice();
                    bankReceiptInvoice.BankReceiptInvoiceId = Guid.NewGuid();
                    bankReceiptInvoice.BankReceiptInvoicePriceCurrency = category.FirstOrDefault(x => x.Code == "VND")?.CateId;
                    bankReceiptInvoice.BankReceiptInvoiceReason = category.FirstOrDefault(x => x.Code == "THA")?.CateId;
                    bankReceiptInvoice.BankReceiptInvoiceExchangeRate = 1;
                    bankReceiptInvoice.BankReceiptInvoiceAmount = listCustomerOrder.FirstOrDefault().Amount;
                    bankReceiptInvoice.BankReceiptInvoicePaidDate = DateTime.Now;
                    bankReceiptInvoice.StatusId = daNhapSo;
                    bankReceiptInvoice.BankReceiptInvoiceDetail = "Thanh toán đơn hàng " + listCustomerOrder.FirstOrDefault()?.OrderCode;
                    bankReceiptInvoice.CreatedDate = DateTime.Now;
                    bankReceiptInvoice.CreatedById = Guid.Empty;
                    bankReceiptInvoice.BankReceiptInvoiceCode =
                        "BC" + "-" + "KTTN" + DateTime.Now.Year +
                        (context.BankReceiptInvoice.Count(b => b.CreatedDate.Year == DateTime.Now.Year) + 1).ToString("D5");

                    var bankReceiptInvoiceDupblicase = context.BankReceiptInvoice.FirstOrDefault(x =>
                        x.BankReceiptInvoiceCode == bankReceiptInvoice.BankReceiptInvoiceCode);

                    if (bankReceiptInvoiceDupblicase != null)
                    {
                        return new TaoBaoCoChoKHChuyenKhoanVnPayResult
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Mã báo có đã tồn tại"
                        };
                    }

                    var newBankReceiptInvoiceMapping = new BankReceiptInvoiceMapping();
                    newBankReceiptInvoiceMapping.BankReceiptInvoiceMappingId = Guid.NewGuid();
                    newBankReceiptInvoiceMapping.CreatedDate = DateTime.Now;
                    newBankReceiptInvoiceMapping.BankReceiptInvoiceId = bankReceiptInvoice.BankReceiptInvoiceId;
                    newBankReceiptInvoiceMapping.ObjectId = listCustomerOrder.FirstOrDefault()?.CustomerId;
                    newBankReceiptInvoiceMapping.ReferenceType = 3; //Khách hàng

                    //Thêm các customerorder/ vendorOrder gán vói phiếu báo cáo
                    var listMapping = new List<PhieuThuBaoCoMappingCustomerOrder>();

                    for (int i = 0; i <listCustomerOrder.Count(); i++)
                    {
                        var item = listCustomerOrder[i];
                        var newObj = new PhieuThuBaoCoMappingCustomerOrder();
                        newObj.Id = Guid.NewGuid();
                        newObj.ObjectId = bankReceiptInvoice.BankReceiptInvoiceId;
                        newObj.ObjectType = 1;//Báo có
                        newObj.OrderId = item.OrderId;
                        newObj.VendorOrderId = null;
                        newObj.Amount = item.Amount;
                        newObj.ListPacketServiceName = item.OptionName;
                        newObj.OrderCode = item.OrderCode;
                        newObj.OrderTypeName = item.OrderType == 1 ? "Phiếu yêu cầu" : "Phiếu yêu cầu bổ sung";
                        newObj.CreatedDate = DateTime.Now;

                        //Nếu thu tiền KH => chuyển trạng thái đã thanh toán
                        var listDetail = context.CustomerOrderDetail.Where(x => x.OrderId == item.OrderId).Select(x => _mapper.Map<CustomerOrderDetailEntityModel>(x)).ToList();
                        var listDetailExtend = context.CustomerOrderDetailExten.Where(x => x.OrderId == item.OrderId).Select(x => _mapper.Map<CustomerOrderDetailExtenEntityModel>(x)).ToList();

                        var param = new ChangeStatusCustomerOrderParameter();
                        param.OrderId = item.OrderId;
                        param.StatusOrder = 4;//Xác nhận thanh toán
                        param.ListDetailExtend = listDetailExtend;
                        param.ListDetail = listDetail;
                        var result = AccessHelper.ChangeStatusCustomerOrder(context, param, item.Amount ?? 0);
                        if (result.StatusCode != HttpStatusCode.OK)
                        {
                            transaction.Rollback();
                            return new TaoBaoCoChoKHChuyenKhoanVnPayResult()
                            {
                                StatusCode = result.StatusCode,
                                MessageCode = result.MessageCode
                            };
                        }
                        listMapping.Add(newObj);
                    }
                
                    context.BankReceiptInvoice.Add(bankReceiptInvoice);
                    context.BankReceiptInvoiceMapping.Add(newBankReceiptInvoiceMapping);
                    if (listMapping.Count() > 0) context.PhieuThuBaoCoMappingCustomerOrder.AddRange(listMapping);
                    context.SaveChanges();

                    transaction.Commit();
                    return new TaoBaoCoChoKHChuyenKhoanVnPayResult()
                    {
                        StatusCode = HttpStatusCode.OK,
                        MessageCode = CommonMessage.BankReceiptInvoice.ADD_SUCCESS
                    };
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new TaoBaoCoChoKHChuyenKhoanVnPayResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = e.Message
                    };
                }
            }
        }

    }
}
