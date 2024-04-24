using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.AttributeConfigurationEntityModel;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.CustomerOrder;
using TN.TNM.DataAccess.Models.MilestoneConfiguration;
using TN.TNM.DataAccess.Models.Options;
using TN.TNM.DataAccess.Models.Order;
using TN.TNM.DataAccess.Models.PermissionConfiguration;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.ProductMappingOptions;
using TN.TNM.DataAccess.Models.ServicePacketImage;
using TN.TNM.DataAccess.Models.Entities;
using TN.TNM.DataAccess.Models.Vendor;
using TN.TNM.DataAccess.Models.Address;
using TN.TNM.DataAccess.Models.Company;
using TN.TNM.DataAccess.Models.ReceiptInvoice;
using TN.TNM.DataAccess.Models.PurchaseOrderStatus;
using TN.TNM.DataAccess.Models.MobileAppConfiguration;

namespace TN.TNM.Api
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Options, OptionsEntityModel>().ReverseMap();
            CreateMap<MilestoneConfiguration, MilestoneConfigurationEntityModel>().ReverseMap();
            CreateMap<Product, ProductEntityModel>().ReverseMap();
            CreateMap<ProductMappingOptions, ProductMappingOptionModel>().ReverseMap();
            CreateMap<AttributeConfiguration, AttributeConfigurationEntityModel>().ReverseMap();
            CreateMap<ServicePacketEntityModel, ServicePacket>();
            CreateMap<PermissionConfiguration, PermissionConfigurationEntityModel>().ReverseMap();
            CreateMap<ServicePacketImage, ServicePacketImageEntityModel>().ReverseMap();
            CreateMap<CustomerOrderDetail, CustomerOrderDetailEntityModel>().ReverseMap();
            CreateMap<CustomerOrderExtension, CustomerOrderExtensionEntityModel>().ReverseMap();
            CreateMap<Employee, EmployeeEntityModel>().ReverseMap();
            CreateMap<EmployeeEntityModel, Employee>().ReverseMap();
            CreateMap<Organization, OrganizationEntityModel>().ReverseMap();
            CreateMap<CustomerOrderDetailExten, CustomerOrderDetailExtenEntityModel>().ReverseMap();
            CreateMap<ServicePacketMappingOptions, ServicePacketMappingOptionsEntityModel>().ReverseMap();
            CreateMap<CustomerOrderTask, CustomerOrderTaskEntityModel>().ReverseMap();
            CreateMap<ReportPoint, ReportPointEntityModel>().ReverseMap();
            CreateMap<OrderProcess, OrderProcessEntityModel>().ReverseMap();
            CreateMap<MobileAppConfiguration, MobileAppConfigurationEntityModel>().ReverseMap();
            CreateMap<NotificationConfiguration, NotificationConfigurationEntityModel>().ReverseMap();
            CreateMap<PaymentMethodConfigure, PaymentMethodConfigureEntityModel>().ReverseMap();
            CreateMap<AdvertisementConfiguration, AdvertisementConfigurationEntityModel>().ReverseMap();

            CreateMap<VendorMappingOption, VendorMappingOptionEntityModel>().ReverseMap();
            CreateMap<VendorMappingOptionEntityModel, VendorMappingOption>().ReverseMap();

            CreateMap<Province, ProvinceEntityModel>().ReverseMap();
            CreateMap<District, DistrictEntityModel>().ReverseMap();
            CreateMap<Ward, WardEntityModel>().ReverseMap();

            CreateMap<Category, CategoryEntityModel>().ReverseMap();
            CreateMap<CategoryEntityModel, Category>().ReverseMap();

            CreateMap<CauHinhMucHoaHong, CauHinhMucHoaHongModel>().ReverseMap();
            CreateMap<CauHinhMucHoaHongModel, CauHinhMucHoaHong>().ReverseMap();

            CreateMap<CauHinhHeSoKhuyenKhich, CauHinhHeSoKhuyenKhichModel>().ReverseMap();
            CreateMap<CauHinhHeSoKhuyenKhichModel, CauHinhHeSoKhuyenKhich>().ReverseMap();

            CreateMap<CustomerOrder, CustomerOrderEntityModel>().ReverseMap();
            CreateMap<CustomerOrderEntityModel, CustomerOrder>().ReverseMap();

            CreateMap<PhieuThuBaoCoMappingCustomerOrderModel, PhieuThuBaoCoMappingCustomerOrder>().ReverseMap();
            CreateMap<PhieuThuBaoCoMappingCustomerOrder, PhieuThuBaoCoMappingCustomerOrderModel>().ReverseMap();


            CreateMap<PurchaseOrderStatus, PurchaseOrderStatusEntityModel>().ReverseMap();
            CreateMap<PurchaseOrderStatusEntityModel, PurchaseOrderStatus>().ReverseMap();

            CreateMap<Vendor, VendorEntityModel>().ReverseMap();
            CreateMap<VendorEntityModel, Vendor>().ReverseMap();

            CreateMap<CauHinhPhanHangKh, CauHinhPhanHangKhModel>().ReverseMap();
            CreateMap<CauHinhPhanHangKhModel, CauHinhPhanHangKh>().ReverseMap();

            CreateMap<Position, PositionModel>().ReverseMap();
            CreateMap<PositionModel, Position>().ReverseMap();

            CreateMap<CauHinhMucChietKhau, CauHinhMucChietKhauModel>().ReverseMap();
            CreateMap<CauHinhMucChietKhauModel, CauHinhMucChietKhau>().ReverseMap();

            CreateMap<PheDuyetChuyenTiepOrder, PheDuyetChuyenTiepOrderModel>().ReverseMap();
            CreateMap<PheDuyetChuyenTiepOrderModel, PheDuyetChuyenTiepOrder>().ReverseMap();

            CreateMap<PheDuyetChuyenTiepOrder, PheDuyetChuyenTiepOrderModel>().ReverseMap();
            CreateMap<PheDuyetChuyenTiepOrderModel, PheDuyetChuyenTiepOrder>().ReverseMap();


            CreateMap<VendorOrderDetailAtr, VendorOrderDetailAtrModel>().ReverseMap();
            CreateMap<VendorOrderDetailAtrModel, VendorOrderDetailAtr>().ReverseMap();

            CreateMap<VendorOrder, VendorOrderEntityModel>().ReverseMap();
            CreateMap<VendorOrderEntityModel, VendorOrder>().ReverseMap();

            CreateMap<CauHinhThongTinWebBanHang, CauHinhThongTinWebBanHangModel>().ReverseMap();
            CreateMap<CauHinhThongTinWebBanHangModel, CauHinhThongTinWebBanHang>().ReverseMap();

            CreateMap<CauHinhDanhGiaWeb, CauHinhDanhGiaWebModel>().ReverseMap();
            CreateMap<CauHinhDanhGiaWebModel, CauHinhDanhGiaWeb>().ReverseMap();

            CreateMap<CauHinhGioiThieuWeb, CauHinhGioiThieuWebModel>().ReverseMap();
            CreateMap<CauHinhGioiThieuWebModel, CauHinhGioiThieuWeb>().ReverseMap();

            CreateMap<CauHinhQuangCaoDoiTac, CauHinhQuangCaoDoiTacModel>().ReverseMap();
            CreateMap<CauHinhQuangCaoDoiTacModel, CauHinhQuangCaoDoiTac>().ReverseMap();

            CreateMap<CauHinhAnhLinkWeb, CauHinhAnhLinkWebModel>().ReverseMap();
            CreateMap<CauHinhAnhLinkWebModel, CauHinhAnhLinkWeb>().ReverseMap();
        }
    }
}