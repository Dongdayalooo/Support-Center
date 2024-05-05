using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using TN.TNM.Common;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Receivable.Customer;
using TN.TNM.DataAccess.Messages.Parameters.Receivable.Vendor;
using TN.TNM.DataAccess.Messages.Parameters.SalesReport;
using TN.TNM.DataAccess.Messages.Results.Receivable.Customer;
using TN.TNM.DataAccess.Messages.Results.Receivable.Vendor;
using TN.TNM.DataAccess.Messages.Results.SalesReport;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.Order;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.Receivable;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class ReceivableDAO : BaseDAO, IReceivableDataAccess
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        public ReceivableDAO(Databases.TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace, IHostingEnvironment hostingEnvironment)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
            _hostingEnvironment = hostingEnvironment;
        }

        public GetReceivableVendorReportResults GetReceivableVendorReport(GetReceivableVendorReportParameter parameter)
        {
            //1: Công nợ phải trả Ncc, 2: Công nợ phải thu Ncc
            if (parameter.Type == 1)
            {
                // Get Vendor Order List
                var vendorOrderList = (from v in context.Vendor
                                       join vo in context.VendorOrder on v.VendorId equals vo.VendorId into temp
                                       from x in temp.DefaultIfEmpty()
                                       where
                                           (parameter.VendorCode == null || parameter.VendorCode.Count == 0 ||
                                            parameter.VendorCode.Contains(v.VendorId)) &&
                                           (v.VendorName.Contains(parameter.VendorName) || string.IsNullOrEmpty(parameter.VendorName)) &&
                                           (parameter.ReceivalbeDateTo == null || parameter.ReceivalbeDateTo == DateTime.MinValue ||
                                            x.CreatedDate.Date <= parameter.ReceivalbeDateTo.Value) &&
                                            x.StatusId == 2 && //Xác nhận
                                            x.VendorOrderType == 1

                                       select new ReceivableVendorReportEntityModel
                                       {
                                           VendorCode = v.VendorCode,
                                           VendorName = v.VendorName,
                                           VendorId = v.VendorId,
                                           TotalPurchase = x.TongTienDonHang,
                                           TotalPaid = 0,
                                           NearestTransaction = null,
                                       }).OrderBy(v => v.VendorName).ToList();

                // Get Receipt Invoice List
                var payInvoiceList = (from c in context.Vendor
                                      join rom in context.PayableInvoiceMapping on c.VendorId equals rom.ObjectId
                                      join r in context.PayableInvoice on rom.PayableInvoiceId equals r.PayableInvoiceId
                                      where
                                          (parameter.VendorCode == null || parameter.VendorCode.Count == 0 ||
                                           parameter.VendorCode.Contains(c.VendorId)) &&
                                          (c.VendorName.Contains(parameter.VendorName) || string.IsNullOrEmpty(parameter.VendorName)) &&
                                          (parameter.ReceivalbeDateTo == null || parameter.ReceivalbeDateTo == DateTime.MinValue ||
                                           r.PaidDate.Date <= parameter.ReceivalbeDateTo.Value)
                                      select new ReceivableVendorReportEntityModel
                                      {
                                          VendorName = c.VendorName,
                                          VendorCode = c.VendorCode,
                                          TotalPaid = r.Amount,
                                          TotalPurchase = 0,
                                          VendorId = c.VendorId,
                                          NearestTransaction = r.PaidDate
                                      }).OrderByDescending(v => v.NearestTransaction).ToList();

                // Get Receipt Bank Invoice List
                var payInvoiceBankList = (from c in context.Vendor
                                          join rom in context.BankPayableInvoiceMapping on c.VendorId equals rom.ObjectId
                                          join r in context.BankPayableInvoice on rom.BankPayableInvoiceId equals r.BankPayableInvoiceId
                                          where
                                              (parameter.VendorCode == null || parameter.VendorCode.Count == 0 ||
                                               parameter.VendorCode.Contains(c.VendorId)) &&
                                              (c.VendorName.Contains(parameter.VendorName) || string.IsNullOrEmpty(parameter.VendorName)) &&
                                              (parameter.ReceivalbeDateTo == null || parameter.ReceivalbeDateTo == DateTime.MinValue ||
                                               r.BankPayableInvoicePaidDate.Date <= parameter.ReceivalbeDateTo.Value)
                                          select new ReceivableVendorReportEntityModel
                                          {
                                              VendorName = c.VendorName,
                                              VendorCode = c.VendorCode,
                                              TotalPaid = r.BankPayableInvoiceAmount,
                                              TotalPurchase = 0,
                                              VendorId = c.VendorId,
                                              NearestTransaction = r.BankPayableInvoicePaidDate
                                          }).OrderByDescending(v => v.NearestTransaction).ToList();

                var newData = new List<ReceivableVendorReportEntityModel>();
                var newObject = new List<ReceivableVendorReportEntityModel>();
                newData.AddRange(payInvoiceBankList);
                newData.AddRange(payInvoiceList);
                newData.AddRange(vendorOrderList);

                foreach (var order in newData)
                {
                    // Check order list to add order 
                    var orderNew = newObject.FirstOrDefault(v => v.VendorId == order.VendorId);
                    if (orderNew != null)
                    {
                        orderNew.TotalPaid += order.TotalPaid;
                        if (order.NearestTransaction != null && (order.NearestTransaction > orderNew.NearestTransaction
                            || orderNew.NearestTransaction == null))
                        {
                            orderNew.NearestTransaction = order.NearestTransaction;
                        }
                    }
                    else
                    {
                        newObject.Add(new ReceivableVendorReportEntityModel
                        {
                            VendorCode = order.VendorCode,
                            VendorName = order.VendorName,
                            VendorId = order.VendorId,
                            TotalPurchase = vendorOrderList.Where(x => x.VendorId == order.VendorId).Sum(x => x.TotalPurchase) ?? 0,
                            TotalPaid = order.TotalPaid,
                            NearestTransaction = order.NearestTransaction,
                            Status = order.Status
                        });
                    }
                }

                // Sum total value
                var totalPurchase = newObject.Sum(v => v.TotalPurchase);
                var totalPaid = newObject.Sum(v => v.TotalPaid);
                newObject = newObject.Where(c => c.TotalPaid != 0 || c.TotalPurchase != 0).ToList();

                return new GetReceivableVendorReportResults
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    ReceivableVendorReport = newObject,
                    TotalPurchase = totalPurchase,
                    TotalPaid = totalPaid
                };
            }
            else
            {
                //Chờ thanh toán, thanh toán 1 phần, đã thanh toán
                var listTrangThai = GeneralList.GetTrangThais("VendorOrder").Where(x => x.Value == 2 || x.Value == 3 || x.Value == 4).Select(x => x.Value).ToList();

                // Get Vendor Order List
                var vendorOrderList = (from v in context.Vendor
                                       join vo in context.VendorOrder on v.VendorId equals vo.VendorId into temp
                                       from x in temp.DefaultIfEmpty()
                                       where
                                           (parameter.VendorCode == null || parameter.VendorCode.Count == 0 ||
                                            parameter.VendorCode.Contains(v.VendorId)) &&
                                           (v.VendorName.Contains(parameter.VendorName) || string.IsNullOrEmpty(parameter.VendorName)) &&
                                           (parameter.ReceivalbeDateTo == null || parameter.ReceivalbeDateTo == DateTime.MinValue ||
                                            x.CreatedDate.Date <= parameter.ReceivalbeDateTo.Value) &&
                                           listTrangThai.Contains(x.StatusId) &&
                                           x.VendorOrderType == 2 // Ncc thannh toán

                                       select new ReceivableVendorReportEntityModel
                                       {
                                           VendorOrderId = x.VendorOrderId,
                                           VendorCode = v.VendorCode,
                                           VendorName = v.VendorName,
                                           VendorId = v.VendorId,
                                           TotalPurchase = x.TongTienHoaHong,
                                           TotalPaid = 0,
                                           NearestTransaction = null,
                                       }).OrderBy(v => v.VendorName).ToList();

                // Get Receipt Invoice List
                var invoiceList = (from c in context.Vendor
                                  join rom in context.ReceiptInvoiceMapping on c.VendorId equals rom.ObjectId
                                  join r in context.ReceiptInvoice on rom.ReceiptInvoiceId equals r.ReceiptInvoiceId
                                  where
                                          (parameter.VendorCode == null || parameter.VendorCode.Count == 0 ||
                                           parameter.VendorCode.Contains(c.VendorId)) &&
                                          (c.VendorName.Contains(parameter.VendorName) || string.IsNullOrEmpty(parameter.VendorName)) &&
                                          (parameter.ReceivalbeDateTo == null || r.ReceiptDate.Date <= parameter.ReceivalbeDateTo.Value)
                                      select new ReceivableVendorReportEntityModel
                                      {
                                          VendorName = c.VendorName,
                                          VendorCode = c.VendorCode,
                                          TotalPaid = r.Amount,
                                          TotalPurchase = 0,
                                          VendorId = c.VendorId,
                                          NearestTransaction = r.ReceiptDate
                                      }).OrderByDescending(v => v.NearestTransaction).ToList();

                // Get Receipt Bank Invoice List
                var invoiceBankList = (from c in context.Vendor
                                      join rom in context.BankReceiptInvoiceMapping on c.VendorId equals rom.ObjectId
                                      join r in context.BankReceiptInvoice on rom.BankReceiptInvoiceId equals r.BankReceiptInvoiceId
                                      where
                                              (parameter.VendorCode == null || parameter.VendorCode.Count == 0 ||
                                               parameter.VendorCode.Contains(c.VendorId)) &&
                                              (c.VendorName.Contains(parameter.VendorName) || string.IsNullOrEmpty(parameter.VendorName)) &&
                                              (parameter.ReceivalbeDateTo == null ||  r.BankReceiptInvoicePaidDate.Date <= parameter.ReceivalbeDateTo.Value)
                                          select new ReceivableVendorReportEntityModel
                                          {
                                              VendorName = c.VendorName,
                                              VendorCode = c.VendorCode,
                                              TotalPaid = r.BankReceiptInvoiceAmount,
                                              TotalPurchase = 0,
                                              VendorId = c.VendorId,
                                              NearestTransaction = r.BankReceiptInvoicePaidDate
                                          }).OrderByDescending(v => v.NearestTransaction).ToList();

                var newData = new List<ReceivableVendorReportEntityModel>();
                var newObject = new List<ReceivableVendorReportEntityModel>();
                newData.AddRange(invoiceList);
                newData.AddRange(invoiceBankList);
                newData.AddRange(vendorOrderList);

                foreach (var order in newData)
                {
                    // Check order list to add order 
                    var orderNew = newObject.FirstOrDefault(v => v.VendorId == order.VendorId);
                    if (orderNew != null)
                    {
                        orderNew.TotalPaid += order.TotalPaid;
                        if (order.NearestTransaction != null && (order.NearestTransaction > orderNew.NearestTransaction
                            || orderNew.NearestTransaction == null))
                        {
                            orderNew.NearestTransaction = order.NearestTransaction;
                        }
                    }
                    else
                    {
                        newObject.Add(new ReceivableVendorReportEntityModel
                        {
                            VendorCode = order.VendorCode,
                            VendorName = order.VendorName,
                            VendorId = order.VendorId,
                            TotalPurchase = newData.Where(x => x.VendorId == order.VendorId).Sum(x => x.TotalPurchase) ?? 0,
                            TotalPaid = order.TotalPaid,
                            NearestTransaction = order.NearestTransaction,
                            Status = order.Status
                        });
                    }
                }

                // Sum total value

                var totalPurchase = newObject.Sum(v => v.TotalPurchase);

                var totalPaid = newObject.Sum(v => v.TotalPaid);

                newObject = newObject.Where(c => c.TotalPaid != 0 || c.TotalPurchase != 0).ToList();

                var listVendorOrderId = vendorOrderList.Select(x => x.VendorOrderId).ToList();

                var tongTienKhThanhToan = context.VendorOrderDetail.Where(x => listVendorOrderId.Contains(x.VendorOrderId)).Sum(x => x.TongTienKhachHangThanhToan);

                return new GetReceivableVendorReportResults
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    ReceivableVendorReport = newObject,
                    TotalPurchase = totalPurchase,
                    TotalPaid = totalPaid,
                    TongTienKhThanhToan = tongTienKhThanhToan,
                };
            }
        }

        public GetReceivableVendorDetailResults GetReceivableVendorDetail(GetReceivableVendorDetailParameter parameter)
        {
            // Get vendor name
            var vendor = context.Vendor.FirstOrDefault(v => v.VendorId == parameter.VendorId);

            if(parameter.Type == 1)
            {
                // Danh sách đơn đặt hàng Nhà cung cấp trong kỳ
                var vendorOrderList = (from ov in context.VendorOrder
                                       join dt in context.VendorOrderDetail on ov.VendorOrderId equals dt.VendorOrderId
                                       join o in context.Options on dt.OptionId equals o.Id
                                       join orderAction in context.CustomerOrder.Where(x => x.IsOrderAction == true) on ov.OrderActionId equals orderAction.OrderId
                                       where ov.VendorId == parameter.VendorId
                                       && ov.StatusId == 2 && //Xác nhận 
                                       ov.VendorOrderType == 1 &&
                                       (parameter.ReceivalbeDateFrom == null || ov.CreatedDate >= parameter.ReceivalbeDateFrom) &&
                                       (parameter.ReceivalbeDateTo == null || ov.CreatedDate <= parameter.ReceivalbeDateTo)
                                       select new ReceivableVendorReportEntityModel
                                       {
                                           CreateDateOrder = ov.CreatedDate,
                                           OrderCode = ov.VendorOrderCode,
                                           CreatedBy = ov.CreatedById,
                                           VendorOrderId = ov.VendorOrderId,
                                           DichVuName = o.Name,
                                           OrderActionCode = ov.VendorOrderCode,
                                           OrderActionId = orderAction.OrderId,
                                           TongTienDonHang = ov.TongTienDonHang,
                                           VendorOrderCode = ov.VendorOrderCode,
                                       })
                                      .GroupBy(x => x.VendorOrderId)
                                      .Select(x => new ReceivableVendorReportEntityModel
                                      {
                                          VendorOrderId = x.Key,
                                          CreateDateOrder = x.FirstOrDefault().CreateDateOrder,
                                          OrderCode = x.FirstOrDefault().OrderCode,
                                          CreatedBy = x.FirstOrDefault().CreatedBy,
                                          DichVuName = string.Join(", ", x.Select(y => y.DichVuName).Distinct().ToList()),
                                          OrderActionCode = x.FirstOrDefault().OrderActionCode,
                                          OrderActionId = x.FirstOrDefault().OrderActionId,
                                          TongTienDonHang = x.FirstOrDefault().TongTienDonHang,
                                          VendorOrderCode = x.FirstOrDefault().VendorOrderCode,
                                      }).OrderBy(v => v.CreateDateOrder).ToList();

                var payableInvoiceMap = context.PayableInvoiceMapping.Where(c => c.ObjectId == parameter.VendorId).Select(c => c.PayableInvoiceId).ToList();
                var payableBankMap = context.BankPayableInvoiceMapping.Where(c => c.ObjectId == parameter.VendorId).Select(c => c.BankPayableInvoiceId).ToList();


                //Danh sách phiếu chi kỳ này và kỳ trước
                var listAllPayableCashList = context.PayableInvoice.Where(c =>
                                            (parameter.ReceivalbeDateTo == null || c.CreatedDate <= parameter.ReceivalbeDateTo) &&
                                            payableInvoiceMap.Contains(c.PayableInvoiceId))
                                            .Select(p => new ReceivableVendorReportEntityModel
                                            {
                                                PayableInvoiceId = p.PayableInvoiceId,
                                                CreateDateReceiptInvoice = p.PaidDate,
                                                ReceiptInvoiceValue = p.Amount,
                                                DescriptionReceipt = p.PayableInvoiceDetail,
                                                ReceiptCode = p.PayableInvoiceCode,
                                                CreatedBy = p.CreatedById,
                                                CreatedDate = p.CreatedDate,
                                                Router = "PC"
                                            }).ToList();

                //Danh sách phiếu ủy nhiệm chi kỳ này và kỳ trước
                var listAllPayableBankList = context.BankPayableInvoice.Where(c =>
                                             (parameter.ReceivalbeDateTo == null || c.CreatedDate <= parameter.ReceivalbeDateTo) &&
                                             payableBankMap.Contains(c.BankPayableInvoiceId))
                                             .Select(p => new ReceivableVendorReportEntityModel
                                             {
                                                 BankPayableInvoiceId = p.BankPayableInvoiceId,
                                                 CreateDateReceiptInvoice = p.BankPayableInvoicePaidDate,
                                                 ReceiptInvoiceValue = p.BankPayableInvoiceAmount,
                                                 DescriptionReceipt = p.BankPayableInvoiceDetail ?? "",
                                                 ReceiptCode = p.BankPayableInvoiceCode ?? "",
                                                 CreatedBy = p.CreatedById,
                                                 CreatedDate = p.CreatedDate,
                                                 Router = "UNC"
                                             }).ToList();

                //Danh sách phiếu chi trong kỳ
                var payableCashList = listAllPayableCashList.Where(c =>
                        (parameter.ReceivalbeDateFrom == null || c.CreatedDate >= parameter.ReceivalbeDateFrom) &&
                        (parameter.ReceivalbeDateTo == null || c.CreatedDate <= parameter.ReceivalbeDateTo)).ToList();

                // Danh sách phiếu UNC trong kỳ
                var payableBankList = listAllPayableBankList.Where(c =>
                        (parameter.ReceivalbeDateFrom == null || c.CreatedDate >= parameter.ReceivalbeDateFrom) &&
                        (parameter.ReceivalbeDateTo == null || c.CreatedDate <= parameter.ReceivalbeDateTo)).ToList();

                // Danh sách phiếu chi kỳ trước
                var payCashBefore = listAllPayableCashList.Where(c => parameter.ReceivalbeDateFrom == null || c.CreateDateReceiptInvoice < parameter.ReceivalbeDateFrom).ToList();

                // Danh sách phiếu UNC kỳ trước
                var payBankBefore = listAllPayableBankList.Where(c => parameter.ReceivalbeDateFrom == null || c.CreateDateReceiptInvoice < parameter.ReceivalbeDateFrom).ToList();


                //Tổng chi trong kỳ
                var totalPayList = new List<ReceivableVendorReportEntityModel>();
                totalPayList.AddRange(payableBankList);
                totalPayList.AddRange(payableCashList);

                // Tổng giá trị các đơn đặt hàng kỳ trước
                decimal totalValueVendorOrderBefore = context.VendorOrder.Where(v =>
                                                            v.StatusId == 2 && v.VendorOrderType == 1 &&
                                                            v.VendorId == parameter.VendorId &&
                                                            (parameter.ReceivalbeDateFrom == null || v.CreatedDate < parameter.ReceivalbeDateFrom)).Sum(x => x.TongTienDonHang) ?? 0;

                //Tổng chi kỳ trước
                var receiptBefore = new List<ReceivableVendorReportEntityModel>();
                receiptBefore.AddRange(payBankBefore);
                receiptBefore.AddRange(payCashBefore);

                // Thanh toán trong kỳ
                var totalValueReceipt = totalPayList.Sum(v => v.ReceiptInvoiceValue);

                // Dư nợ đầu kỳ
                var totalReceivableBefore = totalValueVendorOrderBefore == 0 ? 0 : totalValueVendorOrderBefore - receiptBefore.Sum(r => r.ReceiptInvoiceValue);

                //Nợ phát sinh trong kỳ
                var totalValueOrder = vendorOrderList.Sum(x => x.TongTienDonHang) ?? 0;

                // Dư nợ cuối kỳ
                var totalReceivable = totalReceivableBefore + totalValueOrder - totalValueReceipt;

                return new GetReceivableVendorDetailResults
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    ReceivableVendorDetail = vendorOrderList,
                    ReceiptsList = totalPayList.OrderBy(v => v.CreateDateReceiptInvoice).ToList(),
                    VendorName = vendor?.VendorCode + " - " + vendor?.VendorName,
                    TotalReceivableBefore = totalReceivableBefore,  //Dư nợ đầu kỳ
                    TotalValueReceipt = totalValueReceipt,  //Thanh toán trong kỳ
                    TotalValueOrder = totalValueOrder,
                    TotalReceivable = totalReceivable,
                };
            }
            else
            {
                //Chờ thanh toán, thanh toán 1 phần, đã thanh toán
                var listTrangThai = GeneralList.GetTrangThais("VendorOrder").Where(x => x.Value == 2 || x.Value == 3 || x.Value == 4).Select(x => x.Value).ToList();

                // Danh sách đơn đặt hàng Nhà cung cấp trong kỳ
                var vendorOrderList = (from ov in context.VendorOrder
                                       join dt in context.VendorOrderDetail on ov.VendorOrderId equals dt.VendorOrderId
                                       join o in context.Options on dt.OptionId equals o.Id
                                       join orderAction in context.CustomerOrder.Where(x => x.IsOrderAction == true) on ov.OrderActionId equals orderAction.OrderId

                                       where ov.VendorId == parameter.VendorId
                                       && listTrangThai.Contains(ov.StatusId) && 
                                       ov.VendorOrderType == 2 && // Ncc thannh toán
                                       (parameter.ReceivalbeDateFrom == null || ov.CreatedDate >= parameter.ReceivalbeDateFrom) &&
                                       (parameter.ReceivalbeDateTo == null || ov.CreatedDate <= parameter.ReceivalbeDateTo)
                                       select new ReceivableVendorReportEntityModel
                                       {
                                           CreateDateOrder = ov.CreatedDate,
                                           OrderCode = ov.VendorOrderCode,
                                           CreatedBy = ov.CreatedById,
                                           VendorOrderId = ov.VendorOrderId,
                                           DichVuName = o.Name,
                                           OrderActionCode = ov.VendorOrderCode,
                                           OrderActionId = orderAction.OrderId,
                                           TongTienDonHang = ov.TongTienHoaHong,
                                           VendorOrderCode = ov.VendorOrderCode,
                                       })
                                      .GroupBy(x => x.VendorOrderId)
                                      .Select(x => new ReceivableVendorReportEntityModel
                                      {
                                          VendorOrderId = x.Key,
                                          CreateDateOrder = x.FirstOrDefault().CreateDateOrder,
                                          OrderCode = x.FirstOrDefault().OrderCode,
                                          CreatedBy = x.FirstOrDefault().CreatedBy,
                                          DichVuName = string.Join(", ", x.Select(y => y.DichVuName).Distinct().ToList()),
                                          OrderActionCode = x.FirstOrDefault().OrderActionCode,
                                          OrderActionId = x.FirstOrDefault().OrderActionId,
                                          TongTienDonHang = x.FirstOrDefault().TongTienDonHang,
                                          VendorOrderCode = x.FirstOrDefault().VendorOrderCode,
                                      }).OrderBy(v => v.CreateDateOrder).ToList();

                var receiptInvoiceMap = context.ReceiptInvoiceMapping.Where(c => c.ObjectId == parameter.VendorId).Select(c => c.ReceiptInvoiceId).ToList();
                var receiptBankMap = context.BankReceiptInvoiceMapping.Where(c => c.ObjectId == parameter.VendorId).Select(c => c.BankReceiptInvoiceId).ToList();

                //Danh sách phiếu thu kỳ này và kỳ trước
                var listAllCashList = context.ReceiptInvoice.Where(c =>
                                            (parameter.ReceivalbeDateTo == null || c.CreatedDate <= parameter.ReceivalbeDateTo) &&
                                            receiptInvoiceMap.Contains(c.ReceiptInvoiceId))
                                            .Select(p => new ReceivableVendorReportEntityModel
                                            {
                                                PayableInvoiceId = p.ReceiptInvoiceId,
                                                CreateDateReceiptInvoice = p.ReceiptDate,
                                                ReceiptInvoiceValue = p.Amount,
                                                DescriptionReceipt = p.ReceiptInvoiceDetail,
                                                ReceiptCode = p.ReceiptInvoiceCode,
                                                CreatedBy = p.CreatedById,
                                                CreatedDate = p.CreatedDate,
                                                Router = "PT"
                                            }).ToList();

                //Danh sách phiếu báo có này và kỳ trước
                var listAllBankList = context.BankReceiptInvoice.Where(c =>
                                             (parameter.ReceivalbeDateTo == null || c.CreatedDate <= parameter.ReceivalbeDateTo) &&
                                             receiptBankMap.Contains(c.BankReceiptInvoiceId))
                                             .Select(p => new ReceivableVendorReportEntityModel
                                             {
                                                 BankPayableInvoiceId = p.BankReceiptInvoiceId,
                                                 CreateDateReceiptInvoice = p.BankReceiptInvoicePaidDate,
                                                 ReceiptInvoiceValue = p.BankReceiptInvoiceAmount,
                                                 DescriptionReceipt = p.BankReceiptInvoiceDetail ?? "",
                                                 ReceiptCode = p.BankReceiptInvoiceCode ?? "",
                                                 CreatedBy = p.CreatedById,
                                                 CreatedDate = p.CreatedDate,
                                                 Router = "BC"
                                             }).ToList();

                //Danh sách phiếu thu trong kỳ
                var payableCashList = listAllCashList.Where(c =>
                        (parameter.ReceivalbeDateFrom == null || c.CreatedDate >= parameter.ReceivalbeDateFrom) &&
                        (parameter.ReceivalbeDateTo == null || c.CreatedDate <= parameter.ReceivalbeDateTo)).ToList();

                // Danh sách phiếu báo có trong kỳ
                var payableBankList = listAllBankList.Where(c =>
                        (parameter.ReceivalbeDateFrom == null || c.CreatedDate >= parameter.ReceivalbeDateFrom) &&
                        (parameter.ReceivalbeDateTo == null || c.CreatedDate <= parameter.ReceivalbeDateTo)).ToList();

                // Danh sách phiếu thu kỳ trước
                var payCashBefore = listAllCashList.Where(c => parameter.ReceivalbeDateFrom == null || c.CreateDateReceiptInvoice < parameter.ReceivalbeDateFrom).ToList();

                // Danh sách phiếu báo có kỳ trước
                var payBankBefore = listAllBankList.Where(c => parameter.ReceivalbeDateFrom == null || c.CreateDateReceiptInvoice < parameter.ReceivalbeDateFrom).ToList();

                //Tổng thu trong kỳ
                var totalPayList = new List<ReceivableVendorReportEntityModel>();
                totalPayList.AddRange(payableBankList);
                totalPayList.AddRange(payableCashList);

                // Tổng giá trị các đơn đặt hàng kỳ trước
                decimal totalValueVendorOrderBefore = context.VendorOrder.Where(v =>
                                                            listTrangThai.Contains(v.StatusId) && v.VendorOrderType == 2 &&
                                                            v.VendorId == parameter.VendorId &&
                                                            (parameter.ReceivalbeDateFrom == null || v.CreatedDate < parameter.ReceivalbeDateFrom)).Sum(x => x.TongTienDonHang) ?? 0;

                //Tổng thu kỳ trước
                var receiptBefore = new List<ReceivableVendorReportEntityModel>();
                receiptBefore.AddRange(payBankBefore);
                receiptBefore.AddRange(payCashBefore);

                // Thanh toán trong kỳ
                var totalValueReceipt = totalPayList.Sum(v => v.ReceiptInvoiceValue);

                // Dư nợ đầu kỳ
                var totalReceivableBefore = totalValueVendorOrderBefore == 0 ? 0 : totalValueVendorOrderBefore - receiptBefore.Sum(r => r.ReceiptInvoiceValue);

                //Nợ phát sinh trong kỳ
                var totalValueOrder = vendorOrderList.Sum(x => x.TongTienDonHang) ?? 0;

                // Dư nợ cuối kỳ
                var totalReceivable = totalReceivableBefore + totalValueOrder - totalValueReceipt;

                return new GetReceivableVendorDetailResults
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    ReceivableVendorDetail = vendorOrderList,
                    ReceiptsList = totalPayList.OrderBy(v => v.CreateDateReceiptInvoice).ToList(),
                    VendorName = vendor?.VendorCode + " - " + vendor?.VendorName,
                    TotalReceivableBefore = totalReceivableBefore,  //Dư nợ đầu kỳ
                    TotalValueReceipt = totalValueReceipt,  //Thanh toán trong kỳ
                    TotalValueOrder = totalValueOrder,
                    TotalReceivable = totalReceivable,
                };
            }
            
        }

        public GetReceivableCustomerReportResults GetReceivableCustomerReport(GetReceivableCustomerReportParameter parameter)
        {
            try
            {
                var CustomerNameOrCustomerCode = parameter.CustomerNameOrCustomerCode == null
                    ? ""
                    : parameter.CustomerNameOrCustomerCode.Trim().ToLower();

                #region Lấy trạng thái đơn hàng tính tổng đơn hàng theo system parameter

                var orderStatusCode = context.SystemParameter.FirstOrDefault(f => f.SystemKey == "OrderStatus")
                                          ?.SystemValueString ?? "";
                var listOrderStatusCode = orderStatusCode.Split(';').ToList()
                    .Select(w => w.Trim().ToUpper()).ToList();
                var listOrderStatusId = context.OrderStatus.Where(w => listOrderStatusCode.Contains(w.OrderStatusCode))
                    .Select(w => w.OrderStatusId).ToList();

                #endregion

                //Số dư ban đầu của tài khoản công ty
                decimal constBalance = 0;

                decimal totalSalesBefore = 0;
                decimal totalPaidBefore = 0;

                decimal totalPurchase = 0;
                decimal totalPaid = 0;
                decimal totalReceipt = 0;

                //Lấy tất cả khách hàng
                var listCustomer = context.Customer.Where(x => x.Active == true
                                                               && (CustomerNameOrCustomerCode == "" ||
                                                                   x.CustomerCode.ToLower()
                                                                       .Contains(CustomerNameOrCustomerCode) ||
                                                                   x.CustomerName.ToLower()
                                                                       .Contains(CustomerNameOrCustomerCode))).ToList();
                //Lấy danh sách đơn hàng được tính doanh thu
                var listOrder = context.CustomerOrder.ToList();

                List<Guid> listCustomerId = new List<Guid>();
                listCustomer.ForEach(item =>
                {
                    if (item.CustomerId != null && item.CustomerId != Guid.Empty)
                        listCustomerId.Add(item.CustomerId);
                });

                #region Lấy danh sách phiếu thu

                var listReceiptInvoiceMapping = context.ReceiptInvoiceMapping
                    .Where(x => listCustomerId.Contains(x.ObjectId.Value)).ToList();
                var listAllReceiptInvoice = context.ReceiptInvoice.ToList();

                #endregion

                #region Lấy danh sách báo có

                var listBankReceiptInvoiceMapping = context.BankReceiptInvoiceMapping
                    .Where(x => listCustomerId.Contains(x.ObjectId.Value)).ToList();
                var listAllBankReceiptInvoice = context.BankReceiptInvoice.ToList();

                #endregion

                List<ReceivableCustomerEntityModel>
                    receivableCustomerReport = new List<ReceivableCustomerEntityModel>();
                listCustomer.ForEach(item =>
                {
                    ReceivableCustomerEntityModel receivableCustomerEntity = new ReceivableCustomerEntityModel();
                    receivableCustomerEntity.CustomerId = item.CustomerId;
                    receivableCustomerEntity.CustomerCode = item.CustomerCode;
                    receivableCustomerEntity.CustomerName = item.CustomerName;
                    receivableCustomerEntity.TotalSales = 0;
                    receivableCustomerEntity.TotalPaid = 0;
                    receivableCustomerEntity.TotalReceipt = 0;
                    receivableCustomerEntity.NearestTransaction = null;

                    decimal currentTotalSalesBefore = 0;
                    decimal currentTotalPaidBefore = 0;

                    if (parameter.FromDate != DateTime.MinValue)
                    {
                        #region Đầu kỳ

                        //Tính tổng đặt hàng
                        decimal currentTotalSales = 0;
                        var newListOrder = listOrder.Where(x =>
                                x.CustomerId == item.CustomerId &&
                                ((parameter.FromDate == DateTime.MinValue) ||
                                 (parameter.FromDate.Date > x.OrderDate.Date)))
                            .ToList();
                  
                        currentTotalSalesBefore = currentTotalSales;
                        totalSalesBefore += currentTotalSalesBefore;

                        //Tính tổng tiền thu từ phiếu thu và báo có
                        decimal currentTotalPaid = 0;

                        //Từ Phiếu thu
                        var newListReceiptInvoiceMapping = listReceiptInvoiceMapping
                            .Where(x => x.ObjectId == item.CustomerId).ToList();
                        List<Guid> newListReceiptInvoiceId = new List<Guid>();
                        newListReceiptInvoiceMapping.ForEach(receiptMap =>
                        {
                            if (receiptMap.ReceiptInvoiceId != null || receiptMap.ReceiptInvoiceId != Guid.Empty)
                                newListReceiptInvoiceId.Add(receiptMap.ReceiptInvoiceId);
                        });

                        var listReceiptInvoice = listAllReceiptInvoice.Where(x =>
                            newListReceiptInvoiceId.Contains(x.ReceiptInvoiceId) &&
                            ((parameter.FromDate == DateTime.MinValue) ||
                             (parameter.FromDate.Date > x.ReceiptDate.Date))).ToList();
                        listReceiptInvoice.ForEach(receipt =>
                        {
                            currentTotalPaid += (receipt.UnitPrice ?? 0) * (receipt.ExchangeRate ?? 1);
                        });

                        //Từ Báo có
                        var newListBankReceiptInvoiceMapping = listBankReceiptInvoiceMapping
                            .Where(x => x.ObjectId == item.CustomerId).ToList();
                        List<Guid> newListBankReceiptInvoiceId = new List<Guid>();
                        newListBankReceiptInvoiceMapping.ForEach(bankReceiptMap =>
                        {
                            if (bankReceiptMap.BankReceiptInvoiceId != null ||
                                bankReceiptMap.BankReceiptInvoiceId != Guid.Empty)
                                newListBankReceiptInvoiceId.Add(bankReceiptMap.BankReceiptInvoiceId);
                        });

                        var listBankReceiptInvoice = listAllBankReceiptInvoice.Where(x =>
                            newListBankReceiptInvoiceId.Contains(x.BankReceiptInvoiceId) &&
                            ((parameter.FromDate == DateTime.MinValue) ||
                             (parameter.FromDate.Date > x.BankReceiptInvoicePaidDate.Date))).ToList();

                        listBankReceiptInvoice.ForEach(bankReceipt =>
                        {
                            currentTotalPaid += bankReceipt.BankReceiptInvoiceAmount ?? 0;
                        });

                        //tổng tiền thu từ phiếu thu và báo có
                        currentTotalPaidBefore = currentTotalPaid;
                        totalPaidBefore += currentTotalPaidBefore;

                        #endregion

                        #region Trong kỳ

                        //Tính tổng đặt hàng
                        decimal currentTotalSalesAfter = 0;
                        var newListOrderAfter = listOrder.Where(x =>
                            x.CustomerId == item.CustomerId &&
                            ((parameter.FromDate == DateTime.MinValue) ||
                             (parameter.FromDate.Date <= x.OrderDate.Date &&
                              parameter.ToDate.Date >= x.OrderDate.Date))).ToList();
                 
                        receivableCustomerEntity.TotalSales = currentTotalSalesAfter;

                        //Tính tổng tiền thu từ phiếu thu và báo có
                        decimal currentTotalPaidAfter = 0;

                        //Từ Phiếu thu
                        var listReceiptInvoiceAfter = listAllReceiptInvoice.Where(x =>
                            newListReceiptInvoiceId.Contains(x.ReceiptInvoiceId) &&
                            ((parameter.FromDate == DateTime.MinValue) ||
                             (parameter.FromDate.Date <= x.ReceiptDate.Date &&
                              parameter.ToDate.Date >= x.ReceiptDate.Date))).ToList();
                        listReceiptInvoiceAfter.ForEach(receipt =>
                        {
                            currentTotalPaidAfter += (receipt.UnitPrice ?? 0) * (receipt.ExchangeRate ?? 1);
                        });

                        //Từ Báo có
                        var listBankReceiptInvoiceAfter = listAllBankReceiptInvoice.Where(x =>
                            newListBankReceiptInvoiceId.Contains(x.BankReceiptInvoiceId) &&
                            ((parameter.FromDate == DateTime.MinValue) ||
                             (parameter.FromDate.Date <= x.BankReceiptInvoicePaidDate.Date &&
                              parameter.ToDate.Date >= x.BankReceiptInvoicePaidDate.Date))).ToList();
                        listBankReceiptInvoiceAfter.ForEach(bankReceipt =>
                        {
                            currentTotalPaidAfter += bankReceipt.BankReceiptInvoiceAmount ?? 0;
                        });

                        //tổng tiền thu từ phiếu thu và báo có
                        receivableCustomerEntity.TotalPaid = currentTotalPaidAfter;

                        #endregion

                        //Lấy ngày thanh toán gần nhất
                        DateTime? currentNearestTransaction;

                        //Của phiếu thu
                        var date1 =
                            listAllReceiptInvoice.Where(x =>
                                    newListReceiptInvoiceId.Contains(x.ReceiptInvoiceId) &&
                                    ((parameter.FromDate == DateTime.MinValue) ||
                                     (parameter.FromDate.Date <= x.ReceiptDate.Date &&
                                      parameter.ToDate.Date >= x.ReceiptDate.Date)))
                                .OrderByDescending(x => x.ReceiptDate)
                                .FirstOrDefault() != null
                                ? listAllReceiptInvoice.Where(x =>
                                        newListReceiptInvoiceId.Contains(x.ReceiptInvoiceId) &&
                                        ((parameter.FromDate == DateTime.MinValue) ||
                                         (parameter.FromDate.Date <= x.ReceiptDate.Date &&
                                          parameter.ToDate.Date >= x.ReceiptDate.Date)))
                                    .OrderByDescending(x => x.ReceiptDate).FirstOrDefault().ReceiptDate
                                : DateTime.MinValue;

                        //Của báo có
                        var date2 =
                            listAllBankReceiptInvoice.Where(x =>
                                    newListBankReceiptInvoiceId.Contains(x.BankReceiptInvoiceId) &&
                                    ((parameter.FromDate == DateTime.MinValue) ||
                                     (parameter.FromDate.Date <= x.BankReceiptInvoicePaidDate.Date &&
                                      parameter.ToDate.Date >= x.BankReceiptInvoicePaidDate.Date)))
                                .OrderByDescending(x => x.BankReceiptInvoicePaidDate).FirstOrDefault() != null
                                ? listAllBankReceiptInvoice.Where(x =>
                                        newListBankReceiptInvoiceId.Contains(x.BankReceiptInvoiceId) &&
                                        ((parameter.FromDate == DateTime.MinValue) ||
                                         (parameter.FromDate.Date <= x.BankReceiptInvoicePaidDate.Date &&
                                          parameter.ToDate.Date >= x.BankReceiptInvoicePaidDate.Date)))
                                    .OrderByDescending(x => x.BankReceiptInvoicePaidDate).FirstOrDefault()
                                    .BankReceiptInvoicePaidDate
                                : DateTime.MinValue;

                        if (date1 != DateTime.MinValue && date2 != DateTime.MinValue)
                        {
                            currentNearestTransaction = date1 > date2 ? date1 : date2;
                        }
                        else if (date1 == DateTime.MinValue && date2 != DateTime.MinValue)
                        {
                            currentNearestTransaction = date2;
                        }
                        else if (date1 != DateTime.MinValue && date2 == DateTime.MinValue)
                        {
                            currentNearestTransaction = date1;
                        }
                        else
                        {
                            currentNearestTransaction = null;
                        }

                        receivableCustomerEntity.NearestTransaction = currentNearestTransaction;

                        receivableCustomerEntity.TotalReceipt =
                            (currentTotalSalesBefore - currentTotalPaidBefore) +
                            (receivableCustomerEntity.TotalSales - receivableCustomerEntity.TotalPaid);

                        receivableCustomerReport.Add(receivableCustomerEntity);
                    }
                    else
                    {
                        #region Một kỳ

                        //Tính tổng đặt hàng
                        decimal currentTotalSalesAfter = 0;
                        var newListOrderAfter = listOrder.Where(x =>
                            x.CustomerId == item.CustomerId &&
                            ((parameter.FromDate == DateTime.MinValue) ||
                             (parameter.FromDate.Date <= x.OrderDate.Date &&
                              parameter.ToDate.Date >= x.OrderDate.Date))).ToList();
                       
                        receivableCustomerEntity.TotalSales = currentTotalSalesAfter;

                        //Tính tổng tiền thu từ phiếu thu và báo có
                        decimal currentTotalPaidAfter = 0;

                        //Từ Phiếu thu
                        var newListReceiptInvoiceMapping = listReceiptInvoiceMapping
                            .Where(x => x.ObjectId == item.CustomerId).ToList();
                        List<Guid> newListReceiptInvoiceId = new List<Guid>();
                        newListReceiptInvoiceMapping.ForEach(receiptMap =>
                        {
                            if (receiptMap.ReceiptInvoiceId != null || receiptMap.ReceiptInvoiceId != Guid.Empty)
                                newListReceiptInvoiceId.Add(receiptMap.ReceiptInvoiceId);
                        });
                        var listReceiptInvoiceAfter = listAllReceiptInvoice.Where(x =>
                            newListReceiptInvoiceId.Contains(x.ReceiptInvoiceId) &&
                            ((parameter.FromDate == DateTime.MinValue) ||
                             (parameter.FromDate.Date <= x.ReceiptDate.Date &&
                              parameter.ToDate.Date >= x.ReceiptDate.Date))).ToList();
                        listReceiptInvoiceAfter.ForEach(receipt =>
                        {
                            currentTotalPaidAfter += (receipt.UnitPrice ?? 0) * (receipt.ExchangeRate ?? 1);
                        });

                        //Từ Báo có
                        var newListBankReceiptInvoiceMapping = listBankReceiptInvoiceMapping
                            .Where(x => x.ObjectId == item.CustomerId).ToList();
                        List<Guid> newListBankReceiptInvoiceId = new List<Guid>();
                        newListBankReceiptInvoiceMapping.ForEach(bankReceiptMap =>
                        {
                            if (bankReceiptMap.BankReceiptInvoiceId != null ||
                                bankReceiptMap.BankReceiptInvoiceId != Guid.Empty)
                                newListBankReceiptInvoiceId.Add(bankReceiptMap.BankReceiptInvoiceId);
                        });
                        var listBankReceiptInvoiceAfter = listAllBankReceiptInvoice.Where(x =>
                            newListBankReceiptInvoiceId.Contains(x.BankReceiptInvoiceId) &&
                            ((parameter.FromDate == DateTime.MinValue) ||
                             (parameter.FromDate.Date <= x.BankReceiptInvoicePaidDate.Date &&
                              parameter.ToDate.Date >= x.BankReceiptInvoicePaidDate.Date))).ToList();
                        listBankReceiptInvoiceAfter.ForEach(bankReceipt =>
                        {
                            currentTotalPaidAfter += bankReceipt.BankReceiptInvoiceAmount ?? 0;
                        });

                        //Lấy ngày thanh toán gần nhất
                        DateTime? currentNearestTransaction;
                        //Của phiếu thu
                        var date1 =
                            listReceiptInvoiceAfter.OrderByDescending(x => x.ReceiptDate).FirstOrDefault() != null
                                ? listReceiptInvoiceAfter.OrderByDescending(x => x.ReceiptDate).FirstOrDefault()
                                    .ReceiptDate
                                : DateTime.MinValue;
                        //Của báo có
                        var date2 =
                            listBankReceiptInvoiceAfter.OrderByDescending(x => x.BankReceiptInvoicePaidDate)
                                .FirstOrDefault() != null
                                ? listBankReceiptInvoiceAfter.OrderByDescending(x => x.BankReceiptInvoicePaidDate)
                                    .FirstOrDefault().BankReceiptInvoicePaidDate
                                : DateTime.MinValue;
                        if (date1 != DateTime.MinValue && date2 != DateTime.MinValue)
                        {
                            currentNearestTransaction = date1 > date2 ? date1 : date2;
                        }
                        else if (date1 == DateTime.MinValue && date2 != DateTime.MinValue)
                        {
                            currentNearestTransaction = date2;
                        }
                        else if (date1 != DateTime.MinValue && date2 == DateTime.MinValue)
                        {
                            currentNearestTransaction = date1;
                        }
                        else
                        {
                            currentNearestTransaction = null;
                        }

                        receivableCustomerEntity.NearestTransaction = currentNearestTransaction;

                        //tổng tiền thu từ phiếu thu và báo có
                        receivableCustomerEntity.TotalPaid = currentTotalPaidAfter;

                        #endregion

                        receivableCustomerEntity.TotalReceipt =
                            (receivableCustomerEntity.TotalSales - receivableCustomerEntity.TotalPaid);

                        receivableCustomerReport.Add(receivableCustomerEntity);
                    }
                });

                //Tính tổng doanh thu trong kỳ của tất cả khách hàng trong kỳ
                totalPurchase = receivableCustomerReport.Sum(x => x.TotalSales).Value;

                //Tính tổng đã thanh toán trong kỳ của tất cả khách hàng trong kỳ
                totalPaid = receivableCustomerReport.Sum(x => x.TotalPaid).Value;

                //Tính tổng còn phải thu của tất cả khách hàng
                totalReceipt = constBalance + (totalSalesBefore - totalPaidBefore) + (totalPurchase - totalPaid);

                //order by NearestTransaction
                var newList = receivableCustomerReport
                    .Where(t => t.TotalReceipt != 0 || t.TotalPaid != 0 || t.TotalSales != 0)
                    .OrderByDescending(x => x.TotalReceipt).ToList();

                return new GetReceivableCustomerReportResults
                {
                    Status = true,
                    ReceivableCustomerReport = newList,
                    TotalPurchase = totalPurchase,
                    TotalPaid = totalPaid,
                    TotalReceipt = totalReceipt
                };
            }
            catch (Exception ex)
            {
                return new GetReceivableCustomerReportResults
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }

        public GetReceivableCustomerDetailResults GetReceivableCustomerDetail(GetReceivableCustomerDetailParameter parameter)
        {
            // Get list Order Status Id
            //var inprogressId = context.OrderStatus.FirstOrDefault(o => o.OrderStatusCode == OrderStatus.InProgress)
            //    ?.OrderStatusId;
            //var paidId = context.OrderStatus.FirstOrDefault(o => o.OrderStatusCode == OrderStatus.Paid)
            //    ?.OrderStatusId;
            //var deliveredId = context.OrderStatus.FirstOrDefault(o => o.OrderStatusCode == OrderStatus.Delivered)
            //    ?.OrderStatusId;
            //var completedId = context.OrderStatus.FirstOrDefault(o => o.OrderStatusCode == OrderStatus.Completed)
            //    ?.OrderStatusId;

            #region Lấy trạng thái đơn hàng tính tổng đơn hàng theo system parameter
            var orderStatusCode = context.SystemParameter.FirstOrDefault(f => f.SystemKey == "OrderStatus")?.SystemValueString ?? "";
            var listOrderStatusCode = orderStatusCode.Split(';').ToList().Select(w => w.Trim().ToUpper()).ToList();
            var listOrderStatusId = context.OrderStatus.Where(w => listOrderStatusCode.Contains(w.OrderStatusCode)).Select(w => w.OrderStatusId).ToList();
            #endregion

            // Get Vendor Order List (Danh sách đơn hàng trong kỳ)
            var customerOrderList = (from c in context.Customer
                                     join co in context.CustomerOrder on c.CustomerId equals co.CustomerId
                                     where (parameter.FromDate == DateTime.MinValue || co.OrderDate.Date >= parameter.FromDate.Date)
                                           && (parameter.ToDate == DateTime.MinValue || co.OrderDate.Date <= parameter.ToDate.Date)
                                           && co.CustomerId == parameter.CustomerId
                                           //&& (co.StatusId == inprogressId || co.StatusId == paidId || co.StatusId == deliveredId || co.StatusId == completedId)
                                     select new ReceivableCustomerEntityModel
                                     {
                                         CustomerId = co.CustomerId.Value,
                                         CreateDateOrder = co.OrderDate,
                                         OrderCode = co.OrderCode,
                                         CreatedBy = co.CreatedById,
                                         CustomerOrderId = co.OrderId
                                     }).OrderBy(c => c.CreateDateOrder).ToList();

            // Nợ phát sinh trong kỳ
            var totalValueOrder = customerOrderList.Sum(v => v.OrderValue);

            #region Lấy ra tên sản phẩm trong đơn hàng
            // Get list product in order
            var productList = (from p in context.Product
                               join cod in context.CustomerOrderDetail on p.ProductId equals cod.ProductId
                               join c in context.CustomerOrder on cod.OrderId equals c.OrderId
                               where c.CustomerId == parameter.CustomerId
                                     && (parameter.FromDate == DateTime.MinValue ||
                                         c.OrderDate.Date >= parameter.FromDate.Date)
                                     && (parameter.ToDate == DateTime.MinValue ||
                                         c.OrderDate.Date <= parameter.ToDate.Date)
                                          //&& (c.StatusId == inprogressId || c.StatusId == paidId
                                          //    || c.StatusId == deliveredId || c.StatusId == completedId)
                               select new ReceivableCustomerEntityModel
                               {
                                   CustomerId = c.CustomerId.Value,
                                   ProductId = p.ProductId,
                                   OrderName = p.ProductName,
                                   CreateDateOrder = c.OrderDate,
                                   OrderCode = c.OrderCode,
                                   CreatedBy = c.CreatedById,
                                   CustomerOrderId = c.OrderId
                               }).ToList();

            var data = new List<ReceivableCustomerEntityModel>();
            data.AddRange(customerOrderList);
            data.AddRange(productList);
            var newData = new List<ReceivableCustomerEntityModel>();

            //Lấy tên các product trong đơn hàng
            foreach (var order in data)
            {
                // Check order list to add product name 
                var orderList = newData.FirstOrDefault(v => v.CustomerOrderId == order.CustomerOrderId);
                if (orderList != null)
                {
                    if (orderList.OrderName == null)
                    {
                        orderList.OrderName = order.OrderName;
                    }
                    else
                    {
                        orderList.OrderName = orderList.OrderName + ", " + order.OrderName;
                    }
                }
                else
                {
                    newData.Add(new ReceivableCustomerEntityModel
                    {
                        CustomerId = order.CustomerId,
                        OrderCode = order.OrderCode,
                        OrderName = order.OrderName,
                        CreatedByName = context.Employee.FirstOrDefault(e => e.EmployeeId == context.User.FirstOrDefault(u =>
                                        u.UserId == order.CreatedBy).EmployeeId)?.EmployeeName,
                        CreateDateOrder = order.CreateDateOrder,
                        OrderValue = order.OrderValue,
                        CustomerOrderId = order.CustomerOrderId
                    });
                }
            }
            #endregion

            // Get receipt cash list (Danh sách phiếu thu trong kỳ)
            var receiptsCashList = (from r in context.ReceiptInvoice
                                    join rom in context.ReceiptInvoiceMapping on r.ReceiptInvoiceId equals rom.ReceiptInvoiceId
                                    join c in context.Customer on rom.ObjectId equals c.CustomerId
                                    where c.CustomerId == parameter.CustomerId
                                          && (parameter.FromDate == DateTime.MinValue ||
                                              r.ReceiptDate.Date >= parameter.FromDate.Date)
                                          && (parameter.ToDate == DateTime.MinValue ||
                                              r.ReceiptDate.Date <= parameter.ToDate.Date)
                                    select new ReceivableCustomerEntityModel
                                    {
                                        CreateDateReceiptInvoice = r.ReceiptDate,
                                        ReceiptInvoiceValue = r.UnitPrice * (r.ExchangeRate ?? 1),
                                        DescriptionReceipt = r.ReceiptInvoiceDetail,
                                        ReceiptCode = r.ReceiptInvoiceCode,
                                        CreatedBy = r.CreatedById,
                                        ReceiptId = r.ReceiptInvoiceId,
                                        Router = "PC"
                                    }).ToList();

            // Get receipt bank list (Danh sách báo có trong kỳ)
            var receiptsBankList = (from rb in context.BankReceiptInvoice
                                    join rom in context.BankReceiptInvoiceMapping on rb.BankReceiptInvoiceId equals rom.BankReceiptInvoiceId
                                    join c in context.Customer on rom.ObjectId equals c.CustomerId
                                    where c.CustomerId == parameter.CustomerId
                                          && (parameter.FromDate == DateTime.MinValue ||
                                              rb.BankReceiptInvoicePaidDate.Date >= parameter.FromDate.Date)
                                          && (parameter.ToDate == DateTime.MinValue ||
                                              rb.BankReceiptInvoicePaidDate.Date <= parameter.ToDate.Date)
                                    select new ReceivableCustomerEntityModel
                                    {
                                        CreateDateReceiptInvoice = rb.BankReceiptInvoicePaidDate,
                                        ReceiptInvoiceValue = rb.BankReceiptInvoiceAmount,
                                        DescriptionReceipt = rb.BankReceiptInvoiceDetail,
                                        ReceiptCode = rb.BankReceiptInvoiceCode,
                                        CreatedBy = rb.CreatedById,
                                        ReceiptId = rb.BankReceiptInvoiceId,
                                        Router = "BC"
                                    }).ToList();

            var receiptsList = new List<ReceivableCustomerEntityModel>();
            receiptsList.AddRange(receiptsBankList);
            receiptsList.AddRange(receiptsCashList);

            // Thanh toán trong kỳ
            var totalValueReceipt = receiptsList.Sum(v => v.ReceiptInvoiceValue);

            // Lấy tên người tạo phiếu
            receiptsList.ForEach(x =>
            x.CreatedByName = context.Employee.FirstOrDefault(e => e.EmployeeId ==
            context.User.FirstOrDefault(u => u.UserId == x.CreatedBy).EmployeeId)?.EmployeeName);

            // Get customer name
            var customer = context.Customer.FirstOrDefault(c => c.CustomerId == parameter.CustomerId);
            var customerContactId = context.Contact.FirstOrDefault(c => c.ObjectId == customer.CustomerId && c.ObjectType == "CUS").ContactId;  //add by Giang
            var customerName = customer?.CustomerCode + " - " + customer?.CustomerName;

            // Danh sách đơn hàng kỳ trước
            var customerOrder = context.CustomerOrder.Where(c =>
                c.CustomerId == parameter.CustomerId && c.OrderDate.Date < parameter.FromDate.Date ).ToList();

            // Danh sách phiếu thu kỳ trước
            var receiptCashBefore = (from r in context.ReceiptInvoice
                                     join rim in context.ReceiptInvoiceMapping on r.ReceiptInvoiceId equals rim.ReceiptInvoiceId
                                     where r.CreatedDate.Date < parameter.FromDate.Date && rim.ObjectId == parameter.CustomerId
                                     select new ReceivableCustomerEntityModel
                                     {
                                         ReceiptInvoiceValue = r.UnitPrice * (r.ExchangeRate ?? 1)
                                     }).ToList();


            // Danh sách báo có kỳ trước
            var receiptBankBefore = (from r in context.BankReceiptInvoice
                                     join rim in context.BankReceiptInvoiceMapping on r.BankReceiptInvoiceId equals rim.BankReceiptInvoiceId
                                     where r.CreatedDate.Date < parameter.FromDate.Date && rim.ObjectId == parameter.CustomerId
                                     select new ReceivableCustomerEntityModel
                                     {
                                         ReceiptInvoiceValue = r.BankReceiptInvoiceAmount
                                     }).ToList();

            var receiptBefore = new List<ReceivableCustomerEntityModel>();
            receiptBefore.AddRange(receiptCashBefore);
            receiptBefore.AddRange(receiptBankBefore);

            // Nợ phát sinh kỳ trước
            decimal totalBefore = 0;

          

            // Dư nợ đầu kỳ
            var totalReceivableBefore = totalBefore - receiptBefore.Sum(r => r.ReceiptInvoiceValue);

            // Get receivable in period
            var totalReceivableInPeriod = customerOrderList.Sum(v => v.OrderValue) - receiptsList.Sum(r => r.ReceiptInvoiceValue);

            // Dư nợ cuối kỳ
            var totalReceivable = totalValueOrder - totalValueReceipt + totalReceivableBefore;

            return new GetReceivableCustomerDetailResults
            {
                Status = true,
                ReceivableCustomerDetail = newData,
                ReceiptsList = receiptsList.OrderBy(c => c.CreateDateReceiptInvoice).ToList(),
                CustomerName = customerName,
                CustomerContactId = customerContactId,  //add by Giang
                TotalReceivable = totalReceivable,  //Dư nợ cuối kỳ
                TotalReceivableBefore = totalReceivableBefore,  //Dư nợ đầu kỳ
                TotalReceivableInPeriod = totalReceivableInPeriod,
                TotalPurchaseProduct = totalValueOrder, //Nợ phát sinh trong kỳ
                TotalReceipt = totalValueReceipt    //Thanh toán trong kỳ
            };
        }

        private decimal CalculatorTotalPurchaseProduct(decimal? amount, bool? discountType, decimal? discountValue)
        {
            decimal result = 0;

            amount = amount ?? 0;
            discountType = discountType == null ? false : discountType;
            discountValue = discountValue ?? 0;

            if (discountType.Value)
            {
                //Chiết khấu được tính theo %
                result = amount.Value - (amount.Value * discountValue.Value) / 100;
            }
            else
            {
                //Chiết khấu được tính theo tiền mặt
                result = amount.Value - discountValue.Value;
            }

            return result;
        }

        public ExportExcelReceivableReportResult ExportExcelReceivableReport(ExportExcelReceivableReportParameter parameter)
        {
            string rootFolder = _hostingEnvironment.WebRootPath + "\\ExcelTemplate";
            string fileName = @"ExcelTemplate.xlsx";

            FileInfo file = new FileInfo(Path.Combine(rootFolder, fileName));

            using (ExcelPackage package = new ExcelPackage(file))
            {
                List<ReceivableCustomerEntityModel> lst = parameter.ReceivableCustomerDetail;
                List<ReceivableCustomerEntityModel> lst2 = parameter.ReceiptsList;

                var customer = context.Customer.FirstOrDefault(c => c.CustomerId == parameter.CustomerId);
                var customerName = customer?.CustomerName;
                var customerCode = customer?.CustomerCode;
                var currencyUnitId = context.Category.FirstOrDefault(ct => ct.CategoryCode == "VND")?.CategoryId;

                ExcelWorksheet worksheet = package.Workbook.Worksheets[1];
                worksheet.Name = customerName;
                //ExcelWorksheet worksheet = package.Workbook.Worksheets.Add("Customer");
                int totalRows = lst != null ? lst.Count() : 0;
                int totalRows2 = lst2 != null ? lst2.Count() : 0;

                var filename = "CNKH_" + customerCode + "_" + parameter.FromDate.Value.ToString("ddMMyy") + "_" + parameter.ToDate.Value.ToString("ddMMyy");

                worksheet.Cells[3, 1].Value = "TỔNG HỢP CÔNG NỢ KHÁCH HÀNG " + customerName.ToUpper();
                worksheet.Cells[4, 2].Value = parameter.FromDate.Value.ToString("dd/MM/yyyy");
                worksheet.Cells[4, 4].Value = parameter.ToDate.Value.ToString("dd/MM/yyyy");
                worksheet.Cells[6, 6].Value = parameter.TotalReceivableBefore;

                worksheet.InsertRow(9, totalRows);
                if (totalRows > 0)
                {
                    int i = 0;
                    int currentCount = 0;
                    for (int row = 9; row <= totalRows + 10; row++)
                    {
                        var cusOrderDetail = context.CustomerOrderDetail.Where(co => co.OrderId == lst[i].CustomerOrderId).ToList();
                        var cusOrderDetailCount = cusOrderDetail.Count;
                        int l = cusOrderDetailCount;

                        for (int k = 0; k < cusOrderDetailCount; k++)
                        {
                            var currentRow = row + cusOrderDetailCount - l;
                            worksheet.Cells[currentRow, 1].Value = lst[i].CreateDateOrder.Value.ToString("dd/MM/yyyy");
                            worksheet.Cells[currentRow, 2, currentRow, 3].Merge = true;
                            worksheet.Cells[currentRow, 2].Value =
                                cusOrderDetail[k].ProductId != null ? context.Product.FirstOrDefault(p => p.ProductId == cusOrderDetail[k].ProductId).ProductName : cusOrderDetail[k].Description;
                            worksheet.Cells[currentRow, 4].Value = cusOrderDetail[k].Quantity;
                            worksheet.Cells[currentRow, 5].Value =
                                cusOrderDetail[k].CurrencyUnit != currencyUnitId ? cusOrderDetail[k].UnitPrice * cusOrderDetail[k].ExchangeRate : cusOrderDetail[k].UnitPrice;
                            worksheet.Cells[currentRow, 6].Value = lst[i].OrderValue;
                            l--;

                            for (int j = 1; j <= 6; j++)
                            {
                                worksheet.Cells[currentRow, j].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                            }
                        }

                        worksheet.Cells[row, 1, row + cusOrderDetailCount - 1, 1].Merge = true;
                        worksheet.Cells[row, 1, row + cusOrderDetailCount - 1, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        worksheet.Cells[row, 6, row + cusOrderDetailCount - 1, 6].Merge = true;
                        worksheet.Cells[row, 6, row + cusOrderDetailCount - 1, 6].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                        if (cusOrderDetailCount > 1)
                        {
                            worksheet.InsertRow(9 + totalRows, cusOrderDetailCount - 1);
                            totalRows += cusOrderDetailCount - 1;
                            currentCount += cusOrderDetailCount - 1;
                            row += cusOrderDetailCount - 1;
                        }

                        i++;
                        currentCount++;
                        if (currentCount == totalRows)
                        {
                            break;
                        }
                    }
                }
                var sum1 = lst.Sum(l => l.OrderValue);
                worksheet.Cells[9 + totalRows, 6].Value = sum1;

                worksheet.InsertRow(13 + totalRows, totalRows2);
                if (totalRows2 > 0)
                {
                    int k = 0;
                    for (int row = 13 + totalRows; row <= totalRows + totalRows2 + 14; row++)
                    {
                        worksheet.Cells[row, 1].Value = lst2[k].CreateDateReceiptInvoice.Value.ToString("dd/MM/yyyy");
                        worksheet.Cells[row, 2, row, 5].Merge = true;
                        worksheet.Cells[row, 2].Value = lst2[k].DescriptionReceipt;
                        worksheet.Cells[row, 6].Value = lst2[k].ReceiptInvoiceValue;

                        for (int j = 1; j <= 6; j++)
                        {
                            worksheet.Cells[row, j].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                        }

                        k++;
                        if (k == totalRows2)
                        {
                            break;
                        }
                    }
                }
                var sum2 = lst2.Sum(l => l.ReceiptInvoiceValue);
                var sum = parameter.TotalReceivableBefore + sum1 - sum2;
                worksheet.Cells[13 + totalRows + totalRows2, 6].Value = sum2;
                if (sum > 0)
                {
                    worksheet.Cells[15 + totalRows + totalRows2, 6].Value = sum;
                    worksheet.Cells[16 + totalRows + totalRows2, 2].Value = MoneyHelper.Convert(sum.Value);
                    worksheet.Cells[16 + totalRows + totalRows2, 2].Style.Font.Italic = true;
                }
                else
                {
                    worksheet.InsertRow(17 + totalRows + totalRows2, 2);
                    worksheet.Cells[15 + totalRows + totalRows2, 6].Value = 0;

                    worksheet.Cells[16 + totalRows + totalRows2, 2].Value = "Không đồng";
                    worksheet.Cells[16 + totalRows + totalRows2, 2].Style.Font.Italic = true;

                    worksheet.Cells[17 + totalRows + totalRows2, 1].Value = "Khách hàng trả trước (VND): ";
                    worksheet.Cells[17 + totalRows + totalRows2, 1].Style.Font.Bold = true;
                    worksheet.Row(17 + totalRows + totalRows2).Height = 20;
                    worksheet.Cells[17 + totalRows + totalRows2, 6].Value = 0 - sum;
                    worksheet.Cells[17 + totalRows + totalRows2, 6].Style.Font.Bold = true;

                    worksheet.Cells[18 + totalRows + totalRows2, 1].Value = "Bằng chữ: ";
                    worksheet.Cells[18 + totalRows + totalRows2, 1].Style.Font.Bold = true;
                    worksheet.Row(18 + totalRows + totalRows2).Height = 20;
                    worksheet.Cells[18 + totalRows + totalRows2, 2].Value = MoneyHelper.Convert((0 - sum).Value);
                    worksheet.Cells[18 + totalRows + totalRows2, 2].Style.Font.Italic = true;
                }

                string newFilePath = Path.Combine(rootFolder, @"ExportedExcel.xlsx");
                package.SaveAs(new FileInfo(newFilePath));
                //byte[] data = package.GetAsByteArray();
                //string base64 = Convert.ToBase64String(data);
                byte[] data = File.ReadAllBytes(newFilePath);
                File.Delete(newFilePath);
                return new ExportExcelReceivableReportResult()
                {
                    ExcelFile = data,
                    Status = true,
                    CustomerName = filename
                };
            }
        }

        public SalesReportResult SearchSalesReport(SalesReportParameter parameter)
        {
            var from = parameter.FromMonth.Value;
            var to = parameter.ToMonth.Value;
            var firstMonth = from.Month;
            var firstyear = from.Year;
            var totalMonths = Math.Abs(((from.Year - to.Year) * 12) + from.Month - to.Month) + 1;
            var listOrderStatusCode = context.SystemParameter.FirstOrDefault(x => x.SystemKey == "OrderStatus")
                ?.SystemValueString.Split(';').ToList();
            var listPurchaseOrderStatusCode = context.SystemParameter
                .FirstOrDefault(x => x.SystemKey == "PurchaseOrderStatus")
                ?.SystemValueString.Split(';').ToList();
            var orderStatusLst = context.OrderStatus
                .Where(os => listOrderStatusCode.Contains(os.OrderStatusCode)).Select(y => y.OrderStatusId).ToList();
            var purchaseStatusLst = context.PurchaseOrderStatus
                .Where(os => listPurchaseOrderStatusCode.Contains(os.PurchaseOrderStatusCode))
                .Select(y => y.PurchaseOrderStatusId).ToList();
            var lst = new List<SalesReportEntityModel>();
            decimal totalSaleEachMonth;
            decimal totalCostEachMonth;
            
            decimal totalSale = lst.Sum(l => l.TotalSales);
            decimal totalCost = lst.Sum(l => l.TotalCost);

            return new SalesReportResult()
            {
                Status = true,
                SalesReportList = lst,
                TotalSale = totalSale,
                TotalCost = totalCost
            };
        }

        public GetDataSearchReceivableVendorResult GetDataSearchReceivableVendor(GetDataSearchReceivableVendorParameter parameter)
        {
            var vendor = context.Vendor.OrderBy(c => c.VendorCode).ToList();
            return new GetDataSearchReceivableVendorResult
            {
                Status = vendor.Count > 0,
                Message = "",
                ListVendor = vendor
            };
        }
        public GetMasterDataReportResult GetMasterDataReport(GetMasterDataReportParameter parameter)
        {
            try
            {
                var danhsach_phanhangKH = new List<CategoryEntityModel>();
                var danhsach_nhomKH = new List<CategoryEntityModel>();
                var danhsach_KH = new List<CustomerEntityModel>();
                var danhsach_goidichvu = new List<ServicePacketEntityModel>();
                var danhsach_dichvu = new List<ServicePacketMappingOptionsEntityModel>();

                // Phân hạng kH
                var phanhangKHId = context.CategoryType.Where(w => w.CategoryTypeCode == "CUS_LEVEL" && w.Active == true).FirstOrDefault()?.CategoryTypeId;
                danhsach_phanhangKH = context.Category.Where(w => w.CategoryTypeId == phanhangKHId)
                                        .Select(group => new CategoryEntityModel
                                        {
                                            CategoryId = group.CategoryId,
                                            CategoryName = group.CategoryName,
                                            CategoryCode = group.CategoryCode,
                                        }).OrderBy(lg => lg.CategoryName).ToList();

                // Nhóm kH
                var nhomKHId = context.CategoryType.Where(w => w.CategoryTypeCode == "NHA" && w.Active == true).FirstOrDefault()?.CategoryTypeId;
                danhsach_nhomKH = context.Category.Where(w => w.CategoryTypeId == nhomKHId)
                                        .Select(group => new CategoryEntityModel
                                        {
                                            CategoryId = group.CategoryId,
                                            CategoryName = group.CategoryName,
                                            CategoryCode = group.CategoryCode,
                                        }).OrderBy(lg => lg.CategoryName).ToList();

                // kH                
                danhsach_KH = context.Customer.Where(w => w.Active == true)
                                       .Select(cus => new CustomerEntityModel
                                       {
                                           CustomerId = cus.CustomerId,
                                           CustomerCode = cus.CustomerCode,
                                           CustomerName = cus.CustomerName,
                                       }).OrderBy(lg => lg.CustomerName).ToList();
                // Gói dịch vụ
                danhsach_goidichvu = context.ServicePacket
                                      .Select(item => new ServicePacketEntityModel
                                      {
                                          Id = item.Id,
                                          Name = item.Name,
                                          Stt = item.Stt,
                                      }).OrderBy(lg => lg.Stt).ToList();

                // Gói dịch vụ
                danhsach_dichvu = context.Options
                                       .Select(item => new ServicePacketMappingOptionsEntityModel
                                       {
                                           Id = item.Id,
                                           Name = item.Name
                                       }).OrderBy(lg => lg.Name).ToList();



                return new GetMasterDataReportResult()
                {
                    DanhSach_PhanHangKH = danhsach_phanhangKH,
                    DanhSach_NhomKH = danhsach_nhomKH,
                    DanhSach_KhachHang = danhsach_KH,
                    DanhSach_GoiDichVu = danhsach_goidichvu,
                    DanhSach_DichVu = danhsach_dichvu,
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = "OK",
                };
            }
            catch (Exception e)
            {
                return new GetMasterDataReportResult()
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        public GetReceivableCustomerReportNewResults GetReceivableCustomerReportNew(GetReceivableCustomerReportNewParameter parameter)
        {
            try
            {
                decimal tongDatHang = 0;
                decimal tongThanhToan = 0;
                decimal tongChoThanhToan = 0;
                List<ReceivableCustomerReportModel> receivableCustomerReport = new List<ReceivableCustomerReportModel>();
                if (parameter.ReportType == 1)
                {
                    //Lấy danh sách đơn hàng được tính doanh thu ( "Chờ thanh toán" hoặc "Đã thanh toán")
                    var listCustomerOrder = (from cus in context.Customer.Where(x => x.Active == true
                                                                   && (parameter.KhachHangId == null || parameter.KhachHangId.Count() == 0 || parameter.KhachHangId.Contains(x.CustomerId))
                                                                   && (parameter.NhomKHId == null || parameter.NhomKHId.Count() == 0 || parameter.NhomKHId.Contains(x.CustomerGroupId.Value))
                                                                   && (parameter.PhanHangKHId == null || parameter.PhanHangKHId.Count() == 0 || parameter.PhanHangKHId.Contains(x.PhanHangId.Value))
                                                                   ).ToList()

                                             join c in context.Contact.Where(x => x.ObjectType == "CUS") on cus.CustomerId equals c.ObjectId
                                             into cData
                                             from c in cData.DefaultIfEmpty()

                                             join cusorder_phieubosung_yeucau in context.CustomerOrder.Where(w => (w.StatusOrder == 4 || w.StatusOrder == 5) && w.IsOrderAction == false
                                                     && parameter.FromDate.Date <= w.CreatedDate.Date && w.CreatedDate.Date <= parameter.ToDate.Date
                                                     && (parameter.GoiDichVuId == null || parameter.GoiDichVuId.Count() == 0 || parameter.GoiDichVuId.Contains(w.ServicePacketId.Value))).ToList()
                                                     on cus.CustomerId equals cusorder_phieubosung_yeucau.CustomerId

                                             join phieuhotro in context.CustomerOrder.Where(w => w.IsOrderAction == true).ToList()
                                                on cusorder_phieubosung_yeucau.OrderId equals phieuhotro.ObjectId
                                                into phieuhotroDT
                                             from phieuhotroData in phieuhotroDT.DefaultIfEmpty()

                                             join servicePack in context.ServicePacket on cusorder_phieubosung_yeucau?.ServicePacketId equals servicePack.Id
                                             into serpkDT
                                             from servicePack in serpkDT.DefaultIfEmpty()

                                             join cate in context.Category on cus.PhanHangId equals cate.CategoryId
                                             into cateDT
                                             from cate in cateDT.DefaultIfEmpty()

                                             select new CustomerOrderModel
                                             {
                                                 CustomerName = cus.CustomerName,//1. Tên KH
                                                 CustomerCode = cus.CustomerCode,
                                                 ContactId = c.ContactId,
                                                 CustomerId = cus.CustomerId,
                                                 OrderActionId = phieuhotroData != null ? phieuhotroData.OrderId : Guid.Empty,

                                                 OrderId = cusorder_phieubosung_yeucau?.OrderId,
                                                 StatusOrder = cusorder_phieubosung_yeucau?.StatusOrder,
                                                 CreatedDate = cusorder_phieubosung_yeucau?.CreatedDate,
                                                 GoiDichVu = servicePack == null ? null : servicePack?.Name, // 6. Gói dịch vụ
                                                 PhanHang = cate?.CategoryName,
                                                 PhieuDatDV = cusorder_phieubosung_yeucau != null ? cusorder_phieubosung_yeucau.OrderCode : null, // 4. Phiếu đặt dịch vụ/ bổ sung
                                                 NgayThanhToan = DateTime.Now.Date.ToString("yyyy-MM-dd"),
                                                 PhieuHoTroDV = phieuhotroData != null ? phieuhotroData.OrderCode : null,    // 5. Phiếu hỗ trợ dịch vụ
                                                 NgayDatDV = cusorder_phieubosung_yeucau != null && (cusorder_phieubosung_yeucau.IsOrderAction != true) ? cusorder_phieubosung_yeucau.CreatedDate.ToString("yyyy-MM-dd") : "",   // 3. Ngày đặt
                                                 TrangThai = cusorder_phieubosung_yeucau != null ? GeneralList.GetTrangThais("CustomerOrder").ToList().FirstOrDefault(x => x.Value == cusorder_phieubosung_yeucau.StatusOrder.Value)?.Name : null, // 9. Trạng thái

                                                 TongTien = cusorder_phieubosung_yeucau != null ? cusorder_phieubosung_yeucau.Amount : 0,
                                                 DichVu = cusorder_phieubosung_yeucau != null ? string.Join(",<br>", (from cusOrder_DichVu in context.CustomerOrderDetail.Where(x => x.OrderId == cusorder_phieubosung_yeucau.OrderId).ToList()
                                                                                                                      join packet in context.ServicePacketMappingOptions.ToList() on cusOrder_DichVu.OptionId equals packet.Id
                                                                                                                      into packetDT
                                                                                                                      from packetData in packetDT.DefaultIfEmpty()

                                                                                                                      join option in context.Options.ToList() on packetData.OptionId equals option.Id
                                                                                                                       into optionDT
                                                                                                                      from optionData in optionDT.DefaultIfEmpty()
                                                                                                                      select optionData.Name
                                                            ).Distinct().ToList()) : "",
                                                 DichVuId = (from cusOrder_DichVu in context.CustomerOrderDetail.Where(x => x.OrderId == cusorder_phieubosung_yeucau.OrderId).ToList()
                                                             join packet in context.ServicePacketMappingOptions.ToList() on cusOrder_DichVu.OptionId equals packet.Id
                                                             into packetDT
                                                             from packetData in packetDT.DefaultIfEmpty()
                                                             join option in context.Options.Where(x => parameter.DichVuId == null || parameter.DichVuId.Count() == 0 || parameter.DichVuId.Contains(x.Id)).ToList() on packetData.OptionId equals option.Id
                                                             select option.Id).ToList()

                                             }
                                            ).Where(x => x.TongTien > 0).ToList();

                    if (parameter.DichVuId.Count() != 0)
                    {
                        listCustomerOrder = listCustomerOrder.Where(x => x.DichVuId.Count() > 0).ToList();
                    }
                    //Tổng đặt hàng
                    tongDatHang = listCustomerOrder.Sum(x => x.TongTien).Value;

                    //Tổng thanh toán
                    tongThanhToan = listCustomerOrder.Where(x => x.StatusOrder == 5).ToList().Sum(x => x.TongTien).Value;

                    //Tổng chờ thanh toán
                    tongChoThanhToan = tongDatHang - tongThanhToan;

                    receivableCustomerReport.AddRange(listCustomerOrder.Select(x => new ReceivableCustomerReportModel
                    {
                        OrderId = x.OrderId,
                        VendorOrderId = x.VendorOrderId,
                        OrderActionId = x.OrderActionId,
                        CustomerId = x.CustomerId,
                        ContactId = x.ContactId,
                        TenKH = x.CustomerName,
                        MaKH = x.CustomerCode,
                        NgayDatDV = x.NgayDatDV,
                        PhieuDatDV = x.PhieuDatDV,
                        PhieuHoTroDV = x.PhieuHoTroDV,
                        GoiDichVu = x.GoiDichVu,
                        DichVu = x.DichVu,
                        TrangThai = x.TrangThai,
                        TongTien = x.TongTien,
                        StatusOrder = x.StatusOrder,
                        NgayThanhToan = x.NgayThanhToan,
                        PhanHang = x.PhanHang,
                    }).ToList());
                }
                else
                {
                    var listVendorOrder = (from ov in context.VendorOrder.Where(x => (x.StatusId == 2 || x.StatusId == 3 || x.StatusId == 4) && x.VendorOrderType == 2 &&
                                                                                parameter.FromDate.Date <= x.CreatedDate.Date && x.CreatedDate.Date <= parameter.ToDate.Date).ToList()
                                           join oa in context.CustomerOrder.Where(w => w.IsOrderAction == true
                                                         && (parameter.GoiDichVuId == null || parameter.GoiDichVuId.Count() == 0 || parameter.GoiDichVuId.Contains(w.ServicePacketId.Value))).ToList()
                                                    on ov.OrderActionId equals oa.OrderId

                                           join phieuYc in context.CustomerOrder.Where(w => w.IsOrderAction == false).ToList() on oa.ObjectId equals phieuYc.OrderId
                                           into phieuYcData
                                           from phieuYc in phieuYcData.DefaultIfEmpty()

                                           join cus in context.Customer.Where(x => x.Active == true
                                                                       && (parameter.KhachHangId == null || parameter.KhachHangId.Count() == 0 || parameter.KhachHangId.Contains(x.CustomerId))
                                                                       && (parameter.NhomKHId == null || parameter.NhomKHId.Count() == 0 || parameter.NhomKHId.Contains(x.CustomerGroupId.Value))
                                                                       && (parameter.PhanHangKHId == null || parameter.PhanHangKHId.Count() == 0 || parameter.PhanHangKHId.Contains(x.PhanHangId.Value))
                                                                       ).ToList()
                                                    on oa.CustomerId equals cus.CustomerId

                                           join c in context.Contact.Where(x => x.ObjectType == "CUS") on cus.CustomerId equals c.ObjectId
                                           into cData
                                           from c in cData.DefaultIfEmpty()

                                           join servicePack in context.ServicePacket on oa?.ServicePacketId equals servicePack.Id
                                           into serpkDT
                                           from servicePack in serpkDT.DefaultIfEmpty()

                                           join cate in context.Category on cus.PhanHangId equals cate.CategoryId
                                           into cateDT
                                           from cate in cateDT.DefaultIfEmpty()
                                           select new CustomerOrderModel
                                           {
                                               CustomerName = cus.CustomerName,//1. Tên KH
                                               CustomerCode = cus.CustomerCode,
                                               ContactId = c.ContactId,
                                               CustomerId = cus.CustomerId,
                                               OrderId = phieuYc?.OrderId,
                                               OrderActionId = oa?.OrderId,
                                               VendorOrderId = ov?.VendorOrderId,
                                               DonHang = ov.VendorOrderCode,
                                               DonHangId = ov.VendorOrderId,
                                               CreatedDate = ov.CreatedDate,
                                               GoiDichVu = servicePack == null ? null : servicePack?.Name, // 6. Gói dịch vụ                                         
                                               PhieuDatDV = phieuYc != null ? phieuYc.OrderCode : null, // 4. Phiếu đặt dịch vụ/ bổ sung
                                               PhieuHoTroDV = oa != null ? oa.OrderCode : null,    // 5. Phiếu hỗ trợ dịch vụ
                                               PhanHang = cate?.CategoryName,
                                               NgayDatDV = oa != null  ? oa.CreatedDate.ToString("yyyy-MM-dd") : "",
                                               TongTien = ov != null ? context.VendorOrderDetail.Where(x => x.VendorOrderId == ov.VendorOrderId).Sum(x => x.TongTienKhachHangThanhToan) : 0,
                                               DichVu = oa != null ? string.Join(",<br>", (from cusOrder_DichVu in context.CustomerOrderDetail.Where(x => x.OrderId == oa.OrderId).ToList()
                                                                                           join packet in context.ServicePacketMappingOptions.ToList() on cusOrder_DichVu.OptionId equals packet.Id
                                                                                           into packetDT
                                                                                           from packetData in packetDT.DefaultIfEmpty()

                                                                                           join option in context.Options.ToList() on packetData.OptionId equals option.Id
                                                                                            into optionDT
                                                                                           from optionData in optionDT.DefaultIfEmpty()
                                                                                           select optionData.Name
                                                      ).Distinct().ToList()) : "",
                                               DichVuId = (from cusOrder_DichVu in context.CustomerOrderDetail.Where(x => x.OrderId == oa.OrderId).ToList()
                                                           join packet in context.ServicePacketMappingOptions.ToList() on cusOrder_DichVu.OptionId equals packet.Id
                                                           into packetDT
                                                           from packetData in packetDT.DefaultIfEmpty()
                                                           join option in context.Options.Where(x => parameter.DichVuId == null || parameter.DichVuId.Count() == 0 || parameter.DichVuId.Contains(x.Id)).ToList() on packetData.OptionId equals option.Id
                                                           select option.Id).ToList()

                                           }
                                       ).ToList();

                    if (parameter.DichVuId.Count() != 0)
                    {
                        listVendorOrder = listVendorOrder.Where(x => x.DichVuId.Count() > 0).ToList();
                    }
                    //Tổng đặt hàng
                    tongThanhToan = listVendorOrder.Sum(x => x.TongTien).Value;

                    receivableCustomerReport.AddRange(listVendorOrder.Select(x => new ReceivableCustomerReportModel
                    {
                        CustomerId = x.CustomerId,
                        ContactId = x.ContactId,
                        OrderId = x.OrderId,
                        VendorOrderId = x.VendorOrderId,
                        OrderActionId = x.OrderActionId,
                        TenKH = x.CustomerName,
                        MaKH = x.CustomerCode,
                        NgayDatDV = x.NgayDatDV,
                        PhieuDatDV = x.PhieuDatDV,
                        PhieuHoTroDV = x.PhieuHoTroDV,
                        GoiDichVu = x.GoiDichVu,
                        DonHang = x.DonHang,
                        DonHangId = x.DonHangId,
                        DichVu = x.DichVu,
                        TongTien = x.TongTien,
                        PhanHang = x.PhanHang
                    }).ToList());
                }
                return new GetReceivableCustomerReportNewResults
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    ReceivableCustomerReport = receivableCustomerReport.Distinct().ToList(),
                    TongDatHang = tongDatHang,
                    TongThanhToan = tongThanhToan,
                    TongChoThanhToan = tongChoThanhToan
                };
            }
            catch (Exception ex)
            {
                return new GetReceivableCustomerReportNewResults
                {
                    Status = false,
                    Message = ex.Message
                };
            }
        }
        private List<CustomerOrderEntityModel> GetListCustomerOrder(CustomerOrderEntityModel customerOrder, List<CustomerOrderEntityModel> list, List<CustomerOrderEntityModel> listAllCustomerOrder)
        {
            //Tìm ra phiếu yêu cầu bổ sung gán với nó
            var orderExten = listAllCustomerOrder.Where(x => x.IsOrderAction == false && x.ObjectId == customerOrder.OrderId).ToList();
            list.AddRange(orderExten);
            if (orderExten.Count > 0)
            {
                orderExten.ForEach(item =>
                {
                    GetListCustomerOrder(item, list, listAllCustomerOrder);
                });
            }
            return list;
        }
    }
}


