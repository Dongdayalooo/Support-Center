using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TN.TNM.BusinessLogic.Interfaces.Receivable;
using TN.TNM.BusinessLogic.Messages.Requests.Receivable.Customer;
using TN.TNM.BusinessLogic.Messages.Requests.Receivable.Vendor;
using TN.TNM.BusinessLogic.Messages.Requests.SalesReport;
using TN.TNM.BusinessLogic.Messages.Responses.Receivable.Customer;
using TN.TNM.BusinessLogic.Messages.Responses.Receivable.Vendor;
using TN.TNM.BusinessLogic.Messages.Responses.SalesReport;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Receivable.Customer;
using TN.TNM.DataAccess.Messages.Parameters.Receivable.Vendor;
using TN.TNM.DataAccess.Messages.Results.Receivable.Customer;
using TN.TNM.DataAccess.Messages.Results.Receivable.Vendor;

namespace TN.TNM.Api.Controllers
{
    public class ReceivableController : Controller
    {
        private readonly IReceivable iReceivable;
        private readonly IReceivableDataAccess iReceivableDAO;
        public ReceivableController(IReceivable _iReceivable, IReceivableDataAccess _iReceivableDAO)
        {
            iReceivable = _iReceivable;
            iReceivableDAO = _iReceivableDAO;
        }

        /// <summary>
        /// GetReceivableVendorDetail
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/receivableVendor/searchReceivableVendorDetail")]
        [Authorize(Policy = "Member")]
        public GetReceivableVendorDetailResults GetReceivableVendorDetail([FromBody]GetReceivableVendorDetailParameter request)
        {
            return this.iReceivableDAO.GetReceivableVendorDetail(request);
        }

        /// <summary>
        /// GetReceivableVendorReport
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/receivableVendor/searchReceivableVendorReport")]
        [Authorize(Policy = "Member")]
        public GetReceivableVendorReportResults GetReceivableVendorReport([FromBody] GetReceivableVendorReportParameter request)
        {
            return this.iReceivableDAO.GetReceivableVendorReport(request);
        }
        /// <summary>
        /// GetReceivableCustomerReport
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/receivableCustomer/searchReceivableCustomerReport")]
        [Authorize(Policy = "Member")]
        public GetReceivableCustomerReportResponse GetReceivableCustomerReport([FromBody] GetReceivableCustomerReportRequest request)
        {
            return this.iReceivable.GetReceivableCustomerReport(request);
        }
        /// <summary>
        /// GetReceivableCustomerDetail
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/receivableCustomer/searchReceivableCustomerDetail")]
        [Authorize(Policy = "Member")]
        public GetReceivableCustomerDetailResponse GetReceivableCustomerDetail([FromBody]GetReceivableCustomerDetailRequest request)
        {
            return this.iReceivable.GetReceivableCustomerDetail(request);
        }

        /// <summary>
        /// ExportExcelReceivableReport
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/receivableCustomer/exportExcelReceivableReport")]
        [Authorize(Policy = "Member")]
        public ExportExcelReceivableReportResponse ExportExcelReceivableReport([FromBody]ExportExcelReceivableReportRequest request)
        {
            return this.iReceivable.ExportExcelReceivableReport(request);
        }

        /// <summary>
        /// ExportExcelReceivableReport
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/salesReport/searchSalesReport")]
        [Authorize(Policy = "Member")]
        public SalesReportResponse SearchSalesReport([FromBody]SalesReportRequest request)
        {
            return this.iReceivable.SearchSalesReport(request);
        }

        /// <summary>
        /// GetData
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/receivableVendor/getDataSearchReceivableVendor")]
        [Authorize(Policy = "Member")]
        public GetDataSearchReceivableVendorResponse GetDataSearchReceivableVendor([FromBody]GetDataSearchReceivableVendorRequest request)
        {
            return this.iReceivable.GetDataSearchReceivableVendor(request);
        }

        [HttpPost]
        [Route("api/receivableCustomer/getMasterDataReport")]
        [Authorize(Policy = "Member")]
        public GetMasterDataReportResult GetMasterDataReport([FromBody] GetMasterDataReportParameter parameter)
        {
            return iReceivableDAO.GetMasterDataReport(parameter);
        }
        [HttpPost]
        [Route("api/receivableCustomer/searchReceivableCustomerReportNew")]
        [Authorize(Policy = "Member")]
        public GetReceivableCustomerReportNewResults GetReceivableCustomerReportNew([FromBody] GetReceivableCustomerReportNewParameter parameter)
        {
            return iReceivableDAO.GetReceivableCustomerReportNew(parameter);
        }
    }
}
