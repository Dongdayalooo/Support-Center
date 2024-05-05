using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Admin.Product
{
    public class UploadProductImageParameter: BaseParameter
    {
        public IFormFile FileIcon { get; set; }

        public IFormFile FileMainImg { get; set; }

        public IFormFile FileBackground { get; set; }
    }
}
