using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Admin.MobileAppConfiguration;
using TN.TNM.DataAccess.Messages.Results.Admin;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Entities;
using TN.TNM.DataAccess.Models.MobileAppConfiguration;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class MobileAppConfigurationDAO : BaseDAO, IMobileAppConfigurationDataAccess
    {
        private readonly IMapper _mapper;
        private IHostingEnvironment _hostingEnvironment;

        public MobileAppConfigurationDAO(
            Databases.TNTN8Context _content,
            IMapper mapper,
            IHostingEnvironment hostingEnvironment
            )
        {
            this.context = _content;
            _mapper = mapper;
            _hostingEnvironment = hostingEnvironment;
        }

        public CreateOrEditMobileAppConfigurationResult CreateOrEditMobileAppConfiguration(CreateOrEditMobileAppConfigurationParameter parameter)
        {
            try
            {
                var mobileAppConfiguration = _mapper.Map<MobileAppConfiguration>(parameter.MobileAppConfigurationEntityModel);
                if (mobileAppConfiguration.Id != null && mobileAppConfiguration.Id != Guid.Empty)
                {
                    mobileAppConfiguration.UpdatedDate = DateTime.Now;
                    mobileAppConfiguration.UpdatedById = parameter.UserId;
                    string folderName = "MobileAppConfigurationImage";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName);
                    mobileAppConfiguration.IntroduceImageOrVideo = parameter.MobileAppConfigurationEntityModel.IntroduceImageOrVideoName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.IntroduceImageOrVideoName) : "";
                    mobileAppConfiguration.LoginAndRegisterScreenImage = parameter.MobileAppConfigurationEntityModel.LoginAndRegisterScreenImageName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.LoginAndRegisterScreenImageName) : "";
                    mobileAppConfiguration.LoginScreenIcon = parameter.MobileAppConfigurationEntityModel.LoginScreenIconName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.LoginScreenIconName) : "";
                    mobileAppConfiguration.PaymentScreenIconTransfer = parameter.MobileAppConfigurationEntityModel.PaymentScreenIconTransferName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.PaymentScreenIconTransferName) : "";
                    mobileAppConfiguration.OrderNotificationImage = parameter.MobileAppConfigurationEntityModel.OrderNotificationImageName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.OrderNotificationImageName) : "";
                    context.MobileAppConfiguration.Update(mobileAppConfiguration);
                }
                else
                {
                    mobileAppConfiguration.Id = Guid.NewGuid();
                    mobileAppConfiguration.CreatedDate = DateTime.Now;
                    mobileAppConfiguration.CreatedById = parameter.UserId;
                    string folderName = "MobileAppConfigurationImage";
                    string webRootPath = _hostingEnvironment.WebRootPath;
                    string newPath = Path.Combine(webRootPath, folderName);
                    mobileAppConfiguration.IntroduceImageOrVideo = parameter.MobileAppConfigurationEntityModel.IntroduceImageOrVideoName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.IntroduceImageOrVideoName) : "";
                    mobileAppConfiguration.LoginAndRegisterScreenImage = parameter.MobileAppConfigurationEntityModel.LoginAndRegisterScreenImageName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.LoginAndRegisterScreenImageName) : "";
                    mobileAppConfiguration.LoginScreenIcon = parameter.MobileAppConfigurationEntityModel.LoginScreenIconName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.LoginScreenIconName) : "";
                    mobileAppConfiguration.PaymentScreenIconTransfer = parameter.MobileAppConfigurationEntityModel.PaymentScreenIconTransferName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.PaymentScreenIconTransferName) : "";
                    mobileAppConfiguration.OrderNotificationImage = parameter.MobileAppConfigurationEntityModel.OrderNotificationImageName != null ? Path.Combine(newPath, parameter.MobileAppConfigurationEntityModel.OrderNotificationImageName) : "";
                    context.MobileAppConfiguration.Add(mobileAppConfiguration);
                }

                context.SaveChanges();
                return new CreateOrEditMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new CreateOrEditMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public TakeMobileAppConfigurationResult TakeMobileAppConfiguration(TakeMobileAppConfigurationParameter parameter)
        {
            try
            {
                var mobileAppConfiguration = context.MobileAppConfiguration
                                            .Select(x => new MobileAppConfigurationEntityModel
                                            {
                                                Id = x.Id,
                                                IntroduceColor = x.IntroduceColor,
                                                IntroduceImageOrVideo = GetImageBase64(x.IntroduceImageOrVideo),
                                                IntroduceImageOrVideoName = Path.GetFileName(x.IntroduceImageOrVideo),
                                                IntroduceSologan = x.IntroduceSologan,
                                                LoginAndRegisterScreenImage = GetImageBase64(x.LoginAndRegisterScreenImage),
                                                LoginAndRegisterScreenImageName = Path.GetFileName(x.LoginAndRegisterScreenImage),
                                                LoginScreenColor = x.LoginScreenColor,
                                                LoginScreenIcon = GetImageBase64(x.LoginScreenIcon),
                                                LoginScreenIconName = Path.GetFileName(x.LoginScreenIcon),
                                                PaymentScreenContentTransfer = x.PaymentScreenContentTransfer,
                                                PaymentScreenContentVnpay = x.PaymentScreenContentVnpay,
                                                PaymentScreenIconTransfer = GetImageBase64(x.PaymentScreenIconTransfer),
                                                PaymentScreenIconTransferName = Path.GetFileName(x.PaymentScreenIconTransfer),
                                                IsPaymentScreenIconTransfer = x.IsPaymentScreenIconTransfer,
                                                IsPaymentScreenIconVnpay = x.IsPaymentScreenIconVnpay,
                                                PaymentScreenIconVnpay = x.PaymentScreenIconVnpay,
                                                OrderNotificationImage = GetImageBase64(x.OrderNotificationImage),
                                                OrderNotificationImageName = Path.GetFileName(x.OrderNotificationImage)
                                            }).FirstOrDefault();

                var paymentMethodCateTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "PaymentMethod").CategoryTypeId;
                var listPayMentCategory = context.Category.Where(x => x.CategoryTypeId == paymentMethodCateTypeId)
                        .Select(y => new CategoryEntityModel
                        {
                            CategoryId = y.CategoryId,
                            CategoryName = y.CategoryName,
                            CategoryCode = y.CategoryCode
                        }).OrderBy(z => z.CategoryName).ToList();
                var listPayMent = context.PaymentMethodConfigure.Select(x => new PaymentMethodConfigureEntityModel
                {
                    Id = x.Id,
                    Content = x.Content,
                    CategoryId = x.CategoryId,
                    Edit = false,
                    CategoryName = listPayMentCategory.FirstOrDefault(item => item.CategoryId == x.CategoryId).CategoryName,
                    CategoryCode = listPayMentCategory.FirstOrDefault(item => item.CategoryId == x.CategoryId).CategoryCode,
                    CategoryObject = listPayMentCategory.FirstOrDefault(item => item.CategoryId == x.CategoryId),
                }).ToList();

                var listAdvertisementConfiguration = context.AdvertisementConfiguration
                                            .Select(x => new AdvertisementConfigurationEntityModel
                                            {
                                                Id = x.Id,
                                                Content = x.Content,
                                                Image = GetImageBase64(x.Image),
                                                ImageName = Path.GetFileName(x.Image),
                                                Title = x.Title,
                                                SortOrder = x.SortOrder,
                                                Edit = false,
                                            }).ToList();

                return new TakeMobileAppConfigurationResult
                {
                    ListPayMentCategory = listPayMentCategory,
                    ListPayMent = listPayMent,
                    ListAdvertisementConfigurationEntityModel = listAdvertisementConfiguration.OrderBy(x => x.SortOrder).ToList(),
                    MobileAppConfigurationEntityModel = mobileAppConfiguration,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        private string GetImageBase64(string path)
        {
            try
            {
                using (MemoryStream m = new MemoryStream())
                {
                    string base64String = path;
                    if (!string.IsNullOrEmpty(path) && Path.IsPathRooted(path))
                    {
                        Image image = Image.FromFile(@path);
                        image.Save(m, image.RawFormat);
                        byte[] imageBytes = m.ToArray();
                        string type = Path.GetExtension(path);
                        base64String = $"data:image/{type.Replace(".", "")};base64," + Convert.ToBase64String(imageBytes);
                    }
                    return base64String;
                }
            }
            catch (Exception)
            {
                return "";
            }
        }

        public TakeMobileAppConfigurationResult TakeMobileAppConfigurationIntro(TakeMobileAppConfigurationParameter parameter)
        {
            try
            {
                var mobileAppConfiguration = context.MobileAppConfiguration
                                            .Select(x => new MobileAppConfigurationEntityModel
                                            {
                                                Id = x.Id,
                                                IntroduceColor = x.IntroduceColor,
                                                IntroduceImageOrVideo = GetImageBase64(x.IntroduceImageOrVideo),
                                                IntroduceSologan = x.IntroduceSologan
                                            }).FirstOrDefault();

                return new TakeMobileAppConfigurationResult
                {
                    MobileAppConfigurationEntityModel = mobileAppConfiguration,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public TakeMobileAppConfigurationResult TakeMobileAppConfigurationLoginScreen(TakeMobileAppConfigurationParameter parameter)
        {
            try
            {
                var mobileAppConfiguration = context.MobileAppConfiguration
                                            .Select(x => new MobileAppConfigurationEntityModel
                                            {
                                                Id = x.Id,
                                                LoginScreenColor = x.LoginScreenColor,
                                                LoginScreenIcon = GetImageBase64(x.LoginScreenIcon),
                                            }).FirstOrDefault();

                return new TakeMobileAppConfigurationResult
                {
                    MobileAppConfigurationEntityModel = mobileAppConfiguration,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public TakeMobileAppConfigurationResult TakeMobileAppConfigurationLoginAndRegister(TakeMobileAppConfigurationParameter parameter)
        {
            try
            {
                var mobileAppConfiguration = context.MobileAppConfiguration
                                            .Select(x => new MobileAppConfigurationEntityModel
                                            {
                                                Id = x.Id,
                                                LoginAndRegisterScreenImage = GetImageBase64(x.LoginAndRegisterScreenImage)
                                            }).FirstOrDefault();

                return new TakeMobileAppConfigurationResult
                {
                    MobileAppConfigurationEntityModel = mobileAppConfiguration,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public TakeMobileAppConfigurationResult TakeMobileAppConfigurationPayment(TakeMobileAppConfigurationParameter parameter)
        {
            try
            {
                var mobileAppConfiguration = context.MobileAppConfiguration
                                            .Select(x => new MobileAppConfigurationEntityModel
                                            {
                                                Id = x.Id,
                                                PaymentScreenContentTransfer = GetImageBase64(x.PaymentScreenContentTransfer),
                                                PaymentScreenContentVnpay = x.PaymentScreenContentVnpay,
                                                PaymentScreenIconTransfer = GetImageBase64(x.PaymentScreenIconTransfer),
                                                IsPaymentScreenIconTransfer = x.IsPaymentScreenIconTransfer,
                                                IsPaymentScreenIconVnpay = x.IsPaymentScreenIconVnpay,
                                                PaymentScreenIconVnpay = x.PaymentScreenIconVnpay
                                            }).FirstOrDefault();

                return new TakeMobileAppConfigurationResult
                {
                    MobileAppConfigurationEntityModel = mobileAppConfiguration,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public TakeMobileAppConfigurationResult TakeMobileAppConfigurationNotificationImage(TakeMobileAppConfigurationParameter parameter)
        {
            try
            {
                var mobileAppConfiguration = context.MobileAppConfiguration
                                            .Select(x => new MobileAppConfigurationEntityModel
                                            {
                                                Id = x.Id,
                                                OrderNotificationImage = GetImageBase64(x.OrderNotificationImage)
                                            }).FirstOrDefault();

                return new TakeMobileAppConfigurationResult
                {
                    MobileAppConfigurationEntityModel = mobileAppConfiguration,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new TakeMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public CreateOrUpdatePaymentMethodResult CreateOrUpdatePaymentMethod(CreateOrUpdatePaymentMethodParameter parameter)
        {
            try
            {
                var payment = parameter.Payment;
                var listAllPayMent = context.PaymentMethodConfigure.ToList();
                //Tạo
                if (parameter.Payment.Id == null || parameter.Payment.Id == Guid.Empty)
                {
                    var newPayment = _mapper.Map<PaymentMethodConfigure>(parameter.Payment);
                    var checkUsed = listAllPayMent.FirstOrDefault(x => x.CategoryId == newPayment.CategoryId);
                    if (checkUsed != null)
                    {
                        return new CreateOrUpdatePaymentMethodResult
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Phương thức thanh toán đã được cấu hình. Không thể thêm mới!"
                        };
                    }
                    newPayment.Id = Guid.NewGuid();
                    newPayment.CreatedById = parameter.UserId;
                    newPayment.UpdatedById = parameter.UserId;
                    newPayment.CreatedDate = DateTime.Now;
                    newPayment.UpdatedDate = DateTime.Now;
                    payment.Id = newPayment.Id;
                    context.PaymentMethodConfigure.Add(newPayment);
                }
                //Cập nhật
                else
                {
                    var exist = context.PaymentMethodConfigure.FirstOrDefault(x => x.Id == parameter.Payment.Id);
                    if (exist == null)
                    {
                        return new CreateOrUpdatePaymentMethodResult
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Không tìm thấy cấu hình trên hệ thống!"
                        };
                    }

                    var checkUsed = listAllPayMent.FirstOrDefault(x => x.CategoryId == parameter.Payment.CategoryId.Value && x.Id != exist.Id);
                    if (checkUsed != null)
                    {
                        return new CreateOrUpdatePaymentMethodResult
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Phương thức thanh toán đã được cấu hình. Không thể thêm mới!"
                        };
                    }
                    exist.CategoryId = parameter.Payment.CategoryId.Value;
                    exist.Content = parameter.Payment.Content;
                    exist.CreatedDate = DateTime.Now;
                    exist.UpdatedDate = DateTime.Now;
                    context.PaymentMethodConfigure.Update(exist);
                }

                context.SaveChanges();


                return new CreateOrUpdatePaymentMethodResult
                {
                    Payment = payment,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new CreateOrUpdatePaymentMethodResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public CreateOrUpdatePaymentMethodResult DeletePaymentMethod(CreateOrUpdatePaymentMethodParameter parameter)
        {
            try
            {
                var exist = context.PaymentMethodConfigure.FirstOrDefault(x => x.Id == parameter.Payment.Id);
                if (exist == null)
                {
                    return new CreateOrUpdatePaymentMethodResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tìm thấy cấu hình trên hệ thống!"
                    };
                }
                //Kiểm tra xem đã có phiếu nào sử dụng chưa
                var checkUsed = context.CustomerOrder.FirstOrDefault(x => x.PaymentMethod == parameter.Payment.Id);
                if (checkUsed != null)
                {
                    return new CreateOrUpdatePaymentMethodResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Phương thức thanh toán đã được sử dụng, không thể xóa!"
                    };
                }
                context.PaymentMethodConfigure.Remove(exist);
                context.SaveChanges();
                return new CreateOrUpdatePaymentMethodResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa thành công!"
                };
            }
            catch (Exception e)
            {
                return new CreateOrUpdatePaymentMethodResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public CreateOrEditMobileAppConfigurationResult CreateOrEditAdvertisementConfiguration(CreateOrEditAdvertisementConfigurationParameter parameter)
        {
            try
            {
                var advertisementConfiguration = _mapper.Map<AdvertisementConfiguration>(parameter.AdvertisementConfigurationEntityModel);
                string folderName = "AdvertisementConfigurationImage";
                string webRootPath = _hostingEnvironment.WebRootPath;
                if (advertisementConfiguration.Id != null && advertisementConfiguration.Id != Guid.Empty)
                {
                    advertisementConfiguration.UpdatedDate = DateTime.Now;
                    advertisementConfiguration.UpdatedById = parameter.UserId;
                    if (!string.IsNullOrEmpty(parameter.AdvertisementConfigurationEntityModel.ImageName) && !string.IsNullOrEmpty(parameter.AdvertisementConfigurationEntityModel.Image))
                    {
                        string newPath = Path.Combine(webRootPath, folderName);
                        advertisementConfiguration.Image = parameter.AdvertisementConfigurationEntityModel.ImageName != null ? Path.Combine(newPath, parameter.AdvertisementConfigurationEntityModel.ImageName) : "";
                    }
                    else
                    {
                        advertisementConfiguration.Image = parameter.AdvertisementConfigurationEntityModel.Image;
                    }
                    context.AdvertisementConfiguration.Update(advertisementConfiguration);
                }
                else
                {
                    var exits = context.AdvertisementConfiguration.FirstOrDefault(x => x.SortOrder == parameter.AdvertisementConfigurationEntityModel.SortOrder);
                    if (exits != null)
                    {
                        return new CreateOrEditMobileAppConfigurationResult
                        {
                            StatusCode = HttpStatusCode.ExpectationFailed,
                            MessageCode = "Trùng số thứ tự"
                        };
                    }
                    advertisementConfiguration.Id = Guid.NewGuid();
                    advertisementConfiguration.CreatedDate = DateTime.Now;
                    advertisementConfiguration.CreatedById = parameter.UserId;
                    if (!string.IsNullOrEmpty(parameter.AdvertisementConfigurationEntityModel.ImageName) && !string.IsNullOrEmpty(parameter.AdvertisementConfigurationEntityModel.Image))
                    {
                        string newPath = Path.Combine(webRootPath, folderName);
                        advertisementConfiguration.Image = parameter.AdvertisementConfigurationEntityModel.ImageName != null ? Path.Combine(newPath, parameter.AdvertisementConfigurationEntityModel.ImageName) : "";
                    }
                    else
                    {
                        advertisementConfiguration.Image = parameter.AdvertisementConfigurationEntityModel.Image;
                    }
                    context.AdvertisementConfiguration.Add(advertisementConfiguration);
                }

                context.SaveChanges();
                return new CreateOrEditMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new CreateOrEditMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public CreateOrEditMobileAppConfigurationResult DeleteAdvertisementConfiguration(DeleteAdvertisementConfigurationParameter parameter)
        {
            try
            {
                var advertisementConfiguration = context.AdvertisementConfiguration.FirstOrDefault(x => x.Id == parameter.Id);
                if (advertisementConfiguration != null)
                {
                    context.AdvertisementConfiguration.Remove(advertisementConfiguration);
                    context.SaveChanges();
                }
                return new CreateOrEditMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa thành công!"
                };
            }
            catch (Exception e)
            {
                return new CreateOrEditMobileAppConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public TakeListAdvertisementConfigurationResult TakeListAdvertisementConfiguration(TakeListAdvertisementConfigurationParameter parameter)
        {
            try
            {
                var listAdvertisementConfiguration = context.AdvertisementConfiguration
                            .Select(x => new AdvertisementConfigurationEntityModel
                            {
                                Id = x.Id,
                                Content = x.Content,
                                Image = GetImageBase64(x.Image),
                                Title = x.Title,
                                SortOrder = x.SortOrder
                            }).ToList();

                return new TakeListAdvertisementConfigurationResult
                {
                    ListAdvertisementConfigurationEntityModel = listAdvertisementConfiguration,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công!"
                };
            }
            catch (Exception e)
            {
                return new TakeListAdvertisementConfigurationResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public CreateUpdateCauHinhWebResult CreateUpdateCauHinhWeb(CreateUpdateCauHinhWebParameter parameter)
        {
            try
            {
                string webRootPath = _hostingEnvironment.WebRootPath;
                string folderPath = Path.Combine(webRootPath, "CauHinhWeb");
                // Kiểm tra xem thư mục có tồn tại không
                if (!Directory.Exists(folderPath))
                {
                    // Nếu không tồn tại, tạo thư mục
                    Directory.CreateDirectory(folderPath);
                }
                else
                {
                    string[] filePaths = Directory.GetFiles(folderPath);

                    // Delete each file
                    foreach (string filePath in filePaths)
                    {
                        File.Delete(filePath);
                        Console.WriteLine($"Deleted file: {filePath}");
                    }
                }

                //Xóa các ảnh editor không dùng đến

                string folderPathEditorImg = Path.Combine(webRootPath, "ImgTextEditor");


                // Kiểm tra xem thư mục có tồn tại không
                if (Directory.Exists(folderPathEditorImg))
                {
                    string[] filePaths = Directory.GetFiles(folderPathEditorImg);

                    // Delete each file
                    foreach (string filePath in filePaths)
                    {
                        var fileName = Path.GetFileName(filePath);
                        if (!parameter.ListSrcAnh.Contains(fileName)) File.Delete(filePath);
                    }
                }

                var listRmCauHinhThongTinWebBanHang = context.CauHinhThongTinWebBanHang.ToList();
                var listRmCauHinhDanhGiaWeb = context.CauHinhDanhGiaWeb.ToList();
                var listRmCauHinhGioiThieuWeb = context.CauHinhGioiThieuWeb.ToList();
                var listRmCauHinhQuangCaoDoiTac = context.CauHinhQuangCaoDoiTac.ToList();
                var listRmCauHinhAnhLinkWeb = context.CauHinhAnhLinkWeb.ToList();

                if (listRmCauHinhThongTinWebBanHang.Count() > 0) context.CauHinhThongTinWebBanHang.RemoveRange(listRmCauHinhThongTinWebBanHang);
                if (listRmCauHinhDanhGiaWeb.Count() > 0) context.CauHinhDanhGiaWeb.RemoveRange(listRmCauHinhDanhGiaWeb);
                if (listRmCauHinhGioiThieuWeb.Count() > 0) context.CauHinhGioiThieuWeb.RemoveRange(listRmCauHinhGioiThieuWeb);
                if (listRmCauHinhQuangCaoDoiTac.Count() > 0) context.CauHinhQuangCaoDoiTac.RemoveRange(listRmCauHinhQuangCaoDoiTac);
                if (listRmCauHinhAnhLinkWeb.Count() > 0) context.CauHinhAnhLinkWeb.RemoveRange(listRmCauHinhAnhLinkWeb);

                var cauHinhThongTinWebBanHang = _mapper.Map<CauHinhThongTinWebBanHang>(parameter.CauHinhThongTinWebBanHang);
                cauHinhThongTinWebBanHang.Id = Guid.NewGuid();

                var listAddCauHinhDanhGiaWeb = new List<CauHinhDanhGiaWeb>();
                parameter.CauHinhDanhGiaWeb.ForEach(item =>
                {
                    var cauHinhDanhGiaWeb = _mapper.Map<CauHinhDanhGiaWeb>(item);
                    cauHinhDanhGiaWeb.Id = Guid.NewGuid();
                    if (!string.IsNullOrEmpty(item.Anh))
                    {
                        string imagePath = Path.Combine(folderPath, cauHinhDanhGiaWeb.Id.ToString() + ".jpeg");
                        byte[] imageBytes = Convert.FromBase64String(item.Anh.Split(",")[1]);
                        File.WriteAllBytes(imagePath, imageBytes);
                        cauHinhDanhGiaWeb.Anh = imagePath;
                    }
                    listAddCauHinhDanhGiaWeb.Add(cauHinhDanhGiaWeb);
                });

                var listCauHinhGioiThieuWeb = new List<CauHinhGioiThieuWeb>();
                parameter.CauHinhGioiThieuWeb.ForEach(item =>
                {
                    var cauHinhGioiThieuWeb = _mapper.Map<CauHinhGioiThieuWeb>(item);
                    cauHinhGioiThieuWeb.Id = Guid.NewGuid();
                    listCauHinhGioiThieuWeb.Add(cauHinhGioiThieuWeb);
                });

                var listCauHinhQuangCaoDoiTac = new List<CauHinhQuangCaoDoiTac>();
                parameter.CauHinhQuangCaoDoiTac.ForEach(item =>
                {
                    var cauHinh = _mapper.Map<CauHinhQuangCaoDoiTac>(item);
                    cauHinh.Id = Guid.NewGuid();
                    if (!string.IsNullOrEmpty(item.Anh))
                    {
                        string imagePath = Path.Combine(folderPath, cauHinh.Id.ToString() + ".jpeg");
                        byte[] imageBytes = Convert.FromBase64String(item.Anh.Split(",")[1]);
                        File.WriteAllBytes(imagePath, imageBytes);
                        cauHinh.Anh = imagePath;
                    }
                    listCauHinhQuangCaoDoiTac.Add(cauHinh);
                });

                var listCauHinhAnhLinkWeb = new List<CauHinhAnhLinkWeb>();
                parameter.CauHinhAnhLinkWeb.ForEach(item =>
                {
                    var cauHinh = _mapper.Map<CauHinhAnhLinkWeb>(item);
                    cauHinh.Id = Guid.NewGuid();
                    if (!string.IsNullOrEmpty(item.Anh))
                    {
                        string imagePath = Path.Combine(folderPath, cauHinh.Id.ToString() + ".jpeg");
                        byte[] imageBytes = Convert.FromBase64String(item.Anh.Split(",")[1]);
                        File.WriteAllBytes(imagePath, imageBytes);
                        cauHinh.Anh = imagePath;
                    }
                    listCauHinhAnhLinkWeb.Add(cauHinh);
                });


                context.CauHinhThongTinWebBanHang.Add(cauHinhThongTinWebBanHang);
                if (listAddCauHinhDanhGiaWeb.Count() > 0) context.CauHinhDanhGiaWeb.AddRange(listAddCauHinhDanhGiaWeb);
                if (listCauHinhGioiThieuWeb.Count() > 0) context.CauHinhGioiThieuWeb.AddRange(listCauHinhGioiThieuWeb);
                if (listCauHinhQuangCaoDoiTac.Count() > 0) context.CauHinhQuangCaoDoiTac.AddRange(listCauHinhQuangCaoDoiTac);
                if (listCauHinhAnhLinkWeb.Count() > 0) context.CauHinhAnhLinkWeb.AddRange(listCauHinhAnhLinkWeb);

                context.SaveChanges();

                return new CreateUpdateCauHinhWebResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công!"
                };
            }
            catch (Exception e)
            {
                return new CreateUpdateCauHinhWebResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }


        public GetDataCauHinhWebResult GetDataCauHinhWeb(GetDataCauHinhWebParameter parameter)
        {
            try
            {
                string webRootPath = _hostingEnvironment.WebRootPath;

                var cauHinhThongTinWebBanHang = context.CauHinhThongTinWebBanHang.Select(x => _mapper.Map<CauHinhThongTinWebBanHangModel>(x)).FirstOrDefault();
                var cauHinhDanhGiaWeb = context.CauHinhDanhGiaWeb.Select(x => new CauHinhDanhGiaWebModel
                {
                    Id = x.Id,
                    Anh = parameter.IsGetBase64 == true ? GetImageBase64(x.Anh) : (x.Anh != null ? x.Anh.Replace(webRootPath, "images") : ""),
                    TenKhachHang = x.TenKhachHang,
                    NoiDung = x.NoiDung,
                    Sao = x.Sao,
                }).ToList();

                var cauHinhGioiThieuWeb = context.CauHinhGioiThieuWeb.Select(x => _mapper.Map<CauHinhGioiThieuWebModel>(x)).ToList();
                var cauHinhQuangCaoDoiTac = context.CauHinhQuangCaoDoiTac
                .Select(x => new CauHinhQuangCaoDoiTacModel
                {
                    Id = x.Id,
                    Anh = parameter.IsGetBase64 == true ? GetImageBase64(x.Anh) : (x.Anh != null ? x.Anh.Replace(webRootPath, "images") : ""),
                    Link = x.Link,
                    NoiDung = x.NoiDung,
                }).ToList();

                var cauHinhAnhLinkWeb = context.CauHinhAnhLinkWeb.Select(x => _mapper.Map<CauHinhAnhLinkWebModel>(x))
                .Select(x => new CauHinhAnhLinkWebModel
                {
                    Id = x.Id,
                    Anh = parameter.IsGetBase64 == true ? GetImageBase64(x.Anh) : (x.Anh != null ? x.Anh.Replace(webRootPath, "images") : ""),
                    Link = x.Link,
                    Type = x.Type,
                }).ToList();

                return new GetDataCauHinhWebResult
                {
                    CauHinhThongTinWebBanHang = cauHinhThongTinWebBanHang,
                    CauHinhDanhGiaWeb = cauHinhDanhGiaWeb,
                    CauHinhGioiThieuWeb = cauHinhGioiThieuWeb,
                    CauHinhQuangCaoDoiTac = cauHinhQuangCaoDoiTac,
                    CauHinhAnhLinkWeb = cauHinhAnhLinkWeb,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công!"
                };
            }
            catch (Exception e)
            {
                return new GetDataCauHinhWebResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public UploadFileImgEditorResult UploadFileImgEditor(UploadFileImgEditorParameter parameter)
        {
            try
            {
                string webRootPath = _hostingEnvironment.WebRootPath;
                string folderPath = Path.Combine(webRootPath, "ImgTextEditor");
                // Kiểm tra xem thư mục có tồn tại không
                if (!Directory.Exists(folderPath))
                {
                    // Nếu không tồn tại, tạo thư mục
                    Directory.CreateDirectory(folderPath);
                }
                var gioiThieuSrc = new List<string>();
                var lienHeSrc = new List<string>();
                var footerMoTaSrc = new List<string>();
                var listPath = new List<string>();


                if (parameter.ListSrcAnhGT != null)
                {
                    parameter.ListSrcAnhGT.ForEach(item =>
                    {
                        var imgName = Guid.NewGuid().ToString() + Path.GetExtension(item.FileName);
                        gioiThieuSrc.Add(Path.Combine("ImgTextEditor", imgName));
                        string fullPath = Path.Combine(folderPath, imgName);
                        listPath.Add(imgName);
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            item.CopyTo(stream);
                        }
                    });
                }

                if (parameter.ListSrcAnhLH != null)
                {
                    parameter.ListSrcAnhLH.ForEach(item =>
                    {
                        var imgName = Guid.NewGuid().ToString() + Path.GetExtension(item.FileName);
                        lienHeSrc.Add(Path.Combine("ImgTextEditor", imgName));
                        string fullPath = Path.Combine(folderPath, imgName);
                        listPath.Add(imgName);
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            item.CopyTo(stream);
                        }
                    });
                }

                if (parameter.ListSrcAnhMT != null)
                {
                    parameter.ListSrcAnhMT.ForEach(item =>
                    {
                        var imgName = Guid.NewGuid().ToString() + Path.GetExtension(item.FileName);
                        footerMoTaSrc.Add(Path.Combine("ImgTextEditor", imgName));

                        string fullPath = Path.Combine(folderPath, imgName);
                        listPath.Add(imgName);
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            item.CopyTo(stream);
                        }
                    });
                }

                return new UploadFileImgEditorResult()
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    GioiThieuSrc = gioiThieuSrc,
                    LienHeSrc = lienHeSrc,
                    FooterMoTaSrc = footerMoTaSrc,
                    ListPath = listPath
                };
            }
            catch (Exception ex)
            {
                return new UploadFileImgEditorResult()
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = ex.Message
                };
            }
        }
    }
}
