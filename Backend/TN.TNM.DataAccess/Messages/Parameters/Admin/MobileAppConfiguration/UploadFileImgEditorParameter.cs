using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.MobileAppConfiguration
{
    public class UploadFileImgEditorParameter: BaseParameter
    {
        public List<IFormFile> ListSrcAnhGT { get; set; }
        public List<IFormFile> ListSrcAnhLH { get; set; }
        public List<IFormFile> ListSrcAnhMT { get; set; }
    }
}
