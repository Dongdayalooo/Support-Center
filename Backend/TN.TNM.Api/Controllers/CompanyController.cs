using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TN.TNM.BusinessLogic.Interfaces.Admin.Company;
using TN.TNM.BusinessLogic.Messages.Requests.Admin.Company;
using TN.TNM.BusinessLogic.Messages.Requests.CompanyConfig;
using TN.TNM.BusinessLogic.Messages.Responses.Admin.Company;
using TN.TNM.BusinessLogic.Messages.Responses.CompanyConfig;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Admin.Company;
using TN.TNM.DataAccess.Messages.Parameters.CompanyConfig;
using TN.TNM.DataAccess.Messages.Results.Admin.Category;
using TN.TNM.DataAccess.Messages.Results.Admin.Company;
using TN.TNM.DataAccess.Messages.Results.CompanyConfig;

namespace TN.TNM.Api.Controllers
{
    public class CompanyController : Controller
    {
        private readonly ICompany iCompany;
        private readonly ICompanyDataAccess iCompanyDataDataAccess;
        public CompanyController(ICompany _iCompany, ICompanyDataAccess _iCompanyDataAccess)
        {
            this.iCompany = _iCompany;
            this.iCompanyDataDataAccess = _iCompanyDataAccess;
        }

        /// <summary>
        /// Get all company info
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/company/getAllCompany")]
        [Authorize(Policy = "Member")]
        public GetAllCompanyResult GetAllCompany(GetAllCompanyParameter request)
        {
            return this.iCompanyDataDataAccess.GetAllCompany(request);
        }
        /// <summary>
        /// Get all company info
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/company/getCompanyConfig")]
        [Authorize(Policy = "Member")]
        public GetCompanyConfigResults GetCompanyConfig(GetCompanyConfigParameter request)
        {
            return this.iCompanyDataDataAccess.GetCompanyConfig(request);
        }
        /// <summary>
        /// Edit Company Config
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/company/editCompanyConfig")]
        [Authorize(Policy = "Member")]
        public EditCompanyConfigResults EditCompanyConfig([FromBody]EditCompanyConfigParameter request)
        {
            return this.iCompanyDataDataAccess.EditCompanyConfig(request);
        }
        /// <summary>
        /// Get All System Parameter
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/company/getAllSystemParameter")]
        [Authorize(Policy = "Member")]
        public GetAllSystemParameterResult GetAllSystemParameter([FromBody]GetAllSystemParameterParameter request)
        {
            return this.iCompanyDataDataAccess.GetAllSystemParameter(request);
        }
        /// <summary>
        /// Change System Parameter
        /// </summary>
        /// <param name="request">Contain parameter</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/company/changeSystemParameter")]
        [Authorize(Policy = "Member")]
        public ChangeSystemParameterResult ChangeSystemParameter([FromBody]ChangeSystemParameterParameter request)
        {
            return this.iCompanyDataDataAccess.ChangeSystemParameter(request);
        }

        [HttpPost]
        [Route("api/company/createUpdateCauHinhMucThuong")]
        [Authorize(Policy = "Member")]
        public CreateUpdateCauHinhMucThuongResult CreateUpdateCauHinhMucThuong([FromBody] CreateUpdateCauHinhMucThuongParameter request)
        {
            return this.iCompanyDataDataAccess.CreateUpdateCauHinhMucThuong(request);
        }

        [HttpPost]
        [Route("api/company/deleteCauHinhMucThuong")]
        [Authorize(Policy = "Member")]
        public DeleteCauHinhMucThuongResult DeleteCauHinhMucThuong([FromBody] DeleteCauHinhMucThuongParameter request)
        {
            return this.iCompanyDataDataAccess.DeleteCauHinhMucThuong(request);
        }

        [HttpPost]
        [Route("api/company/getDataCauHinhMucThuongTab")]
        [Authorize(Policy = "Member")]
        public GetDataCauHinhMucThuongTabResult GetDataCauHinhMucThuongTab([FromBody] GetDataCauHinhMucThuongTabParameter request)
        {
            return this.iCompanyDataDataAccess.GetDataCauHinhMucThuongTab(request);
        }

        [HttpPost]
        [Route("api/company/createUpdateHeSoKhuyenKhich")]
        [Authorize(Policy = "Member")]
        public CreateUpdateHeSoKhuyenKhichResult CreateUpdateHeSoKhuyenKhich([FromBody] CreateUpdateHeSoKhuyenKhichParameter request)
        {
            return this.iCompanyDataDataAccess.CreateUpdateHeSoKhuyenKhich(request);
        }

        [HttpPost]
        [Route("api/company/deleteCauHinhHeSoKhuyenKhich")]
        [Authorize(Policy = "Member")]
        public DeleteCauHinhHeSoKhuyenKhichResult DeleteCauHinhHeSoKhuyenKhich([FromBody] DeleteCauHinhHeSoKhuyenKhichParameter request)
        {
            return this.iCompanyDataDataAccess.DeleteCauHinhHeSoKhuyenKhich(request);
        }


        [HttpPost]
        [Route("api/company/createUpdateCauHinhChietKhau")]
        [Authorize(Policy = "Member")]
        public CreateUpdateCauHinhChietKhauResult CreateUpdateCauHinhChietKhau([FromBody] CreateUpdateCauHinhChietKhauParameter request)
        {
            return this.iCompanyDataDataAccess.CreateUpdateCauHinhChietKhau(request);
        }


        [HttpPost]
        [Route("api/company/deleteCauHinhChietKhau")]
        [Authorize(Policy = "Member")]
        public DeleteCauHinhChietKhauResult DeleteCauHinhChietKhau([FromBody] DeleteCauHinhChietKhauParameter request)
        {
            return this.iCompanyDataDataAccess.DeleteCauHinhChietKhau(request);
        }

        // cauhinhphanhangkh
        [HttpPost]
        [Route("api/company/createUpdateCauHinhPhkh")]
        [Authorize(Policy = "Member")]
        public CreateUpdateCauHinhPhkhResult CreateUpdateCauHinhPhkh([FromBody] CreateUpdateCauHinhPhkhParameter request)
        {
            return this.iCompanyDataDataAccess.CreateUpdateCauHinhPhkh(request);
        }

        [HttpPost]
        [Route("api/company/deleteCauHinhPhanHangKH")]
        [Authorize(Policy = "Member")]
        public DeleteCauHinhPhanHangKHResult DeleteCauHinhPhanHangKH([FromBody] DeleteCauHinhPhanHangKHParameter request)
        {
            return this.iCompanyDataDataAccess.DeleteCauHinhPhanHangKH(request);
        }

    }
}