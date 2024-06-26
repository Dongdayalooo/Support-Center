﻿using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Syncfusion.Compression.Zip;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using TN.TNM.Common;
using TN.TNM.DataAccess.Consts.Product;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.AttributeConfiguration;
using TN.TNM.DataAccess.Messages.Parameters.Options;
using TN.TNM.DataAccess.Messages.Results.Admin.Product;
using TN.TNM.DataAccess.Messages.Results.AttributeConfiguration;
using TN.TNM.DataAccess.Messages.Results.Customer;
using TN.TNM.DataAccess.Messages.Results.DataType;
using TN.TNM.DataAccess.Messages.Results.Folder;
using TN.TNM.DataAccess.Messages.Results.MilestoneConfiguration;
using TN.TNM.DataAccess.Messages.Results.Options;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Address;
using TN.TNM.DataAccess.Models.Category;
using TN.TNM.DataAccess.Models.Customer;
using TN.TNM.DataAccess.Models.Folder;
using TN.TNM.DataAccess.Models.Options;
using TN.TNM.DataAccess.Models.Product;
using TN.TNM.DataAccess.Models.Vendor;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class OptionsDAO : BaseDAO, IOptionDataAccess
    {
        private readonly IHostingEnvironment hostingEnvironment;
        public IConfiguration Configuration { get; }
        public TenantContext tenantContext;
        private readonly IMapper _mapper;


        public OptionsDAO(Databases.TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace, IHostingEnvironment _hostingEnvironment, IConfiguration iconfiguration, TenantContext _tenantContext, IMapper mapper)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
            this.hostingEnvironment = _hostingEnvironment;
            this.Configuration = iconfiguration;
            this.tenantContext = _tenantContext;
            _mapper = mapper;
        }
        #region Delete Option
        public Task<DeleteOptionResult> DeleteOption(DeleteOptionParameter parameter)
        {
            try
            {
                //Xác nhận mật khẩu CEO 
                var listCeo = context.Employee.Where(x => x.ChucVuId == 1).ToList();
                var listCeoId = listCeo.Select(x => x.EmployeeId).ToList();
                var listPassWord = context.User.Where(x => listCeoId.Contains(x.EmployeeId.Value)).Select(x => x.Password).ToList();

                var passInput = AuthUtil.GetHashingPassword(parameter.PasswordCeo);

                if (!listPassWord.Contains(passInput))
                {
                    return System.Threading.Tasks.Task.FromResult(new DeleteOptionResult()
                    {
                        StatusCode = System.Net.HttpStatusCode.FailedDependency,
                        MessageCode = "Mật khẩu CEO không đúng!",
                    });
                }

                var listOption = context.Options.Where(x => parameter.Id.Contains(x.Id)).ToList();

                //các thuộc tính của option
                var listAttribute = context.AttributeConfiguration.Where(x => parameter.Id.Contains(x.ObjectId)).ToList();
                if (listAttribute.Count() > 0) context.AttributeConfiguration.RemoveRange(listAttribute);

                var listOptionMappingVendor = context.VendorMappingOption.Where(x => parameter.Id.Contains(x.OptionId)).ToList();
                if (listOptionMappingVendor.Count() > 0) context.VendorMappingOption.RemoveRange(listOptionMappingVendor);

                var listRpOption = context.MilestoneConfiguration.Where(x => parameter.Id.Contains(x.OptionId)).ToList();
                if (listRpOption.Count() > 0) context.MilestoneConfiguration.RemoveRange(listRpOption);

                //Xóa các tùy chọn trong gói
                var listOptionMappingProduct = context.ServicePacketMappingOptions.Where(x => parameter.Id.Contains(x.OptionId.Value)).ToList();
                if (listOptionMappingProduct.Count() > 0) context.ServicePacketMappingOptions.RemoveRange(listOptionMappingProduct);

                //Xóa các phiếu yêu cầu có dịch vụ đó
                var listOptionMappingProductId = listOptionMappingProduct.Select(x => x.Id).ToList();
                var listCustomerOrderDetail = context.CustomerOrderDetail.Where(x => listOptionMappingProductId.Contains(x.OptionId.Value)).ToList();


                var listCustomerOrderId = listCustomerOrderDetail.Select(x => x.OrderId).ToList();

                var listDonDatDvId = context.CustomerOrder.Where(x => listCustomerOrderId.Contains(x.OrderId)).Select(x => x.OrderProcessId).ToList();

                //Xóa các phiếu dịch vụ gán với gói dv
                var listDonDatDv = context.OrderProcess.Where(x => listDonDatDvId.Contains(x.Id)).ToList();

                //Nếu có đơn đặt dv
                if (listDonDatDv.Count() > 0)
                {
                    var listDetailDonDatDv = context.OrderProcessDetail.Where(x => listDonDatDvId.Contains(x.OrderProcessId.Value)).ToList();

                    var listEmpOrderProcess = context.OrderProcessMappingEmployee.Where(x => listDonDatDvId.Contains(x.OrderProcessId.Value)).ToList();

                    //Xóa phiếu yêu cầu gán với orderProcess

                    var listPhieuYc = context.CustomerOrder.Where(x => listDonDatDvId.Contains(x.OrderProcessId.Value)).ToList();

                    var listPhieuYcId = listPhieuYc.Select(x => x.OrderId).ToList();

                    var listYc = context.CustomerOrderDetail.Where(x => listPhieuYcId.Contains(x.OrderId)).ToList();

                    var listYcPhatSinh = context.CustomerOrderDetailExten.Where(x => listPhieuYcId.Contains(x.OrderId)).ToList();

                    var listYcId = listYc.Select(x => x.OrderDetailId).ToList();
                    var listYcExten = context.CustomerOrderExtension.Where(x => listYcId.Contains(x.OrderDetailId.Value)).ToList();

                    var listTask = context.CustomerOrderTask.Where(x => listPhieuYcId.Contains(x.OrderActionId.Value)).ToList();

                    var listTaskId = listTask.Select(x => x.Id).ToList();
                    var listTaskEmp = context.OrderTaskMappingEmp.Where(x => listTaskId.Contains(x.CustomerOrderTaskId)).ToList();


                    var listReportPoint = context.ReportPoint.Where(x => listPhieuYcId.Contains(x.OrderActionId.Value)).ToList();

                    var listReportPointId = listReportPoint.Select(x => x.Id).ToList();

                    var listNoteRp = context.Note.Where(x => x.ObjectType == "Report_Point" && listReportPointId.Contains(x.ObjectId)).ToList();
                    var listNoteOrderAction = context.Note.Where(x => x.ObjectType == "Report_Point" && listPhieuYcId.Contains(x.ObjectId)).ToList();

                    //Xóa các phiếu mua hàng từ Ncc 
                    var listVendorOrder = context.VendorOrder.Where(x => listPhieuYcId.Contains(x.OrderActionId.Value)).ToList();

                    var listVendorOrderId = listVendorOrder.Select(x => x.VendorOrderId).ToList();

                    var listPhieuThuBaoCoMappingCustomerOrder = context.PhieuThuBaoCoMappingCustomerOrder.Where(x => listVendorOrderId.Contains(x.VendorOrderId.Value)).ToList();

                    var listVendorOrderCostDetail = context.VendorOrderDetail.Where(x => listVendorOrderId.Contains(x.VendorOrderId)).ToList();

                    var listVendorOrderProcurementRequestMapping = context.VendorOrderProcurementRequestMapping.Where(x => listVendorOrderId.Contains(x.VendorOrderId.Value)).ToList();


                    if (listPhieuThuBaoCoMappingCustomerOrder.Count() > 0) context.PhieuThuBaoCoMappingCustomerOrder.RemoveRange(listPhieuThuBaoCoMappingCustomerOrder);
                    if (listVendorOrderCostDetail.Count() > 0) context.VendorOrderDetail.RemoveRange(listVendorOrderCostDetail);
                    if (listVendorOrderProcurementRequestMapping.Count() > 0) context.VendorOrderProcurementRequestMapping.RemoveRange(listVendorOrderProcurementRequestMapping);
                    if (listVendorOrder.Count() > 0) context.VendorOrder.RemoveRange(listVendorOrder);
                    context.ChangeTracker.AutoDetectChangesEnabled = false;
                    context.SaveChanges();

                    if (listNoteRp.Count() > 0) context.Note.RemoveRange(listNoteRp);
                    if (listNoteOrderAction.Count() > 0) context.Note.RemoveRange(listNoteOrderAction);

                    if (listReportPoint.Count() > 0) context.ReportPoint.RemoveRange(listReportPoint);

                    if (listTaskEmp.Count() > 0) context.OrderTaskMappingEmp.RemoveRange(listTaskEmp);
                    if (listTask.Count() > 0) context.CustomerOrderTask.RemoveRange(listTask);
                    context.ChangeTracker.AutoDetectChangesEnabled = false;
                    context.SaveChanges();

                    if (listYcExten.Count() > 0) context.CustomerOrderExtension.RemoveRange(listYcExten);
                    if (listYcPhatSinh.Count() > 0) context.CustomerOrderDetailExten.RemoveRange(listYcPhatSinh);
                    context.ChangeTracker.AutoDetectChangesEnabled = false;
                    context.SaveChanges();
                    if (listYc.Count() > 0) context.CustomerOrderDetail.RemoveRange(listYc);
                    if (listEmpOrderProcess.Count() > 0) context.OrderProcessMappingEmployee.RemoveRange(listEmpOrderProcess);
                    if (listDetailDonDatDv.Count() > 0) context.OrderProcessDetail.RemoveRange(listDetailDonDatDv);
                    context.ChangeTracker.AutoDetectChangesEnabled = false;
                    context.SaveChanges();
                    if (listPhieuYc.Count() > 0) context.CustomerOrder.RemoveRange(listPhieuYc);
                    context.OrderProcess.RemoveRange(listDonDatDv);
                }

                context.ChangeTracker.AutoDetectChangesEnabled = false;
                context.SaveChanges();

                context.Options.RemoveRange(listOption);
                context.SaveChanges();
                return System.Threading.Tasks.Task.FromResult(new DeleteOptionResult()
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    MessageCode = "Thành công!",
                });
            }
            catch (Exception)
            {
                return System.Threading.Tasks.Task.FromResult(new DeleteOptionResult()
                {
                    MessageCode = "Đã có lỗi xảy ra trong quá trình xóa bản ghi",
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                });
            }
        }
        #endregion
        #region Get Attribute Category List
        public async Task<GetListCategoryAttributesResult> GetListCategoryAttributesResult()
        {
            try
            {
                var listDataType = GeneralList.GetGiaTriThuocTinh();
                var result = await (from c in context.Category
                                    join a in context.AttributeConfiguration
                                    on c.CategoryId equals a.CategoryId
                                    where a.ObjectType == 1
                                    orderby a.UpdatedDate descending
                                    select new ListCategoryAttributes
                                    {
                                        Id = a.Id,
                                        CategoryName = c.CategoryName,
                                        DataType = listDataType.FirstOrDefault(x => x.Value == a.DataType).Name,
                                        CategoryId = c.CategoryId,
                                    }).ToListAsync();


                return new GetListCategoryAttributesResult()
                {
                    ListCategoryAttributes = result,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new GetListCategoryAttributesResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        #endregion
        #region Search Options
        public async Task<SearchOptionsResult> SearchOption(SearchOptionParameter parameter)
        {
            try
            {
                var result = await (from o in context.Options
                                    join c in context.Category
                                    on o.CategoryId equals c.CategoryId
                                    join a in context.CategoryType
                                    on c.CategoryTypeId equals a.CategoryTypeId
                                    where a.CategoryTypeCode == ProductConsts.CategoryTypeCodeService
                                    && (parameter.ListCategoryId == null ||
                                    parameter.ListCategoryId.Count == 0 ||
                                    parameter.ListCategoryId.Contains(o.CategoryId))
                                    orderby o.UpdatedDate descending
                                    select new SearchOptions
                                    {
                                        CategoryId = c.CategoryId,
                                        CategoryName = c.CategoryName,
                                        OptionName = o.Name,
                                        Price = o.Price,
                                        OptionId = o.Id,
                                        Description = o.Description,
                                        ParentId = o.ParentId,
                                        VAT = o.Vat
                                    }).ToListAsync();

                return new SearchOptionsResult()
                {
                    ListOptions = result,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchOptionsResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }


        }
        #endregion
        #region 
        public async Task<GetListCategoryAttributesResult> ListAttributeResult()
        {
            try
            {
                var listDataType = GeneralList.GetGiaTriThuocTinh();
                var result = await (from c in context.Category
                                    join ct in context.CategoryType
                                    on c.CategoryTypeId equals ct.CategoryTypeId
                                    where ct.CategoryTypeCode == ProductConsts.CategoryTypeCodeATR
                                    select new ListCategoryAttributes
                                    {
                                        CategoryName = c.CategoryName,
                                        CategoryId = c.CategoryId,
                                    }).ToListAsync();


                return new GetListCategoryAttributesResult()
                {
                    ListCategoryAttributes = result,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new GetListCategoryAttributesResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        #endregion
        #region Get DataType
        public async Task<DataTypeResult> GetListDataType()
        {
            try
            {
                var listDataType = GeneralList.GetGiaTriThuocTinh();
                return new DataTypeResult()
                {
                    GetGiaTriThuocTinh = listDataType,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new DataTypeResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        #endregion
        #region Get Option By Id
        public async Task<SearchOptionsResult> GetOptionById(GetOptionByIdParameter parameter)
        {
            try
            {
                var result = await (from o in context.Options
                                    join c in context.Category
                                    on o.CategoryId equals c.CategoryId
                                    join ct in context.CategoryType
                                    on c.CategoryTypeId equals ct.CategoryTypeId
                                    where ct.CategoryTypeCode == ProductConsts.CategoryTypeCodeService
                                    && o.Id == parameter.Id
                                    orderby o.UpdatedDate descending
                                    select new OptionsEntityModel
                                    {
                                        Id = o.Id,
                                        CategoryId = c.CategoryId,
                                        CategoryUnitId = o.CategoryUnitId,
                                        Name = o.Name,
                                        Description = o.Description,
                                        Price = o.Price,
                                        ParentId = o.ParentId,
                                        VAT = o.Vat,
                                        ProvinceId = o.ProvinceId,
                                        DistrictId = o.DistrictId,
                                        WardId = o.WardId,
                                        ThanhToanTruoc = o.ThanhToanTruoc
                                    }).FirstOrDefaultAsync();

                return new SearchOptionsResult()
                {
                    OptionsEntityModel = result,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchOptionsResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        #endregion
        #region Create new attribute config
        public async Task<CreateOrUpdateAttributeConfigureResult> CreateAttributeConfigure(CreateOrUpdateAttributeConfigureParamenter paramenter)
        {
            try
            {
                //var options = _mapper.Map<Options>(paramenter.OptionsEntityModel);
                var mess = "Thêm thuộc tính bổ sung thành công!";
                if (paramenter.AttributeConfigurationModel.Id != null && paramenter.AttributeConfigurationModel.Id != Guid.Empty)
                {
                    var attrConfig = context.AttributeConfiguration.FirstOrDefault(x => x.Id == paramenter.AttributeConfigurationModel.Id);
                    if(attrConfig == null)
                    {
                        return new CreateOrUpdateAttributeConfigureResult()
                        {
                            StatusCode = HttpStatusCode.OK,
                            MessageCode = "Thuộc tính không tồn tại trên hệ thống!"
                        };
                    }
                    mess = "Cập nhật thuộc tính bổ sung thành công!";
                    attrConfig.CategoryId = paramenter.AttributeConfigurationModel.CategoryId.Value;
                    attrConfig.DataType = paramenter.AttributeConfigurationModel.DataType.Value;
                    attrConfig.UpdatedById = paramenter.UserId;
                    attrConfig.UpdatedDate = DateTime.Now;
                    context.AttributeConfiguration.Update(attrConfig);
                }
                else
                {
                    var attrConfig = _mapper.Map<AttributeConfiguration>(paramenter.AttributeConfigurationModel);
                    attrConfig.Id = Guid.NewGuid();
                    attrConfig.ObjectType = 1;
                    attrConfig.CreatedById = paramenter.UserId;
                    attrConfig.CreatedDate = DateTime.Now;
                    context.AttributeConfiguration.Add(attrConfig);
                }
                context.SaveChanges();
                return new CreateOrUpdateAttributeConfigureResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = mess
                };
            }
            catch (Exception e)
            {
                return new CreateOrUpdateAttributeConfigureResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }
        #endregion
        public async Task<CreateOrUpdateOptionResult> CreateOrUpdateOptions(CreateOrUpdateOptionParameter parameter)
        {
            try
            {
                var options = _mapper.Map<Options>(parameter.OptionsEntityModel);
                if (options.Id != null & options.Id != Guid.Empty)
                {
                    options.UpdatedDate = DateTime.Now;
                    options.UpdatedById = parameter.UserId;
                    context.Options.Update(options);
                }
                else
                {
                    options.Id = Guid.NewGuid();
                    options.CreatedDate = DateTime.Now;
                    options.CreatedById = parameter.UserId; 
                    context.Options.Add(options);
                }

                context.SaveChanges();
                return new CreateOrUpdateOptionResult()
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new CreateOrUpdateOptionResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public async Task<GetOptionCategoryResult> GetOptionCategoryUnit()
        {
            try
            {
                var listOptionCategory = await (from c in context.Category
                                                join ct in context.CategoryType
                                                on c.CategoryTypeId equals ct.CategoryTypeId
                                                where ct.CategoryTypeCode == ProductConsts.CategoryTypeCodeUnit
                                                select new OptionCategory
                                                {
                                                    CategoryName = c.CategoryName,
                                                    CategoryId = c.CategoryId
                                                }).ToListAsync();

                
                var listProvince = await (from c in context.Province select _mapper.Map<ProvinceEntityModel>(c)).ToListAsync();
                var listDistrict = await (from c in context.District select _mapper.Map<DistrictEntityModel>(c)).ToListAsync();
                var listWard = await (from c in context.Ward select _mapper.Map<WardEntityModel>(c)).ToListAsync();

                return new GetOptionCategoryResult()
                {
                    ListProvince = listProvince,
                    ListDistrict = listDistrict,
                    ListWard = listWard,
                    OptionCategory = listOptionCategory,
                    StatusCode = HttpStatusCode.OK
                };

            }
            catch (Exception e)
            {
                return new GetOptionCategoryResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public async Task<GetOptionCategoryResult> GetOptionCategory()
        {
            try
            {
                var listOptionCategory = await (from c in context.Category
                                                join ct in context.CategoryType
                                                on c.CategoryTypeId equals ct.CategoryTypeId
                                                where ct.CategoryTypeCode == ProductConsts.CategoryTypeCodeService
                                                select new OptionCategory
                                                {
                                                    CategoryName = c.CategoryName,
                                                    CategoryId = c.CategoryId
                                                }).ToListAsync();
                return new GetOptionCategoryResult()
                {
                    OptionCategory = listOptionCategory,
                    StatusCode = HttpStatusCode.OK
                };

            }
            catch (Exception e)
            {
                return new GetOptionCategoryResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public async Task<GetListCategoryAttributesResult> GetListCategoryAttributesById(GetListCategoryAttributesByIdParameter parameter)
        {
            try
            {
                var listDataType = GeneralList.GetTrangThais("DataTypeAttr").ToList();
                var result = await (from c in context.Category
                                    join a in context.AttributeConfiguration
                                    on c.CategoryId equals a.CategoryId
                                    where a.ObjectType == 1 && a.ObjectId == parameter.Id
                                    orderby a.UpdatedDate descending
                                    select new ListCategoryAttributes
                                    {
                                        Id = a.Id,
                                        CategoryName = c.CategoryName,
                                        DataType = listDataType.FirstOrDefault(x => x.Value == a.DataType).Name,
                                        DataTypeValue = a.DataType,
                                        CategoryId = c.CategoryId,
                                        CreatedDate = a.CreatedDate
                                    }).OrderBy(x => x.CreatedDate).ToListAsync();

                var attrCateTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == ProductConsts.CategoryTypeCodeATR).CategoryTypeId;
                var listAttr = context.Category.Where(x => x.CategoryTypeId == attrCateTypeId ).Select(x => new CategoryEntityModel
                {
                    CategoryId = x.CategoryId,
                    CategoryName = x.CategoryName
                }).ToList();


                return new GetListCategoryAttributesResult()
                {
                    ListCategoryAttributes = result,
                    ListAttr = listAttr,
                    ListDataType = listDataType,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new GetListCategoryAttributesResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public async Task<DeleteAttributeConfigureResult> DeleteAttributeConfigure(DeleteAttributeConfigureParameter parameter)
        {
            try
            {
                var item = await context.AttributeConfiguration.FirstOrDefaultAsync(x => x.Id == parameter.Id);
                if (item == null)
                {
                    return new DeleteAttributeConfigureResult()
                    {
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tìm thấy tùy chọn dịch vụ!",
                    };
                }
                else
                {
                    context.AttributeConfiguration.Remove(item);
                    context.SaveChanges();
                    return new DeleteAttributeConfigureResult()
                    {
                        StatusCode = System.Net.HttpStatusCode.OK,
                        MessageCode = "Xóa thành công!",
                    };
                }
            }
            catch (Exception e)
            {
                return new DeleteAttributeConfigureResult()
                {
                    MessageCode = "Đã có lỗi xảy ra trong quá trình xóa bản ghi",
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                };
            }
        }

        //public async Task<SearchOptionsResult> SearchOptionTree(SearchOptionParameter parameter)
        //{
        //    try
        //    {
        //        var result = await (from o in context.Options
        //                            join c in context.Category
        //                            on o.CategoryId equals c.CategoryId
        //                            join a in context.CategoryType
        //                            on c.CategoryTypeId equals a.CategoryTypeId
        //                            where a.CategoryTypeCode == OptionsConsts.ProductCodeType
        //                            select new SearchOptionTree
        //                            {
        //                                CategoryName = c.CategoryName,
        //                                OptionName = o.Name,
        //                                Price = o.Price,
        //                                OptionId = o.Id,
        //                            }).ToListAsync();
        //        return new SearchOptionsResult()
        //        {
        //            ListOptions = result,
        //            StatusCode = HttpStatusCode.OK
        //        };
        //    }
        //    catch (Exception e)
        //    {
        //        return new SearchOptionsResult()
        //        {
        //            StatusCode = HttpStatusCode.ExpectationFailed,
        //            MessageCode = e.Message
        //        };
        //    }
        //}

        public async Task<SearchOptionsResult> SearchOptionTree(SearchOptionTreeParameter parameter)
        {
            try
            {
                var listOPtionId = new List<Guid?>();
                listOPtionId.Add(parameter.OptionId);
                listOPtionId = getOptionChildrenId(parameter.OptionId, listOPtionId);

                var result = await (from o in context.Options
                                    join c in context.Category
                                    on o.CategoryId equals c.CategoryId
                                    join a in context.CategoryType
                                    on c.CategoryTypeId equals a.CategoryTypeId
                                    where a.CategoryTypeCode == ProductConsts.CategoryTypeCodeService && listOPtionId.Contains(o.Id)
                                    orderby o.UpdatedDate descending
                                    select new SearchOptions
                                    {
                                        CategoryName = c.CategoryName,
                                        OptionName = o.Name,
                                        Price = o.Price,
                                        OptionId = o.Id,
                                        ParentId = o.ParentId,
                                        Description = o.Description
                                    }).ToListAsync();
                result.ForEach(x => x.HasChild = result.FirstOrDefault(t => t.ParentId == x.OptionId) != null);

                return new SearchOptionsResult()
                {
                    ListOptions = result,
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new SearchOptionsResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
            //try
            //{

            //    var listOption = await (from o in context.Options
            //                            join c in context.Category
            //                            on o.CategoryId equals c.CategoryId
            //                            join a in context.CategoryType
            //                             on c.CategoryTypeId equals a.CategoryTypeId
            //                            where a.CategoryTypeCode == OptionsConsts.ProductCodeType
            //                            select new SearchOptionTree
            //                            {
            //                                CategoryName = c.CategoryName,
            //                                OptionName = o.Name,
            //                                Price = o.Price,
            //                                OptionId = o.Id,
            //                                ParentId = o.ParentId,
            //                                ListOptionTrees = new List<SearchOptionTree>()
            //                            }).ToListAsync();
            //    listOption.ForEach(x =>
            //    {
            //        var listChild = listOption.Where(y => y.ParentId == x.OptionId).Select(
            //            z => new SearchOptionTree
            //            {
            //                CategoryName = z.CategoryName,
            //                OptionName = z.OptionName,
            //                Price = z.Price,
            //                OptionId = z.OptionId,
            //                ParentId = z.ParentId,
            //                ListOptionTrees = new List<SearchOptionTree>()
            //            }
            //            ).ToList();
            //        x.HasChild = listOption.FirstOrDefault(t => t.ParentId == x.OptionId) != null;
            //        x.ListOptionTrees = listChild;

            //    });
            //    listOption.ForEach(item =>
            //{
            //    var listFileInFolder = listFile.Where(x => x.FolderId == item.FolderId).Select(y => new FileInFolderEntityModel()
            //    {
            //        Active = y.Active,
            //        FileInFolderId = y.FileInFolderId,
            //        FileName = y.FileName,
            //        FolderId = y.FolderId,
            //        ObjectId = y.ObjectId,
            //        ObjectType = y.ObjectType,
            //        Size = y.Size,
            //        FileExtension = y.FileExtension
            //    }).ToList();
            //    item.HasChild = listFolderResult.FirstOrDefault(z => z.ParentId == item.FolderId) != null;
            //    item.ListFile = listFileInFolder;
            //});

            //return new SearchOptionsResult()
            //{
            //    ListOptionTrees = listOption,
            //    StatusCode = HttpStatusCode.OK
            //};
            //}
            //var listFolderId = listFolderResult.Select(x => x.FolderId).ToList();
            //var listFile = context.FileInFolder.Where(x => listFolderId.Contains(x.FolderId)).ToList();



            //    catch (Exception e)
            //    {
            //        return new SearchOptionsResult()
            //{
            //    StatusCode = HttpStatusCode.ExpectationFailed,
            //            MessageCode = e.Message
            //        };
            //}
        }

        public GetMasterDataAddVendorToOptionResult GetMasterDataAddVendorToOption(GetMasterDataAddVendorToOptionParameter parameter)
        {
            var commonCategoryType = context.CategoryType.Where(x => x.CategoryTypeCode == "NCA" || x.CategoryTypeCode == "NH" || x.CategoryTypeCode == "DKHHH").ToList();
            var listCommonCategoryTypeId = commonCategoryType.Select(x => x.CategoryTypeId).ToList();
            var commonCategory = context.Category.Where(x => listCommonCategoryTypeId.Contains(x.CategoryTypeId)).ToList();

            //Nhóm nhà cung cấp
            var vendorGroupCateTypeId = commonCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "NCA").CategoryTypeId;
            var listVendorGroup = commonCategory.Where(x => x.CategoryTypeId == vendorGroupCateTypeId).Select(x => new CategoryEntityModel { 
                CategoryId = x.CategoryId,
                CategoryName = x.CategoryName
            }).ToList();

            //Điều kiện hưởng hoa hồng
            var dieuKienHoaHongCatetypeId = commonCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DKHHH").CategoryTypeId;
            var listDieuKienHoaHong = commonCategory.Where(x => x.CategoryTypeId == dieuKienHoaHongCatetypeId).Select(x => new CategoryEntityModel
            {
                CategoryId = x.CategoryId,
                CategoryName = x.CategoryName
            }).ToList();


            //danh sashc ngân hàng
            var bankCateTypeId = commonCategoryType.FirstOrDefault(x => x.CategoryTypeCode == "NH").CategoryTypeId;
            var listBank = commonCategory.Where(x => x.CategoryTypeId == bankCateTypeId).Select(x => new CategoryEntityModel
            {
                CategoryId = x.CategoryId,
                CategoryName = x.CategoryName
            }).ToList();

            var commonContact = context.Contact.Where(w => w.Active == true && w.ObjectType == ObjectType.VENDOR).ToList();

            var vendorList = (from v in context.Vendor.Where(w => w.Active == true)
                             join c in context.Contact.Where(x => x.ObjectType == ObjectType.VENDOR) on v.VendorId equals c.ObjectId

                             join gp in listVendorGroup on v.VendorGroupId equals gp.CategoryId
                             into gpData
                             from gp in gpData.DefaultIfEmpty()

                             select new VendorEntityModel
                             {
                                VendorId = v.VendorId,
                                ContactId = c.ContactId,
                                VendorName = v.VendorName,
                                VendorGroupId = v.VendorGroupId,
                                VendorGroupName = gp.CategoryName,
                                VendorCode = v.VendorCode,
                                Address = c.Address,
                                Email = c.Email,
                                PhoneNumber = c.Phone,
                                Active = v.Active
                            }).OrderByDescending(v => v.CreatedDate).ToList();

            var listVendorMappingOptionByOptionId = context.VendorMappingOption.Where(x => x.OptionId == parameter.OptionId).ToList();


            //Lấy đơn vị tiền
            var donViTienCategoryTypeId = context.CategoryType.FirstOrDefault(x => x.CategoryTypeCode == "DTI")?.CategoryTypeId;
            var listDonViTien = context.Category.Where(x => x.CategoryTypeId == donViTienCategoryTypeId).Select(x => _mapper.Map<CategoryEntityModel>(x)).ToList();

            var listVendorMappingOption = (from mapping in listVendorMappingOptionByOptionId
                                           join contact in context.Contact on mapping.VendorId equals contact.ObjectId
                                           into contactVendor
                                           from cv in contactVendor.DefaultIfEmpty()

                                           join vendor in vendorList on mapping.VendorId equals vendor.VendorId
                                           into v
                                           from ven in v.DefaultIfEmpty()

                                           where mapping.OptionId == parameter.OptionId &&
                                           (parameter.ListVendorId == null || parameter.ListVendorId.Count() == 0 || parameter.ListVendorId.Contains(mapping.VendorId)) &&
                                           (parameter.DonGiaTu == null || parameter.DonGiaTu > mapping.Price) && 
                                           (parameter.DonGiaDen == null || parameter.DonGiaDen < mapping.Price) && 
                                           (parameter.ThoiGianTu == null || parameter.ThoiGianTu > mapping.ThoiGianTu) && 
                                           (parameter.ThoiGianDen == null || parameter.ThoiGianDen < mapping.ThoiGianDen)

                                           select new VendorMappingOptionEntityModel
                                           {
                                               Id = mapping.Id,
                                               VendorId = ven.VendorId,
                                               VendorName = ven.VendorName,
                                               VendorGroupName = ven.VendorGroupName,
                                               VendorCode = ven.VendorCode,
                                               Address = cv.Address,
                                               Email = cv.Email,
                                               PhoneNumber = cv.Phone,
                                               Price = mapping.Price,
                                               SoLuongToiThieu = mapping.SoLuongToiThieu,
                                               YeuCauThanhToan = mapping.YeuCauThanhToan,
                                               GiaTriThanhToan = mapping.GiaTriThanhToan,
                                               ThoiGianDen = mapping.ThoiGianDen,
                                               ThoiGianTu = mapping.ThoiGianTu,
                                               DonViTien = listDonViTien.FirstOrDefault(x => x.CategoryId == mapping.DonViTienId)?.CategoryName,
                                               ChietKhauId = mapping.ChietKhauId,
                                               GiaTriChietKhau = mapping.GiaTriChietKhau,
                                               DonViTienId = mapping.DonViTienId,
                                               ThueGtgt = mapping.ThueGtgt
                                           }).ToList();

            //Danh sách kiểu thanh toán trước 
            var listKieuThanhToan = GeneralList.GetKieuThanhToanTruoc().ToList();

            var thanhToanTruoc = context.Options.FirstOrDefault(x => x.Id == parameter.OptionId)?.ThanhToanTruoc;

            var listVendorMappingOptionId = listVendorMappingOption.Select(x => x.Id).ToList();



            var listCauHinhHoaHong = (from hh in context.CauHinhMucHoaHong
                                     join dkien in context.Category on hh.DieuKienId equals dkien.CategoryId
                                     into dieuKien
                                     from dk in dieuKien.DefaultIfEmpty()
                                     where listVendorMappingOptionId.Contains(hh.VendorMappingOptionId)
                                      select new CauHinhMucHoaHongModel() { 
                                            Id = hh.Id,
                                         VendorMappingOptionId = hh.VendorMappingOptionId,
                                         LoaiHoaHong = hh.LoaiHoaHong,
                                         GiaTriHoaHong = hh.GiaTriHoaHong,
                                         DieuKienId = hh.DieuKienId,
                                         GiaTriTu = hh.GiaTriTu,
                                         GiaTriDen = hh.GiaTriDen,
                                         CreatedDate = hh.CreatedDate,
                                         ParentId = hh.ParentId,
                                         DieuKienName = dk.CategoryName,
                                     }).OrderBy(x => x.LoaiHoaHong).ThenBy(x => x.GiaTriHoaHong).ThenBy(x => x.GiaTriTu).ToList();


            return new GetMasterDataAddVendorToOptionResult()
            {
                StatusCode = HttpStatusCode.OK,
                ListDieuKienHoaHong = listDieuKienHoaHong,
                ListCauHinhHoaHong = listCauHinhHoaHong,
                VendorList = vendorList,
                ListDonViTien = listDonViTien,
                ThanhToanTruoc = thanhToanTruoc,
                ListVendorGroup = listVendorGroup,
                ListBank = listBank,
                ListVendorMappingOption = listVendorMappingOption,
                ListKieuThanhToan = listKieuThanhToan,
            };
        }

        private List<Guid?> getOptionChildrenId(Guid? id, List<Guid?> list)
        {
            var Organization = context.Options.Where(o => o.ParentId == id).ToList();
            Organization.ForEach(item =>
            {
                list.Add(item.Id);
                getOptionChildrenId(item.Id, list);
            });
            return list;
        }

        public AddVendorToOptionResult AddVendorToOption(AddVendorToOptionParameter parameter)
        {
            try
            {
                var thoiGianTu = parameter.VendorMappingOption.ThoiGianTu.Value.Date;
                var thoiGianDen = parameter.VendorMappingOption.ThoiGianDen.Value.Date;
                //Kiểm tra xem nhà cung cấp đấy có giá và thời gian hiệu lực bị giao trong tùy chọn chưa?
                var check = context.VendorMappingOption.FirstOrDefault(x => 
                                x.OptionId == parameter.OptionId && x.VendorId == parameter.VendorMappingOption.VendorId &&
                                (
                                    (thoiGianTu <= x.ThoiGianTu.Value.Date && x.ThoiGianTu.Value.Date <= thoiGianDen && thoiGianDen <= x.ThoiGianDen.Value.Date) ||
                                    (x.ThoiGianTu.Value.Date <= thoiGianTu && thoiGianTu <= x.ThoiGianDen.Value.Date && x.ThoiGianDen.Value.Date <= thoiGianDen) ||
                                    (x.ThoiGianTu.Value.Date < thoiGianTu && thoiGianDen <= x.ThoiGianDen.Value.Date) ||
                                    (thoiGianTu <= x.ThoiGianTu.Value.Date && x.ThoiGianDen.Value.Date <= thoiGianDen)
                                ) &&
                                (parameter.VendorMappingOption.Id == null || parameter.VendorMappingOption.Id == Guid.Empty || x.Id != parameter.VendorMappingOption.Id));

                if(check != null)
                {
                    return new AddVendorToOptionResult()
                    {
                        MessageCode = "Thời gian hiệu lực của nhà cung cấp đã giao nhau, vui lòng kiểm tra lại!",
                        StatusCode = System.Net.HttpStatusCode.FailedDependency,
                    };
                }
                Guid Id = Guid.Empty;

                //Nếu là tạo mới
                if(parameter.VendorMappingOption.Id == null || parameter.VendorMappingOption.Id == Guid.Empty){
                    var newObj = _mapper.Map<VendorMappingOption>(parameter.VendorMappingOption);
                    newObj.Id = Guid.NewGuid();
                    newObj.CreatedById = parameter.UserId;
                    newObj.CreatedDate = DateTime.Now;
                    context.VendorMappingOption.Add(newObj);
                    Id = newObj.Id;
                }
                //Nếu là cập nhật
                else
                {
                    var data = context.VendorMappingOption.FirstOrDefault(x => x.Id == parameter.VendorMappingOption.Id);
                    if(data == null)
                    {
                        return new AddVendorToOptionResult()
                        {
                            MessageCode = "Nhà cung cấp không tồn tại trong dữ liệu gói, vui lòng tải lại trang!",
                            StatusCode = System.Net.HttpStatusCode.OK,
                        };
                    }

                    data.SoLuongToiThieu = parameter.VendorMappingOption.SoLuongToiThieu;
                    data.Price = parameter.VendorMappingOption.Price;
                    data.GiaTriThanhToan = parameter.VendorMappingOption.GiaTriThanhToan;
                    data.YeuCauThanhToan = parameter.VendorMappingOption.YeuCauThanhToan;

                    data.ChietKhauId = parameter.VendorMappingOption.ChietKhauId;
                    data.GiaTriChietKhau = parameter.VendorMappingOption.GiaTriChietKhau;
                    data.DonViTienId = parameter.VendorMappingOption.DonViTienId;
                    data.ThueGtgt = parameter.VendorMappingOption.ThueGtgt;

                    data.ThoiGianTu = parameter.VendorMappingOption.ThoiGianTu;
                    data.ThoiGianDen = parameter.VendorMappingOption.ThoiGianDen;
                    data.UpdatedById = parameter.UserId;
                    data.UpdatedDate = DateTime.Now;
                    context.VendorMappingOption.Update(data);
                    Id = data.Id;
                }

                //Xóa cấu hình cũ => Thêm lại 
                var listDieuKienHoaHongCu = context.CauHinhMucHoaHong.Where(x => x.VendorMappingOptionId == Id).ToList();
                context.CauHinhMucHoaHong.RemoveRange(listDieuKienHoaHongCu);

                var listCauHinhHoaHong = new List<CauHinhMucHoaHong>();
                parameter.ListCauHinhHoaHong.ForEach(item =>
                {
                    if(item.IndexParent == null)
                    {
                        var listChild = parameter.ListCauHinhHoaHong.Where(x => x.IndexParent == item.Index).ToList();
                        var objLv0 = _mapper.Map<CauHinhMucHoaHong>(item);
                        objLv0.Id = Guid.NewGuid();
                        objLv0.VendorMappingOptionId = Id;
                        objLv0.CreatedDate = DateTime.Now;
                        listCauHinhHoaHong.Add(objLv0);

                        listChild.ForEach(child =>
                        {
                            var objLv1 = _mapper.Map<CauHinhMucHoaHong>(child);
                            objLv1.Id = Guid.NewGuid();
                            objLv1.VendorMappingOptionId = Id;
                            objLv1.ParentId = objLv0.Id;
                            objLv1.CreatedDate = DateTime.Now;
                            listCauHinhHoaHong.Add(objLv1);
                        });
                    }
                });

                if(listCauHinhHoaHong.Count() > 0)
                {
                    context.CauHinhMucHoaHong.AddRange(listCauHinhHoaHong);
                }

                context.SaveChanges();
                return new AddVendorToOptionResult()
                {
                    MessageCode = parameter.VendorMappingOption.Id == null || parameter.VendorMappingOption.Id == Guid.Empty ? "Thêm thành công!" : "Cập nhật thành công!",
                    StatusCode = System.Net.HttpStatusCode.OK,
                };
            }
            catch (Exception e)
            {
                return new AddVendorToOptionResult()
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message.ToString(),
                };
            }
        }

        public DeleteVendorMappingOptionResult DeleteVendorMappingOption(DeleteVendorMappingOptionParameter parameter)
        {
            try
            {
                var vendor = context.VendorMappingOption.FirstOrDefault(x => x.VendorId == parameter.VendorId && x.OptionId == parameter.OptionId);
                if(vendor == null)
                {
                    return new DeleteVendorMappingOptionResult()
                    {
                        MessageCode = "Không tìm thấy nhà cung cấp trong dịch vụ!",
                        StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    };
                }
                context.VendorMappingOption.Remove(vendor);
                context.SaveChanges();
                return new DeleteVendorMappingOptionResult()
                {
                    MessageCode = "Xóa nhà cung cấp thành công!",
                    StatusCode = System.Net.HttpStatusCode.OK,
                };
            }
            catch (Exception e)
            {
                return new DeleteVendorMappingOptionResult()
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message,
                };
            }
        }

        public UpdatePriceVendorMappingOptionResult UpdatePriceVendorMappingOption(UpdatePriceVendorMappingOptionParameter parameter)
        {
            try
            {
                var vendorMappingOption = context.VendorMappingOption.Where(x => x.VendorId == parameter.VendorId && x.OptionId == parameter.OptionId).FirstOrDefault();
                vendorMappingOption.Price = parameter.Price;
                context.Update(vendorMappingOption);
                context.SaveChanges();

                return new UpdatePriceVendorMappingOptionResult()
                {
                    Message = "Cập nhật thành công!",
                    StatusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception e)
            {
                return new UpdatePriceVendorMappingOptionResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message,
                };
            }
        }

        public ImportVendorMappingOptionsResult ImportVendorMappingOptions(ImportVendorMappingOptionsParameter parameter)
        {
            using (var transaction = context.Database.BeginTransaction())
            {
                try
                {
                    var listVendorMappingOption = new List<VendorMappingOption>();
                    var listAllVendor = context.Vendor.ToList();
                    var listAllVendorMappingOption = context.VendorMappingOption.Where(x => x.OptionId == parameter.OptionId)
                        .Select(x => new VendorMappingOptionEntityModel
                        {
                            OptionId = x.OptionId,
                            ThoiGianTu = x.ThoiGianTu,
                            ThoiGianDen = x.ThoiGianDen,
                            VendorId = x.VendorId,
                            IsNew = false,
                        }).ToList();

                    bool isErr = false;

                    parameter.ListImport.ForEach(item =>
                    {
                        item.ListErr = new List<string>();

                        //Check required
                        if (string.IsNullOrEmpty(item.VendorName)) item.ListErr.Add("Tên nhà cung cấp không được để trống!");
                        if (item.ThoiGianTu == null) item.ListErr.Add("Thời gian bắt đầu không được để trống!");
                        if (item.ThoiGianDen == null) item.ListErr.Add("Thời gian kết thúc không được để trống!");

                        //Validate
                        if (item.Price != null && item.Price <= 0) item.ListErr.Add("Đơn giá không được nhỏ hơn 0!");
                        if (item.YeuCauThanhToan != null && item.YeuCauThanhToan != 1 && item.YeuCauThanhToan != 2) item.ListErr.Add("Kiểu thanh toán nhập chỉ được nhập vào 1 giá trị sau đây: 1 (Thanh toán theo %), 2 (Thanh toán theo số tiền)");
                        if (item.GiaTriThanhToan != null && item.GiaTriThanhToan <= 0) item.ListErr.Add("Giá trị thanh toán không được nhỏ hơn 0!");


                        //CheckExist
                        var existVendor = listAllVendor.FirstOrDefault(x => x.VendorName == item.VendorName);
                        if(existVendor == null) item.ListErr.Add("Nhà cung cấp không tồn tại trên hệ thống. Vui lòng nhập đúng tên nhà cung cấp!");

                        //Kiểm tra xem các khoảng thời gian của nhà cung cấp có giao nhau không
                        if(existVendor != null)
                        {
                            var check = listAllVendorMappingOption.Where(x =>
                               x.OptionId == parameter.OptionId && x.VendorId == existVendor.VendorId &&
                               (
                                    (item.ThoiGianTu <= x.ThoiGianTu.Value.Date && x.ThoiGianTu.Value.Date <= item.ThoiGianDen && item.ThoiGianDen <= x.ThoiGianDen.Value.Date) ||
                                    (x.ThoiGianTu.Value.Date <= item.ThoiGianTu && item.ThoiGianTu <= x.ThoiGianDen.Value.Date && x.ThoiGianDen.Value.Date <= item.ThoiGianDen) ||
                                    (x.ThoiGianTu.Value.Date < item.ThoiGianTu && item.ThoiGianDen <= x.ThoiGianDen.Value.Date) ||
                                    (item.ThoiGianTu <= x.ThoiGianTu.Value.Date && x.ThoiGianDen.Value.Date <= item.ThoiGianDen)
                                )).ToList();

                            if (check.Count > 0)
                            {
                                if (check.FirstOrDefault(x => x.IsNew == false) != null) item.ListErr.Add("Thời gian hiệu lực của nhà cung cấp đã giao nhau so với dữ liệu đã có, vui lòng kiểm tra lại!");
                                if (check.FirstOrDefault(x => x.IsNew == true) != null) item.ListErr.Add("Thời gian hiệu lực của nhà cung cấp đã giao nhau so với dữ liệu trong file nhập, vui lòng kiểm tra lại!");
                            }
                        }

                        //Nếu không có lỗi thì thêm vào dsach add
                        if (item.ListErr.Count() == 0)
                        {
                            var newObj = new VendorMappingOption();
                            newObj.Id = Guid.NewGuid();
                            newObj.VendorId = existVendor.VendorId;
                            newObj.OptionId = parameter.OptionId;
                            newObj.CreatedById = parameter.UserId;
                            newObj.CreatedDate = DateTime.Now;

                            newObj.Price = item.Price;
                            newObj.SoLuongToiThieu = item.SoLuongToiThieu;
                            newObj.YeuCauThanhToan = item.YeuCauThanhToan;
                            newObj.GiaTriThanhToan = item.GiaTriThanhToan;
                            newObj.ThoiGianTu = item.ThoiGianTu;
                            newObj.ThoiGianDen = item.ThoiGianDen;
                            listVendorMappingOption.Add(newObj);

                            var newObjEntity = new VendorMappingOptionEntityModel();
                            newObjEntity.ThoiGianTu = item.ThoiGianTu;
                            newObjEntity.ThoiGianDen = item.ThoiGianDen;
                            newObjEntity.VendorId = item.VendorId;
                            newObjEntity.IsNew = true;
                            listAllVendorMappingOption.Add(newObjEntity);
                        }
                        else
                        {
                            isErr = true;
                        }
                    });

                    if (isErr)
                    {
                        return new ImportVendorMappingOptionsResult()
                        {
                            MessageCode = "Danh sách import có 1 số vấn đề sau, vui lòng kiểm tra!",
                            StatusCode = HttpStatusCode.OK,
                            ListImport = parameter.ListImport,
                        };
                    }

                    context.VendorMappingOption.AddRange(listVendorMappingOption);
                    context.SaveChanges();

                    transaction.Commit();
                    return new ImportVendorMappingOptionsResult()
                    {
                        MessageCode = "Cập nhật thành công!",
                        StatusCode = HttpStatusCode.OK,
                    };
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                    return new ImportVendorMappingOptionsResult()
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = e.Message,
                    };
                }
            }
        }
        public GetMasterBaoCaoTongHopResult GetMasterBaoCaoTongHop(GetMasterBaoCaoTongHopParameter parameter)
        {
            try
            {
                var listAllCateType = context.CategoryType.Where(x => x.CategoryTypeCode == "CUS_LEVEL" || x.CategoryTypeCode == "SERVICE").ToList();
                var listLoaiDoanhThu = GeneralList.GetTrangThais("LoaiDoanhThu").ToList();
                var listNhomDichVu = new List<CategoryEntityModel>();
                var listPhanHangKh = new List<CategoryEntityModel>();
                var listDichVu = new List<OptionsEntityModel>();
                var listGoiDichVu = new List<ServicePacketEntityModel>();
                var listCustomer = new List<CustomerEntityModel>();
                var listLoaiNhanVien = GeneralList.GetTrangThais("EmployeeType").ToList();
                var listChucVu = GeneralList.GetChucVuNhanVien().ToList();

                //Doanh thu tổng hợp
                if (parameter.TabIndex == 0)
                {
                    var nhomDichVuCateTypeId = listAllCateType.FirstOrDefault(x => x.CategoryTypeCode == "SERVICE")?.CategoryTypeId;

                    listNhomDichVu = context.Category.Where(x => x.CategoryTypeId == nhomDichVuCateTypeId).Select(x => new CategoryEntityModel
                    {
                        CategoryId = x.CategoryId,
                        CategoryName = x.CategoryName
                    }).ToList();

                    listDichVu = context.Options.Select(x => new OptionsEntityModel
                    {
                        Id = x.Id,
                        Name = x.Name,
                        CategoryId = x.CategoryId,
                    }).ToList();
                }
                //Doanh thu theo đơn dịch vụ
                else if (parameter.TabIndex == 1)
                {
                    var phanHangCateTypeId = listAllCateType.FirstOrDefault(x => x.CategoryTypeCode == "CUS_LEVEL")?.CategoryTypeId;

                    listPhanHangKh = context.Category.Where(x => x.CategoryTypeId == phanHangCateTypeId).Select(x => new CategoryEntityModel
                    {
                        CategoryId = x.CategoryId,
                        CategoryName = x.CategoryName
                    }).ToList();


                    listGoiDichVu = context.ServicePacket.Select(x => new ServicePacketEntityModel
                    {
                        Id = x.Id,
                        Name = x.Name
                    }).ToList();
                } 
                //Doanh thu theo Kh
                else if (parameter.TabIndex == 2)
                {
                    var phanHangCateTypeId = listAllCateType.FirstOrDefault(x => x.CategoryTypeCode == "CUS_LEVEL")?.CategoryTypeId;

                    listPhanHangKh = context.Category.Where(x => x.CategoryTypeId == phanHangCateTypeId).Select(x => new CategoryEntityModel
                    {
                        CategoryId = x.CategoryId,
                        CategoryName = x.CategoryName
                    }).ToList();


                    listGoiDichVu = context.ServicePacket.Select(x => new ServicePacketEntityModel
                    {
                        Id = x.Id,
                        Name = x.Name
                    }).ToList();

                    listCustomer = context.Customer.Where(x => x.Active == true).Select(x => new CustomerEntityModel
                    {
                        CustomerId = x.CustomerId,
                        CustomerName = x.CustomerName,
                    }).ToList();
                }

                return new GetMasterBaoCaoTongHopResult()
                {
                    ListLoaiDoanhThu = listLoaiDoanhThu,
                    ListNhomDichVu = listNhomDichVu,
                    ListPhanHangKh = listPhanHangKh,
                    ListDichVu = listDichVu,
                    ListGoiDichVu = listGoiDichVu,
                    ListCustomer = listCustomer,
                    ListLoaiNhanVien = listLoaiNhanVien,
                    ListChucVu = listChucVu,
                    MessageCode = "Lấy dữ liệu thành công!",
                    StatusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception e)
            {
                return new GetMasterBaoCaoTongHopResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message,
                };
            }
        }

        //BaoCaoTongHop
        public GetBaoCaoTongHopResult GetBaoCaoTongHop(GetBaoCaoTongHopParameter parameter)
        {
            try
            {
                dynamic baoCao = 0;
                //Doanh thu tổng hợp
                if (parameter.TabIndex == 0)
                {
                    baoCao = ( from o in context.Options

                               join c in context.Category on o.CategoryId equals c.CategoryId
                               into cData
                               from c in cData.DefaultIfEmpty()

                               join map in context.ServicePacketMappingOptions on o.Id equals map.OptionId
                               into mapData
                               from map in mapData.DefaultIfEmpty()

                               join dt in context.CustomerOrderDetail on map.Id equals dt.OptionId
                               into dtData
                               from dt in dtData.DefaultIfEmpty()

                               join order in context.CustomerOrder.Where(x => (x.StatusOrder == 4 || x.StatusOrder == 5) && x.IsOrderAction == false && 
                                                                   (parameter.TuNgay == null || parameter.TuNgay.Value.Date <= x.CreatedDate.Date) &&
                                                                   (parameter.DenNgay == null || parameter.DenNgay.Value.Date >= x.CreatedDate.Date)) 
                               on dt.OrderId equals order.OrderId
                               into orderData
                               from order in orderData.DefaultIfEmpty()


                               //Thanh toán cho Ncc
                               join vendorOrderDt in context.VendorOrderDetail on dt.OrderDetailId equals vendorOrderDt.OrderDetailId
                               into vendorOrderDtData
                               from vendorOrderDt in vendorOrderDtData.DefaultIfEmpty()

                               join vendorOrder in context.VendorOrder.Where(x => (x.StatusId == 2 || x.StatusId == 3 || x.StatusId == 4) &&
                                                                   (parameter.TuNgay == null || parameter.TuNgay.Value.Date <= x.CreatedDate.Date) &&
                                                                   (parameter.DenNgay == null || parameter.DenNgay.Value.Date >= x.CreatedDate.Date)) 
                               on vendorOrderDt.VendorOrderId equals vendorOrder.VendorOrderId
                               into vendorOrderData
                               from vendorOrder in vendorOrderData.DefaultIfEmpty()


                               where
                               (parameter.ListNhomDichVuId == null || parameter.ListNhomDichVuId.Count() == 0 || parameter.ListNhomDichVuId.Contains(o.CategoryId)) &&
                               (parameter.ListDichVuId == null || parameter.ListDichVuId.Count() == 0 || parameter.ListDichVuId.Contains(o.Id)) &&
                               (parameter.ListLoaiDoanhThuId == null || parameter.ListLoaiDoanhThuId.Count() == 0 || (
                                   parameter.ListLoaiDoanhThuId.Count() == 2 || (parameter.ListLoaiDoanhThuId.Contains(1) && o.ThanhToanTruoc == true) || parameter.ListLoaiDoanhThuId.Contains(2) && o.ThanhToanTruoc == false)
                               )

                               select new
                               {
                                   OptionId = o.Id,
                                   Name = o.Name,
                                   NhomDv = c.CategoryName,
                                   CustomerOrderDetail = dt,
                                   ThanhToanTruoc = o.ThanhToanTruoc == true ? "Khách hàng trả trước" : "Ncc trả hoa hồng",
                                   Order = order,
                                   VendorOrder = vendorOrder,
                               })
                              .GroupBy(x => x.OptionId)
                              .Select(x => new
                              {
                                  OptionId = x.Key,
                                  Name = x.FirstOrDefault().Name,
                                  NhomDv = x.FirstOrDefault().NhomDv,
                                  SoLuongDat = x.Where(u => u.CustomerOrderDetail != null).Select(u => u.CustomerOrderDetail).Sum(u => u.Quantity),
                                  ThanhToanTruoc = x.FirstOrDefault().ThanhToanTruoc,
                                  DoanhThuTuKH = x.Where(u => u.Order != null).Select(u => u.Order).GroupBy(u => u.OrderId).Select(u => u.FirstOrDefault().Amount).Sum(),
                                  ThanhToanChoNcc = x.Where(u => u.VendorOrder != null).Select(u => u.VendorOrder).GroupBy(u => u.VendorOrderId).Select(u => u.FirstOrDefault().TongTienDonHang).Sum(),
                                  HoaHongNhanVe = x.Where(u => u.VendorOrder != null).Select(u => u.VendorOrder).GroupBy(u => u.VendorOrderId).Select(u => u.FirstOrDefault().TongTienHoaHong).Sum(),
                                  TongDoanhThu = x.Where(u => u.Order != null).Select(u => u.Order).GroupBy(u => u.OrderId).Select(u => u.FirstOrDefault().Amount).Sum() -
                                                 x.Where(u => u.VendorOrder != null).Select(u => u.VendorOrder).GroupBy(u => u.VendorOrderId).Select(u => u.FirstOrDefault().TongTienDonHang).Sum() +
                                                 x.Where(u => u.VendorOrder != null).Select(u => u.VendorOrder).GroupBy(u => u.VendorOrderId).Select(u => u.FirstOrDefault().TongTienHoaHong).Sum()
                              })
                              .Where(x => (parameter.DoanhThuTu == null || parameter.DoanhThuTu <= x.TongDoanhThu) &&
                                          (parameter.DoanhThuDen == null || parameter.DoanhThuDen >= x.TongDoanhThu))
                              .ToList();

                }
                //Doanh thu theo đơn dịch vụ
                else if (parameter.TabIndex == 1)
                {
                   
                }
                //Doanh thu theo Kh
                else if (parameter.TabIndex == 2)
                {
                   
                }
                //Doanh thu theo nhân viên
                else if (parameter.TabIndex == 3)
                {
                   
                }

                return new GetBaoCaoTongHopResult()
                {
                    BaoCaoDoanhThu = baoCao,
                    MessageCode = "Lấy dữ liệu thành công!",
                    StatusCode = HttpStatusCode.OK,
                };
            }
            catch (Exception e)
            {
                return new GetBaoCaoTongHopResult()
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message,
                };
            }
        }

    }
}
