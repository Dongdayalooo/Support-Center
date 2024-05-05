using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using TN.TNM.Common;
using TN.TNM.DataAccess.Consts.Product;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Admin.Company;
using TN.TNM.DataAccess.Messages.Parameters.CompanyConfig;
using TN.TNM.DataAccess.Messages.Results.Admin.Category;
using TN.TNM.DataAccess.Messages.Results.Admin.Company;
using TN.TNM.DataAccess.Messages.Results.CompanyConfig;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.BankAccount;
using TN.TNM.DataAccess.Models.Company;
using TN.TNM.DataAccess.Models.Employee;
using TN.TNM.DataAccess.Models.Options;
using TN.TNM.DataAccess.Models.SystemParameter;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class CompanyDAO : BaseDAO, ICompanyDataAccess
    {
        private readonly IMapper _mapper;


        public CompanyDAO(Databases.TNTN8Context _content, IAuditTraceDataAccess _iAuditTrace, IMapper mapper)
        {
            this.context = _content;
            this.iAuditTrace = _iAuditTrace;
            _mapper = mapper;
        }

        public GetAllCompanyResult GetAllCompany(GetAllCompanyParameter parameter)
        {
            try
            {
                this.iAuditTrace.Trace(ActionName.GETALL, ObjectName.COMPANY, "GetAllCompany", parameter.UserId);
                var company = context.Company.ToList();
                var listCompanyEntityModel = new List<CompanyEntityModel>();
                company.ForEach(item =>
                {
                    listCompanyEntityModel.Add(new CompanyEntityModel(item));
                });
                return new GetAllCompanyResult
                {
                    Company = listCompanyEntityModel
                };
            }
            catch (Exception e)
            {
                return new GetAllCompanyResult
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }

        public GetCompanyConfigResults GetCompanyConfig(GetCompanyConfigParameter parameter)
        {
            try
            {
                var companyConfig = context.CompanyConfiguration.FirstOrDefault();
                var listBankAccount = context.BankAccount.Where(item => item.ObjectType == "COM").Select(c => new BankAccountEntityModel
                {
                    BankAccountId = c.BankAccountId,
                    ObjectId = c.ObjectId,
                    ObjectType = c.ObjectType,
                    AccountNumber = c.AccountNumber,
                    BankName = c.BankName,
                    BankDetail = c.BankDetail,
                    BranchName = c.BranchName,
                    AccountName = c.AccountName,
                    Active = c.Active,
                    CreatedDate = c.CreatedDate
                }).OrderBy(z => z.CreatedDate).ToList();

                return new GetCompanyConfigResults
                {
                    CompanyConfig = new CompanyConfigEntityModel(companyConfig),
                    ListBankAccount = listBankAccount,
                    MessageCode = "Success",
                    StatusCode = HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new GetCompanyConfigResults
                {
                    MessageCode = e.Message,
                    StatusCode = HttpStatusCode.ExpectationFailed
                };
            }
        }
        public EditCompanyConfigResults EditCompanyConfig(EditCompanyConfigParameter parameter)
        {
            try
            {
                this.iAuditTrace.Trace(ActionName.UPDATE, ObjectName.COMPANY, "Edit Company Config", parameter.UserId);
                var CompanyConfiguration = context.CompanyConfiguration.FirstOrDefault(c => c.CompanyId == parameter.CompanyConfigurationObject.CompanyId);
                if(CompanyConfiguration == null)
                {
                    return new EditCompanyConfigResults
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Company Config không tồn tại trong hệ thống"
                    };
                }
                CompanyConfiguration.CompanyName = parameter.CompanyConfigurationObject.CompanyName?.Trim();
                CompanyConfiguration.TaxCode = parameter.CompanyConfigurationObject.TaxCode?.Trim();
                CompanyConfiguration.Email = parameter.CompanyConfigurationObject.Email?.Trim();
                CompanyConfiguration.ContactName = parameter.CompanyConfigurationObject.ContactName?.Trim();
                CompanyConfiguration.ContactRole = parameter.CompanyConfigurationObject.ContactRole?.Trim();
                CompanyConfiguration.CompanyAddress = parameter.CompanyConfigurationObject.CompanyAddress?.Trim();
                CompanyConfiguration.Website = parameter.CompanyConfigurationObject.Website?.Trim();
                CompanyConfiguration.Phone = parameter.CompanyConfigurationObject.Phone?.Trim();
                context.CompanyConfiguration.Update(CompanyConfiguration);
                context.SaveChanges();
                return new EditCompanyConfigResults
                {
                    StatusCode = HttpStatusCode.OK,
                    CompanyID = parameter.CompanyConfigurationObject.CompanyId
                };
            }
            catch (Exception e)
            {
                return new EditCompanyConfigResults
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = e.Message
                };
            }
        }

        public GetAllSystemParameterResult GetAllSystemParameter(GetAllSystemParameterParameter parameter)
        {
            try
            {
                this.iAuditTrace.Trace(ActionName.UPDATE, "System Parameter", "Get all system parameter", parameter.UserId);
                var systemParameterList = context.SystemParameter.Select(item => new SystemParameterEntityModel(item)).OrderBy(w => w.SystemGroupCode).ToList();

                //Lấy danh sách nhân viên 
                var listNhanVien = context.Employee.Where(x => x.Active == true)
                                    .Select(x => new EmployeeEntityModel
                                    {
                                        EmployeeId = x.EmployeeId,
                                        EmployeeCodeName = x.EmployeeCode + "-" + x.EmployeeName,
                                        NhanThongBaoKhanCap = x.NhanThongBaoKhanCap
                                    }).ToList();

                var listSelectedEmp = listNhanVien.Where(x => x.NhanThongBaoKhanCap == true).ToList();
            
                return new GetAllSystemParameterResult
                {
                    ListNhanVien = listNhanVien,
                    ListSelectedEmp = listSelectedEmp,
                    systemParameterList = systemParameterList,
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công"
                };
            }
            catch (Exception)
            {
                return new GetAllSystemParameterResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }

        public ChangeSystemParameterResult ChangeSystemParameter(ChangeSystemParameterParameter parameter)
        {
            try
            {
                var systemParameter = context.SystemParameter.FirstOrDefault(e => e.SystemKey == parameter.SystemKey);
                if (systemParameter == null)
                {
                    return new ChangeSystemParameterResult
                    {
                        StatusCode = HttpStatusCode.ExpectationFailed,
                        MessageCode = "Không tồn tại tham số này trên hệ thống"
                    };
                }
                systemParameter.SystemValue = parameter.SystemValue;
                if (parameter.SystemValueString != null)
                    systemParameter.SystemValueString = parameter.SystemValueString.Trim();
                if (parameter.Description != null) systemParameter.Description = parameter.Description.Trim();


                if(parameter.SystemKey == "ThongBaoKhanCap")
                {
                    var listAllEmp = context.Employee.ToList();
                    listAllEmp.ForEach(item =>
                    {
                        item.NhanThongBaoKhanCap = false;
                        if (parameter.ListSelectedEmp.Contains(item.EmployeeId))
                        {
                            item.NhanThongBaoKhanCap = true;
                        }
                    });
                    context.Employee.UpdateRange(listAllEmp);
                }

                context.SystemParameter.Update(systemParameter);
                context.SaveChanges();

                List<SystemParameterEntityModel> systemParameterListEntityModel = new List<SystemParameterEntityModel>();
                var systemParameterList = context.SystemParameter.ToList();
                systemParameterList.ForEach(item =>
                {
                    systemParameterListEntityModel.Add(new SystemParameterEntityModel(item));
                });
                return new ChangeSystemParameterResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công",
                    SystemParameterList = systemParameterListEntityModel
                };
            }
            catch (Exception)
            {
                return new ChangeSystemParameterResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }
        public CreateUpdateCauHinhMucThuongResult CreateUpdateCauHinhMucThuong(CreateUpdateCauHinhMucThuongParameter parameter)
        {
            try
            {
              
                return new CreateUpdateCauHinhMucThuongResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công!"
                };

            }
            catch (Exception e)
            {
                return new CreateUpdateCauHinhMucThuongResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }
        public DeleteCauHinhMucThuongResult DeleteCauHinhMucThuong(DeleteCauHinhMucThuongParameter parameter)
        {
            try
            {
                return new DeleteCauHinhMucThuongResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa thành công!"
                };

            }
            catch (Exception)
            {
                return new DeleteCauHinhMucThuongResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }

        public GetDataCauHinhMucThuongTabResult GetDataCauHinhMucThuongTab(GetDataCauHinhMucThuongTabParameter parameter)
        {
            try
            {
                var listLoaiDoiTuong = GeneralList.GetTrangThais("EmployeeType");
                var listKieuThuong = GeneralList.GetKieuThanhToanTruoc();
                var listTieuChiApDungKhuyenKhich = GeneralList.GetTrangThais("TieuChiApDungKhuyenKhich");
                var listTieuChiApDungPhanHangKH = GeneralList.GetTrangThais("TieuChiApDungPhanHangKH");
                var listDieuKienPhanHangKh = GeneralList.GetTrangThais("DieuKienPhanHangKh");
                var listDieuKienChietKhau = GeneralList.GetTrangThais("DieuKienChietKhau");


                    

                var listPhanLoaiKh = new List<CategoryEntityModel>();
                var listOption = new List<OptionsEntityModel>();
                var listCauHinhMucThuong = new List<CauHinhHeSoKhuyenKhichModel>();
                var listCauHinhHeSoKhuyenKhich = new List<CauHinhHeSoKhuyenKhichModel>();
                var listCauHinhPhanHangKh = new List<CauHinhPhanHangKhModel>();
                var listCauHinhChietKhau = new List<CauHinhMucChietKhauModel>();
                var listPosition = GeneralList.GetChucVuNhanVien();

                //Nếu là tab cấu hình thưởng
                if (parameter.TabIndex == 2)
                {
                    listCauHinhHeSoKhuyenKhich = (from ch in context.CauHinhHeSoKhuyenKhich
                                                  join kt in listKieuThuong on ch.LoaiThuongId equals kt.Value
                                                  into ktData
                                                  from ktInfor in ktData.DefaultIfEmpty()

                                                  join dk in listTieuChiApDungKhuyenKhich on ch.DieuKienId equals dk.Value
                                                  into dkData
                                                  from dkInfor in dkData.DefaultIfEmpty()
                                                  where ch.Type == 1 // CH mức thưởng
                                                  select new CauHinhHeSoKhuyenKhichModel
                                                  {
                                                      Id = ch.Id,
                                                      ParentId = ch.ParentId,

                                                      ChucVuId = ch.ChucVuId,
                                                      ChucVu = ch.ChucVuId != null ? listPosition.FirstOrDefault(x => x.Value == ch.ChucVuId).Name : "",

                                                      LoaiThuongId = ch.LoaiThuongId,
                                                      LoaiThuong = ktInfor.Name,

                                                      GiaTriThuong = ch.GiaTriThuong,

                                                      TuNgay = ch.TuNgay,
                                                      DenNgay = ch.DenNgay,

                                                      DieuKienId = ch.DieuKienId,
                                                      DieuKien = dkInfor.Name,

                                                      GiaTriTu = ch.GiaTriTu,
                                                      GiaTriDen = ch.GiaTriDen,

                                                      Type = ch.Type,
                                                      DoiTuongApDungId = ch.DoiTuongApDungId,
                                                      DoiTuongApDung = ch.DoiTuongApDungId != null ? listLoaiDoiTuong.FirstOrDefault(x => x.Value == ch.DoiTuongApDungId).Name : ""
                                                  }).OrderBy(x => x.ChucVuId).ThenBy(x => x.DieuKienId).ToList();
                }
                //Nếu là tab cấu hình khuyến khích
                else if (parameter.TabIndex == 3)
                {
                    listCauHinhHeSoKhuyenKhich = (from ch in context.CauHinhHeSoKhuyenKhich
                                                  join kt in listKieuThuong on ch.LoaiThuongId equals kt.Value
                                                  into ktData
                                                  from ktInfor in ktData.DefaultIfEmpty()
                                             
                                                  join dk in listTieuChiApDungKhuyenKhich on ch.DieuKienId equals dk.Value
                                                  into dkData
                                                  from dkInfor in dkData.DefaultIfEmpty()
                                                  where ch.Type == 2 // CH khuyến khích

                                                  select new CauHinhHeSoKhuyenKhichModel
                                                  {
                                                      Id = ch.Id,
                                                      ParentId = ch.ParentId,

                                                      ChucVuId = ch.ChucVuId,
                                                      ChucVu = ch.ChucVuId != null ? listPosition.FirstOrDefault(x => x.Value == ch.ChucVuId).Name : "",

                                                      LoaiThuongId = ch.LoaiThuongId,
                                                      LoaiThuong = ktInfor.Name,

                                                      GiaTriThuong = ch.GiaTriThuong,

                                                      TuNgay = ch.TuNgay,
                                                      DenNgay = ch.DenNgay,

                                                      DieuKienId = ch.DieuKienId,
                                                      DieuKien = dkInfor.Name,

                                                      GiaTriTu = ch.GiaTriTu,
                                                      GiaTriDen = ch.GiaTriDen,

                                                      Type = ch.Type,
                                                      DoiTuongApDungId = ch.DoiTuongApDungId,
                                                      DoiTuongApDung = ch.DoiTuongApDungId != null ? listLoaiDoiTuong.FirstOrDefault(x => x.Value == ch.DoiTuongApDungId).Name : ""
                                                  }).OrderBy(x => x.ChucVuId).ThenBy(x => x.DieuKienId).ToList();
                }
                //Nếu là tab cấu hình phân hạng KH
                else if (parameter.TabIndex == 4)
                {
                    listPhanLoaiKh = AccessHelper.GetListCategoryByCategoryTypeCode(context, ProductConsts.CUS_LEVEL);

                    listCauHinhPhanHangKh = (from ch in context.CauHinhPhanHangKh
                                             join c in listPhanLoaiKh on ch.PhanHangId equals c.CategoryId
                                             into cTable
                                             from cInfor in cTable.DefaultIfEmpty()

                                             join ph in listDieuKienPhanHangKh on ch.DieuKienId equals ph.Value
                                             into phTable
                                             from phInfor in phTable.DefaultIfEmpty()
                                             
                                             select new CauHinhPhanHangKhModel
                                             {
                                                 Id = ch.Id,
                                                 GiaTriTu = ch.GiaTriTu,
                                                 GiaTriDen = ch.GiaTriDen,
                                                 DieuKienId = ch.DieuKienId,
                                                 DieuKien = phInfor.Name,
                                                 PhanHang = cInfor.CategoryName,
                                                 PhanHangId = ch.PhanHangId,
                                                 ParentId = ch.ParentId,
                                             }).OrderBy(x => x.GiaTriTu).ToList();
                }
                //Nếu là tab cấu hình mức chiết khấu
                else if (parameter.TabIndex == 5)
                {
                    listPhanLoaiKh = AccessHelper.GetListCategoryByCategoryTypeCode(context, ProductConsts.CUS_LEVEL);

                    listCauHinhChietKhau = (from ch in context.CauHinhMucChietKhau
                                             join c in listPhanLoaiKh on ch.PhanHangId equals c.CategoryId
                                             into cTable
                                             from cInfor in cTable.DefaultIfEmpty()

                                             join ph in listDieuKienChietKhau on ch.DieuKienId equals ph.Value
                                             into phTable
                                             from phInfor in phTable.DefaultIfEmpty()

                                            join kt in listKieuThuong on ch.LoaiChietKhauId equals kt.Value
                                            into ktTable
                                            from ktInfor in ktTable.DefaultIfEmpty()

                                            select new CauHinhMucChietKhauModel
                                             {
                                                 Id = ch.Id,
                                                 LoaiChietKhauId = ch.LoaiChietKhauId,
                                                 LoaiChietKhau = ktInfor.Name,
                                                 GiaTriTu = ch.GiaTriTu,
                                                 GiaTriDen = ch.GiaTriDen,
                                                 DieuKienId = ch.DieuKienId,
                                                 DieuKien = phInfor.Name,
                                                 PhanHang = cInfor.CategoryName,
                                                 PhanHangId = ch.PhanHangId,
                                                 ThoiGianTu = ch.ThoiGianTu,
                                                 ThoiGianDen = ch.ThoiGianDen,
                                                 GiaTri = ch.GiaTri,
                                                 ParentId = ch.ParentId,
                                             }).OrderBy(x => x.GiaTriTu).ToList();
                }
                //Nếu là tab cấu hình mức chiết khấu

                return new GetDataCauHinhMucThuongTabResult
                {
                    ListPosition = listPosition,
                    ListCauHinhHeSoKhuyenKhich = listCauHinhHeSoKhuyenKhich,
                    ListTieuChiApDungKhuyenKhich = listTieuChiApDungKhuyenKhich,
                    ListTieuChiApDungPhanHangKH = listTieuChiApDungPhanHangKH,
                    ListPhanLoaiKh = listPhanLoaiKh,
                    ListCauHinhPhanHangKh = listCauHinhPhanHangKh,
                    ListOption = listOption,
                    ListCauHinhMucThuong = listCauHinhMucThuong,
                    ListLoaiDoiTuong = listLoaiDoiTuong,
                    ListKieuThuong = listKieuThuong,

                    ListDieuKienPhanHangKh = listDieuKienPhanHangKh,

                    ListCauHinhChietKhau = listCauHinhChietKhau,
                    ListDieuKienChietKhau = listDieuKienChietKhau,
                    
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lấy dữ liệu thành công!"
                };

            }
            catch (Exception e)
            {
                return new GetDataCauHinhMucThuongTabResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }

        public CreateUpdateHeSoKhuyenKhichResult CreateUpdateHeSoKhuyenKhich(CreateUpdateHeSoKhuyenKhichParameter parameter)
        {
            try
            {
                var listAllCauHinh = context.CauHinhHeSoKhuyenKhich.ToList();

                var cauHinh = _mapper.Map<CauHinhHeSoKhuyenKhich>(parameter.CauHinh);

                var messErr = "";

                //Nếu là lv1 => check  chức vụ cho không lặp
                if (cauHinh.ParentId == null || cauHinh.ParentId == Guid.Empty)
                {
                    //var checkGiaTriTuDen = listAllCauHinh.FirstOrDefault(x =>
                    //        (cauHinh.Id == null || cauHinh.Id == Guid.Empty || cauHinh.Id != x.Id) &&
                    //        (x.ChucVuId == cauHinh.ChucVuId));

                    //if (checkGiaTriTuDen != null) messErr = "Cấu hình cho chức vụ này đã tồn tại, vui lòng kiểm tra lại!";
                }
                //Nếu là lv2 => kiểm tra xem điều kiện đã tồn tại hay chưa
                else
                {
                    var checkKieuThuong = listAllCauHinh.FirstOrDefault(x => x.ParentId == cauHinh.ParentId &&
                                                        (cauHinh.Id == null || cauHinh.Id == Guid.Empty || cauHinh.Id != x.Id) &&
                                                        (x.DieuKienId == cauHinh.DieuKienId));

                    if (checkKieuThuong != null) messErr = "Điều kiện đã tồn tại, vui lòng kiểm tra lại";
                }


                if (messErr != "")
                {
                    return new CreateUpdateHeSoKhuyenKhichResult
                    {
                        StatusCode = HttpStatusCode.FailedDependency,
                        MessageCode = messErr
                    };
                }

                //Nếu là tạo mới
                if (cauHinh.Id == null || cauHinh.Id == Guid.Empty)
                {
                    cauHinh.Id = Guid.NewGuid();
                    cauHinh.CreatedById = parameter.UserId;
                    cauHinh.CreatedDate = DateTime.Now;
                    context.CauHinhHeSoKhuyenKhich.Add(cauHinh);
                }
                //Nếu là cập nhật
                else
                {
                    var exist = context.CauHinhHeSoKhuyenKhich.FirstOrDefault(x => x.Id == parameter.CauHinh.Id);
                    if (exist == null)
                    {
                        return new CreateUpdateHeSoKhuyenKhichResult
                        {
                            StatusCode = HttpStatusCode.FailedDependency,
                            MessageCode = "Bản ghi không tồn tại trên hệ thống!"
                        };

                    }
                    exist.DoiTuongApDungId = cauHinh.DoiTuongApDungId;
                    exist.Type = cauHinh.Type;
                    exist.ChucVuId = cauHinh.ChucVuId;
                    exist.LoaiThuongId = cauHinh.LoaiThuongId;

                    exist.GiaTriThuong = cauHinh.GiaTriThuong;

                    exist.TuNgay = cauHinh.TuNgay;
                    exist.DenNgay = cauHinh.DenNgay;
                    exist.DieuKienId = cauHinh.DieuKienId;

                    exist.GiaTriTu = cauHinh.GiaTriTu;
                    exist.GiaTriDen = cauHinh.GiaTriDen;

                    exist.ParentId = cauHinh.ParentId;
                    exist.UpdatedById = parameter.UserId;
                    exist.UpdatedDate = DateTime.Now;
                    context.CauHinhHeSoKhuyenKhich.Update(exist);
                }

                context.SaveChanges();
                return new CreateUpdateHeSoKhuyenKhichResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công!"
                };
            }
            catch (Exception e)
            {
                return new CreateUpdateHeSoKhuyenKhichResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }
        public DeleteCauHinhHeSoKhuyenKhichResult DeleteCauHinhHeSoKhuyenKhich(DeleteCauHinhHeSoKhuyenKhichParameter parameter)
        {
            try
            {
                //Xóa hết cấu hình và các danh sách con của nó
                var listCauHinh = context.CauHinhHeSoKhuyenKhich.Where(x => x.Id == parameter.CauHinh.Id || x.ParentId == parameter.CauHinh.Id);
                context.CauHinhHeSoKhuyenKhich.RemoveRange(listCauHinh);
                context.SaveChanges();

                return new DeleteCauHinhHeSoKhuyenKhichResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Đã xóa cấu hình cũ!"
                };
            }
            catch (Exception)
            {
                return new DeleteCauHinhHeSoKhuyenKhichResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }

        //cauhinhphanhangkh
        public CreateUpdateCauHinhPhkhResult CreateUpdateCauHinhPhkh(CreateUpdateCauHinhPhkhParameter parameter)
        {
            try
            {
                // Chuyển đổi đối tượng từ tham số vào đối tượng CauHinhPhanHangKh bằng AutoMapper
                var cauHinh = _mapper.Map<CauHinhPhanHangKh>(parameter.CauHinh);
                var listAllCauHinh = context.CauHinhPhanHangKh.ToList();
                var messErr = "";

                //Nếu là lv1 => check phân hạng đến cho không lặp
                if (cauHinh.ParentId == null || cauHinh.ParentId == Guid.Empty)
                {
                    var checkGiaTriTuDen = listAllCauHinh.FirstOrDefault(x =>
                            (cauHinh.Id == null || cauHinh.Id == Guid.Empty || cauHinh.Id != x.Id) &&
                            (x.PhanHangId == cauHinh.PhanHangId));

                    if (checkGiaTriTuDen != null) messErr = "Cấu hình cho phân hạng này đã tồn tại, vui lòng kiểm tra lại!";

                }
                //Nếu là lv2 => kiểm tra xem điều kiện đã tồn tại hay chưa
                else
                {
                    var checkKieuThuong = listAllCauHinh.FirstOrDefault(x => x.ParentId == cauHinh.ParentId &&
                                                        (cauHinh.Id == null || cauHinh.Id == Guid.Empty || cauHinh.Id != x.Id) &&
                                                        (x.DieuKienId == cauHinh.DieuKienId));

                    if (checkKieuThuong != null) messErr = "Điều kiện đã tồn tại, vui lòng kiểm tra lại";
                }
             
                if (messErr != "")
                {
                    return new CreateUpdateCauHinhPhkhResult
                    {
                        StatusCode = HttpStatusCode.FailedDependency,
                        MessageCode = messErr
                    };
                }

                //Nếu là tạo mới
                if (cauHinh.Id == null || cauHinh.Id == Guid.Empty)
                {
                    // Thiết lập Id mới cho cấu hình
                    cauHinh.Id = Guid.NewGuid();
                    cauHinh.CreatedById = parameter.UserId;
                    cauHinh.CreatedDate = DateTime.Now;
                    // Thêm cấu hình vào cơ sở dữ liệu
                    context.CauHinhPhanHangKh.Add(cauHinh);
                }
                //Nếu là cập nhật
                else
                {
                    // Kiểm tra xem bản ghi tồn tại trong danh sách không
                    var exist = listAllCauHinh.FirstOrDefault(x => x.Id == parameter.CauHinh.Id);
                    if (exist == null)
                    {
                        return new CreateUpdateCauHinhPhkhResult
                        {
                            StatusCode = HttpStatusCode.FailedDependency,
                            MessageCode = "Bản ghi không tồn tại trên hệ thống!"
                        };
                    }
                    // Cập nhật thông tin của cấu hình 
                    exist.GiaTriTu = cauHinh.GiaTriTu;
                    exist.GiaTriDen = cauHinh.GiaTriDen;
                    exist.DieuKienId = cauHinh.DieuKienId;
                    exist.PhanHangId = cauHinh.PhanHangId;
                    exist.ParentId = cauHinh.ParentId;
                    exist.UpdatedById = parameter.UserId;
                    exist.UpdatedDate = DateTime.Now;
                    // Cập nhật bản ghi trong cơ sở dữ liệu
                    context.CauHinhPhanHangKh.Update(exist);
                }
                // Lưu thay đổi vào cơ sở dữ liệu
                context.SaveChanges();
                return new CreateUpdateCauHinhPhkhResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công!"
                };
            }
            // Bắt các ngoại lệ có thể xảy ra trong quá trình thực thi
            catch (Exception e)
            {
                return new CreateUpdateCauHinhPhkhResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }
        public DeleteCauHinhPhanHangKHResult DeleteCauHinhPhanHangKH(DeleteCauHinhPhanHangKHParameter parameter)
        {
            try
            {
                // Tìm cấu hình phân hạng theo Id từ cơ sở dữ liệu
                var cauHinh = context.CauHinhPhanHangKh.FirstOrDefault(x => x.Id == parameter.Id);
                // Kiểm tra xem cấu hình có tồn tại hay không
                if (cauHinh == null)
                {
                    return new DeleteCauHinhPhanHangKHResult
                    {
                        StatusCode = HttpStatusCode.FailedDependency,
                        MessageCode = "Bản ghi không tồn tại trên hệ thống!"
                    };
                }
                context.CauHinhPhanHangKh.Remove(cauHinh);
                context.SaveChanges();

                return new DeleteCauHinhPhanHangKHResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa thành công!"
                };
            }
            catch (Exception e)
            {
                return new DeleteCauHinhPhanHangKHResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }

        public CreateUpdateCauHinhChietKhauResult CreateUpdateCauHinhChietKhau(CreateUpdateCauHinhChietKhauParameter parameter)
        {
            try
            {
                var cauHinh = _mapper.Map<CauHinhMucChietKhau>(parameter.CauHinh);
                var listAllCauHinh = context.CauHinhMucChietKhau.ToList();
                var messErr = "";

                //Nếu là lv1 => check phân hạng đến cho không lặp
                if (cauHinh.ParentId == null || cauHinh.ParentId == Guid.Empty)
                {
                    //var checkGiaTriTuDen = listAllCauHinh.FirstOrDefault(x =>
                    //        (cauHinh.Id == null || cauHinh.Id == Guid.Empty || cauHinh.Id != x.Id) &&
                    //        (x.PhanHangId == cauHinh.PhanHangId));

                    //if (checkGiaTriTuDen != null) messErr = "Cấu hình cho phân hạng này đã tồn tại, vui lòng kiểm tra lại!";

                }
                //Nếu là lv2 => kiểm tra xem điều kiện đã tồn tại hay chưa
                else
                {
                    var checkKieuThuong = listAllCauHinh.FirstOrDefault(x => x.ParentId == cauHinh.ParentId &&
                                                        (cauHinh.Id == null || cauHinh.Id == Guid.Empty || cauHinh.Id != x.Id) &&
                                                        (x.DieuKienId == cauHinh.DieuKienId));

                    if (checkKieuThuong != null) messErr = "Điều kiện đã tồn tại, vui lòng kiểm tra lại";
                }

                if (messErr != "")
                {
                    return new CreateUpdateCauHinhChietKhauResult
                    {
                        StatusCode = HttpStatusCode.FailedDependency,
                        MessageCode = messErr
                    };
                }

                //Nếu là tạo mới
                if (cauHinh.Id == null || cauHinh.Id == Guid.Empty)
                {
                    cauHinh.Id = Guid.NewGuid();
                    cauHinh.CreatedById = parameter.UserId;
                    cauHinh.CreatedDate = DateTime.Now;
                    context.CauHinhMucChietKhau.Add(cauHinh);
                }
                //Nếu là cập nhật
                else
                {
                    var exist = listAllCauHinh.FirstOrDefault(x => x.Id == parameter.CauHinh.Id);
                    if (exist == null)
                    {
                        return new CreateUpdateCauHinhChietKhauResult
                        {
                            StatusCode = HttpStatusCode.FailedDependency,
                            MessageCode = "Bản ghi không tồn tại trên hệ thống!"
                        };
                    }
                    exist.GiaTriTu = cauHinh.GiaTriTu;
                    exist.GiaTriDen = cauHinh.GiaTriDen;
                    exist.DieuKienId = cauHinh.DieuKienId;
                    exist.PhanHangId = cauHinh.PhanHangId;
                    exist.GiaTri = cauHinh.GiaTri;
                    exist.LoaiChietKhauId = cauHinh.LoaiChietKhauId;
                    exist.ThoiGianTu = cauHinh.ThoiGianTu;
                    exist.ThoiGianDen = cauHinh.ThoiGianDen;

                    exist.ParentId = cauHinh.ParentId;
                    exist.UpdatedById = parameter.UserId;
                    exist.UpdatedDate = DateTime.Now;
                    context.CauHinhMucChietKhau.Update(exist);
                }

                context.SaveChanges();
                return new CreateUpdateCauHinhChietKhauResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Lưu thành công!"
                };
            }
            catch (Exception e)
            {
                return new CreateUpdateCauHinhChietKhauResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }

        public DeleteCauHinhChietKhauResult DeleteCauHinhChietKhau(DeleteCauHinhChietKhauParameter parameter)
        {
            try
            {
                var cauHinh = context.CauHinhMucChietKhau.FirstOrDefault(x => x.Id == parameter.Id);
                if (cauHinh == null)
                {
                    return new DeleteCauHinhChietKhauResult
                    {
                        StatusCode = HttpStatusCode.FailedDependency,
                        MessageCode = "Bản ghi không tồn tại trên hệ thống!"
                    };
                }
                context.CauHinhMucChietKhau.Remove(cauHinh);
                context.SaveChanges();

                return new DeleteCauHinhChietKhauResult
                {
                    StatusCode = HttpStatusCode.OK,
                    MessageCode = "Xóa thành công!"
                };
            }
            catch (Exception e)
            {
                return new DeleteCauHinhChietKhauResult
                {
                    StatusCode = HttpStatusCode.ExpectationFailed,
                    MessageCode = "Có lỗi xảy ra khi lưu"
                };
            }
        }


    }
}
