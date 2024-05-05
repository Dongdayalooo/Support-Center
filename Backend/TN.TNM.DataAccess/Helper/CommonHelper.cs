using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases;
using System.Linq;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models.DeXuatXinNghiModel;
using TN.TNM.DataAccess.Models.Employee;
using Microsoft.EntityFrameworkCore.Internal;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using FirebaseAdmin.Messaging;
using System.Net;
using Firebase.Database;
using Firebase.Database.Query;
using TN.TNM.DataAccess.Models.Order;

namespace TN.TNM.DataAccess.Helper
{
    public static class CommonHelper
    {
        public static FirebaseApp credential = null;
        public static FirebaseClient _firebaseClient = new FirebaseClient("https://hello-world-34e33.firebaseio.com");
        private static List<Guid> GetOrganizationChildrenId(TNTN8Context context, Guid id, List<Guid> list)
        {
            var organization = context.Organization.Where(o => o.ParentId == id).ToList();

            organization.ForEach(item =>
            {
                list.Add(item.OrganizationId);
                GetOrganizationChildrenId(context, item.OrganizationId, list);
            });

            return list;
        }
        public static NotificationReceiver GetListEmployeeIdNotifi(TNTN8Context context, CustomerOrder order, NotificationConfiguration notiConfigure, ReportPoint reportPoint, OrderProcess orderProcess)
        {
            var notificationReceiver = new NotificationReceiver();
            var list = new List<Guid>();
            //Nếu tích người tạo phiếu yêu cầu, hoặc KH 
            if (notiConfigure.ServiceRequestMaker == true)
            {
                //Nếu là phiếu yêu cầu
                if (order.OrderType == 1 && orderProcess == null)
                {
                    var userCreate = context.User.FirstOrDefault(x => x.UserId == order.CreatedById);
                    list.Add(userCreate.EmployeeId.Value);

                    //trả về list customerID lấy từ bảng order
                    notificationReceiver.CustomerId = order.CustomerId;
                }
                //Nếu là hỗ trợ
                if (order.OrderType == 2 && orderProcess == null)
                {
                    //Lấy phiếu yêu cầu
                    var customerOrder = context.CustomerOrder.FirstOrDefault(x => x.OrderId == order.ObjectId);
                    var userCreate = context.User.FirstOrDefault(x => x.UserId == customerOrder.CreatedById);
                    list.Add(userCreate.EmployeeId.Value);
                }
            }
            //Nếu tích quản lý dịch vụ
            if (notiConfigure.ServiceManagement == true && (orderProcess != null || order != null))
            {
                //Lấy list quản lý dịch vụ của gói
                var listEmpId = new List<Guid>();
                if (orderProcess != null) listEmpId = context.ManagerPacketService.Where(x => x.PackId == orderProcess.ServicePacketId).Select(x => x.EmployeeId).ToList();
                if (order != null) listEmpId = context.ManagerPacketService.Where(x => x.PackId == order.ServicePacketId).Select(x => x.EmployeeId).ToList();
                list.AddRange(listEmpId);
            }
            //Nếu tích người tạo phiếu hộ trợ dịch vụ
            if (notiConfigure.ServiceSupporter == true && order.IsOrderAction == true && orderProcess == null)
            {
                var userCreate = context.User.FirstOrDefault(x => x.UserId == order.CreatedById);
                if (userCreate != null) list.Add(userCreate.EmployeeId.Value);
            }
            //Nếu tích nhân viên hỗ trợ
            if (notiConfigure.Supporter == true && order.IsOrderAction == true && orderProcess == null)
            {
                var listCustomerOrderTaskId = context.CustomerOrderTask.Where(x => x.OrderActionId == order.OrderId).Select(x => x.Id).ToList();
                var listEmpId = context.OrderTaskMappingEmp.Where(x => listCustomerOrderTaskId.Contains(x.CustomerOrderTaskId)).Select(x => x.EmployeeId).ToList();
                list.AddRange(listEmpId);
            }
            //Nếu tích nhân viên báo cáo
            if (notiConfigure.Reporter == true && order.IsOrderAction == true && orderProcess == null)
            {
                if (reportPoint != null)
                {
                    list.Add(reportPoint.EmpId);
                }
            }
            notificationReceiver.ListEmployeeId = list;
            return notificationReceiver;
        }

        public static bool PushNotificationToDevice(string deviceId, string title, string body, string type, string orderId, bool sos = false) {
            try
            {
                //type 1: order, 2: orderAction, 3: Khác
                if (credential == null)
                {
                    credential = FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.FromFile("private_key.json")
                    });
                }

                var android = new AndroidConfig()
                {
                    Notification = new AndroidNotification()
                    {
                        Sound = "default"
                    }
                };

                var apns = new ApnsConfig()
                {
                    Aps = new Aps()
                    {
                        Sound = "default"
                    }
                };

                if (sos == true)
                {
                    android = new AndroidConfig()
                    {
                        Notification = new AndroidNotification()
                        {
                            ChannelId = "custom-sound",
                            Sound = "khan_cap.mp3"
                        }
                    };

                    apns = new ApnsConfig()
                    {
                        Aps = new Aps()
                        {
                            Sound = "khan_cap.wav"
                        }
                    };
                }

                var message = new Message()
                {
                    Token = deviceId,
                    Data = new Dictionary<string, string>()
                    {
                        {type, orderId}
                    },
                    Notification = new Notification()
                    {
                        Title = title,
                        Body = body
                    },
                    Android = android,
                    Apns = apns
                };

                string response = FirebaseMessaging.DefaultInstance.SendAsync(message).Result;
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public static VendorOrder TinhTienDonHong(VendorOrder vendorOrder, List<VendorOrderDetail> listDetail)
        {

            vendorOrder.TongTienDonHang = 0;
            vendorOrder.TongTienHoaHong = 0;

            decimal totalAmountBeforeVat = 0;
            decimal totalAmountVat = 0;
            decimal totalAmountCost = 0;
            decimal totalAmountBeforeDiscount = 0;
            decimal totalAmountAferDiscount = 0;
            decimal discountPerOrder = 0;
            decimal tongTienCanThanhToanTruoc = 0;
            decimal TotalPayment = 0;
            decimal TotalPaymentLeft = 0;

            decimal tongTienDoanhThu = 0;
            decimal tongTienHoaHong = 0;

            listDetail.ForEach(item => {
                //Nếu đơn hàng KTTN mua
                if (vendorOrder.VendorOrderType == 1)
                {
                    var tongTien = item.Quantity * item.Price;
                    var tienChietKhau = item.ChietKhauId == 1 ? (tongTien * item.GiaTriChietKhau / 100) : item.GiaTriChietKhau;
                    var tongTienSauChietKhau = tongTien - tienChietKhau;
                    var tienThue = tongTienSauChietKhau * item.ThueGtgt / 100;

                    totalAmountBeforeVat += (tongTienSauChietKhau ?? 0);
                    totalAmountVat += (tienThue ?? 0);

                    var tienThanhToanTruoc = item.YeuCauThanhToan == 1 ? ((tongTienSauChietKhau + tienThue) * item.GiaTriThanhToan / 100) : item.GiaTriThanhToan;
                    tongTienCanThanhToanTruoc += (tienThanhToanTruoc ?? 0);
                }
                //Nếu đơn hàng KH thanh toán
                else
                {
                    tongTienHoaHong += (item.TongTienHoaHong ?? 0);
                }
            });

            if (vendorOrder.VendorOrderType == 1)
            {
                //Tính chiết khấu đơn hàng
                if (vendorOrder.DiscountType != null && vendorOrder.DiscountValue != null)
                {
                    discountPerOrder = vendorOrder.DiscountType == 1 ? ((vendorOrder.DiscountValue ?? 0) * totalAmountCost / 100) : (vendorOrder.DiscountValue ?? 0);
                }
                totalAmountCost = totalAmountBeforeVat + totalAmountVat - discountPerOrder;
                vendorOrder.TongTienDonHang = totalAmountCost;
            }
            else
            {
                vendorOrder.TongTienHoaHong = tongTienHoaHong;
            }
            return vendorOrder;
        }

        public static Guid PhanHangKhachHang(Guid customerId, string deviceId, List<CustomerOrder> listOrder, List<CauHinhPhanHangKh> listCauHinh, 
            List<Category> listPhanHangCategory, List<VendorOrderDetail> listVendorOrderDetail, List<CustomerOrder> listOrderNguoiGioiThieu, List<VendorOrderDetail> listOrderDetailNguoiGioiThieu)
        {
            Guid phanHangId = Guid.Empty;
            if (listOrder.Count() > 0)
            {
                var tongDonHang = listOrder.Count();
                var tongDoanhThuKttn = listOrder.Sum(x => x.Amount);
                var tongDoanhThuNcc = listVendorOrderDetail.Sum(x => x.TongTienKhachHangThanhToan);

                var tongDoanhThuKttnNguoiGt = listOrderNguoiGioiThieu.Sum(x => x.Amount);
                var tongDoanhThuNccNguoiGt = listOrderDetailNguoiGioiThieu.Sum(x => x.TongTienKhachHangThanhToan);

                var listCHDieuKienPhanHang = GeneralList.GetTrangThais("DieuKienPhanHangKh").ToList();
                var dieuKienTongDoanhThuKTTN = listCHDieuKienPhanHang.FirstOrDefault(x => x.Value == 2).Value;
                var dieuKienTongDoanhThuNcc = listCHDieuKienPhanHang.FirstOrDefault(x => x.Value == 3).Value;
                var dieuKienTongDonHang = listCHDieuKienPhanHang.FirstOrDefault(x => x.Value == 1).Value;
                var dieuKienTongDoanhThuNccNguoiDuocGioiThieu = listCHDieuKienPhanHang.FirstOrDefault(x => x.Value == 4).Value;
                var dieuKienTongDoanhThuKTTNNguoiDuocGioiThieu = listCHDieuKienPhanHang.FirstOrDefault(x => x.Value == 5).Value;

                var listPhanHangId = new List<Guid>();
                var listPhanHang = listCauHinh.Where(x => x.ParentId == null).ToList();
                listPhanHang.ForEach(phanHang =>
                {
                    var listDieuKien = listCauHinh.Where(x => x.ParentId == phanHang.Id).ToList();
                    var listAccept = true;
                    listDieuKien.ForEach(dk =>
                    {
                        if (dk.DieuKienId == dieuKienTongDonHang)
                        {
                            if (!(tongDonHang >= dk.GiaTriTu && tongDonHang <= dk.GiaTriDen)) listAccept = false;
                        }
                        else if (dk.DieuKienId == dieuKienTongDoanhThuKTTN)
                        {
                            if (!(tongDoanhThuKttn >= dk.GiaTriTu && tongDoanhThuKttn <= dk.GiaTriDen)) listAccept = false;
                        }
                        else if (dk.DieuKienId == dieuKienTongDoanhThuNcc)
                        {
                            if (!(tongDoanhThuNcc >= dk.GiaTriTu && tongDoanhThuNcc <= dk.GiaTriDen)) listAccept = false;
                        }
                        else if (dk.DieuKienId == dieuKienTongDoanhThuNccNguoiDuocGioiThieu)
                        {
                            if (!(tongDoanhThuNccNguoiGt >= dk.GiaTriTu && tongDoanhThuNccNguoiGt <= dk.GiaTriDen)) listAccept = false;
                        }
                        else if (dk.DieuKienId == dieuKienTongDoanhThuKTTNNguoiDuocGioiThieu)
                        {
                            if (!(tongDoanhThuKttnNguoiGt >= dk.GiaTriTu && tongDoanhThuKttnNguoiGt <= dk.GiaTriDen)) listAccept = false;
                        }
                    });
                    if (listAccept == true && phanHang.PhanHangId != null) listPhanHangId.Add(phanHang.PhanHangId.Value);
                });

                var phanHangCategory = listPhanHangCategory.Where(x => listPhanHangId.Contains(x.CategoryId)).OrderByDescending(x => x.SortOrder).FirstOrDefault();
                phanHangId = phanHangCategory != null ? phanHangCategory.CategoryId : Guid.Empty;

                //Gửi thông báo phân hạng kh thành công
                if (phanHangId != Guid.Empty)
                {
                    var hang = listPhanHangCategory.FirstOrDefault(x => x.CategoryId == phanHangId)?.CategoryName;

                    var content = "Chúc mừng quý khách đã được thăng lên hạng " + hang + " !";
                    var notification = new
                    {
                        content = content,
                        status = false,
                        url = "",
                        orderId = "",
                        date = DateTime.Now.ToString("dd/MM/yyy HH:mm:ss"),
                        employeeId = customerId
                    };
                    _firebaseClient.Child("notification").Child($"{customerId}").PostAsync(notification);

                    PushNotificationToDevice(deviceId, "Thông báo thăng hạng", content, "1", Guid.Empty.ToString(), false);
                }
            }

            return phanHangId;
        }
        public static decimal TinhTienCustomerOrder(int? statusOrder, List<CustomerOrderDetailEntityModel> listOrderDetailCurrent, List<CustomerOrderDetailExtenEntityModel> listOderDetailExtenCurrent, 
                                                    int? loaiChietKhau, decimal? giaTriChietKhau)
        {
            //Tổng tiền trước thuế
            decimal? totalCostBeforeTax = 0;
            //Tổng tiền thuế
            decimal? totalCostTax = 0;
            //Tổng tiền chiết khấu
            decimal? totalDiscountCost = 0;
            // Tổng tiền phải trả
            decimal? totalCostPay = 0;

            if (listOrderDetailCurrent != null && listOrderDetailCurrent.Count() > 0)
            {
                listOrderDetailCurrent.ForEach(currentDetail =>
                {
                    totalCostBeforeTax += (currentDetail.Quantity ?? 1) * (currentDetail.PriceInitial ?? 0);
                    if (currentDetail.PriceInitial != null)
                        totalCostTax += currentDetail.Quantity * currentDetail.PriceInitial / 100 * ((currentDetail.Vat == -1 || currentDetail.Vat == 0) ? 0 : currentDetail.Vat);
                });
            }

            //Nếu có phát sinh
            if (listOderDetailExtenCurrent != null && listOderDetailExtenCurrent.Count() > 0 && statusOrder != 1)
            {
                listOderDetailExtenCurrent.ForEach(extenCur =>
                {
                    if (extenCur.Price != null && extenCur.Status != 1)
                    {
                        totalCostBeforeTax += extenCur.Quantity * extenCur.Price;
                        totalCostTax += 0;
                    }
                });
            }
            totalCostPay = totalCostBeforeTax + (totalCostTax ?? 0);

            //Tính chiết khấu
            //Theo %
            if (loaiChietKhau == 1)
            {
                totalCostPay = totalCostPay - totalCostPay * giaTriChietKhau / 100;
            }
            //Theo số tiền
            else if (loaiChietKhau == 2)
            {
                totalCostPay = totalCostPay -  giaTriChietKhau;
            }
            return totalCostPay ?? 0;
        }

        public static CauHinhMucChietKhau TinhChietKhauChoKhachHang(TNTN8Context context, Guid cusId, Guid? orderId, decimal? giaTriDonHang)
        {
            //Trừ đơn hàng hiện tại
            var listAllCus = context.Customer.Where(x => x.CustomerId == cusId || x.NguoiGioiThieuId == cusId).ToList();
            var cus = listAllCus.FirstOrDefault(x => x.CustomerId == cusId);
            Guid? phanHangId = cus.PhanHangId;

            var listCusIdGioiThieu = listAllCus.Where(x => x.NguoiGioiThieuId == cus.CustomerId).Select(x => x.CustomerId).ToList();

            var listAllOrder = context.CustomerOrder.Where(x => x.IsOrderAction == false && (x.CustomerId == cusId || listCusIdGioiThieu.Contains(x.CustomerId.Value))).ToList();
            var listOrderCus = listAllOrder.Where(x => x.OrderId != orderId && x.CustomerId == cusId).ToList();

            var listAllVendorOrderDt = (from vo in context.VendorOrder
                                        join dt in context.VendorOrderDetail on vo.VendorOrderId equals dt.VendorOrderId
                                        where (vo.CustomerId == cusId || listCusIdGioiThieu.Contains(vo.CustomerId.Value)) && vo.VendorOrderType == 2 //Nhà cung cấp thu tiền KH và trả hoa hồng cho KTTN
                                        select new { 
                                            CusId = vo.CustomerId,
                                            TienThuKh = dt.TongTienKhachHangThanhToan,
                                        }).ToList();

            int? tongSoDonHang = listOrderCus.Count();
            decimal? tongDoanhThuKTTN = listOrderCus.Sum(x => x.Amount);
            decimal? tongDoanhThuNcc = listAllVendorOrderDt.Where(x => x.CusId == cusId).Sum(x => x.TienThuKh); 

            decimal? tongDoanhThuNccVaKTTN = tongDoanhThuKTTN + tongDoanhThuNcc;

            decimal? tongDoanhThuKhGThieuKttn = listOrderCus.Where(x => listCusIdGioiThieu.Contains(x.CustomerId.Value)).Sum(x => x.Amount);
            decimal? tongDoanhThuKhGThieuNcc = listAllVendorOrderDt.Where(x => listCusIdGioiThieu.Contains(x.CusId.Value)).Sum(x => x.TienThuKh);

            var contactCus = context.Contact.FirstOrDefault(x => x.ObjectType == "CUS" && x.ObjectId == cusId);
            DateTime? ngaySinh = contactCus?.DateOfBirth;

            DateTime ngayThangTuDat = DateTime.Now;

            int? soNguoiThoiGthieu = listCusIdGioiThieu.Count();
            int? gioiTinh = contactCus.Gender == "NAM" ? 0 : (contactCus.Gender == "NU" ? 1 : -1);
            int? doTuoi = ngaySinh != null ? DateTime.Now.Year - ngaySinh.Value.Year : -1;

            var listAccept = new List<CauHinhMucChietKhau>();

            var listCauHinh = context.CauHinhMucChietKhau.ToList();
            var listLv1 = listCauHinh.Where(x => x.ParentId == null || x.ParentId == Guid.Empty).ToList();
            listLv1.ForEach(lv1 =>
            {
                if(phanHangId == lv1.PhanHangId)
                {
                    var listLv2 = listCauHinh.Where(x => x.ParentId == lv1.Id).ToList();
                    var isAccept = true;
                    listLv2.ForEach(lv2 =>
                    {
                        //Tổng số đơn hàng đã thực hiện
                        if (lv2.DieuKienId == 1 && !(lv2.GiaTriTu <= tongSoDonHang && lv2.GiaTriDen >= tongSoDonHang)) isAccept = false;
                        //Tổng doanh thu KTTN
                        if (lv2.DieuKienId == 2 && !(lv2.GiaTriTu <= tongDoanhThuKTTN && lv2.GiaTriDen >= tongDoanhThuKTTN)) isAccept = false;
                        //Tổng doanh thu NCC
                        if (lv2.DieuKienId == 3 && !(lv2.GiaTriTu <= tongDoanhThuNcc && lv2.GiaTriDen >= tongDoanhThuNcc)) isAccept = false;
                        //Doanh thu KTTN và NCC
                        if (lv2.DieuKienId == 4 && !(lv2.GiaTriTu <= tongDoanhThuNccVaKTTN && lv2.GiaTriDen >= tongDoanhThuNccVaKTTN)) isAccept = false;
                        //Giá trị đơn hàng
                        if (lv2.DieuKienId == 5 && !(lv2.GiaTriTu <= giaTriDonHang && lv2.GiaTriDen >= giaTriDonHang)) isAccept = false;
                        //Theo tổng doanh số KH được giới thiệu KTTN
                        if (lv2.DieuKienId == 6 && !(lv2.GiaTriTu <= tongDoanhThuKhGThieuKttn && lv2.GiaTriDen >= tongDoanhThuKhGThieuKttn)) isAccept = false;
                        //Theo tổng doanh số KH được giới thiệu Ncc
                        if (lv2.DieuKienId == 7 && !(lv2.GiaTriTu <= tongDoanhThuKhGThieuNcc && lv2.GiaTriDen >= tongDoanhThuKhGThieuNcc)) isAccept = false;
                        //Theo ngày tháng năm sinh
                        if (lv2.DieuKienId == 8 && (ngaySinh == null || !(ngaySinh.Value.Date == DateTime.Now.Date && ngaySinh.Value.Month == DateTime.Now.Month))) isAccept = false;
                        //Theo ngày tháng tự đặt(thực hiện khuyến mãi nhân dịp....)
                        if (lv2.DieuKienId == 9 && !(lv2.ThoiGianTu.Value.Date <= ngayThangTuDat.Date && lv2.ThoiGianDen.Value.Date >= ngayThangTuDat.Date)) isAccept = false;
                        //Theo nhóm giới thiệu (giới thiệu được bao nhiêu người sẽ có chiết khấu)
                        if (lv2.DieuKienId == 10 && !(lv2.GiaTriTu <= soNguoiThoiGthieu && lv2.GiaTriDen >= soNguoiThoiGthieu)) isAccept = false;
                        //Theo giới tính
                        if (lv2.DieuKienId == 11 && !(lv2.GiaTriTu == gioiTinh)) isAccept = false;
                        //Theo độ tuổi
                        if (lv2.DieuKienId == 12 && !(lv2.GiaTriTu <= doTuoi && lv2.GiaTriDen >= doTuoi)) isAccept = false;
                    });

                    if (isAccept == true) listAccept.Add(lv1);
                }
            });

            //Tiền chiết khấu lớn nhất thì lấy
            //1: theo %, 2: Theo số tiền
            var cauHinhChieuKhau = new CauHinhMucChietKhau();
            decimal? tienChietKhau = 0;
            listAccept.ForEach(item =>
            {
                //Theo số tiền
                if (item.LoaiChietKhauId == 2)
                {
                    var tienChietKhauCurrent = item.GiaTri;
                    if(tienChietKhauCurrent > tienChietKhau)
                    {
                        tienChietKhau = tienChietKhauCurrent;
                        cauHinhChieuKhau = item;
                    }
                }
                //theo %
                else if (item.LoaiChietKhauId == 1)
                {
                    var tienChietKhauCurrent = giaTriDonHang * item.GiaTri/100;
                    if (tienChietKhauCurrent > tienChietKhau)
                    {
                        tienChietKhau = tienChietKhauCurrent;
                        cauHinhChieuKhau = item;
                    }
                }
            });

            return cauHinhChieuKhau;
        }
    }
}


public class NotificationReceiver
{
    public Guid? CustomerId { get; set; }

    public List<Guid> ListEmployeeId { get; set; }
}
    

