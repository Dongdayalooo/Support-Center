using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Results.Admin
{
    public class UploadFileImgEditorResult: BaseResult
    {
        public List<string> GioiThieuSrc { get; set; }
        public List<string> LienHeSrc { get; set; }
        public List<string> FooterMoTaSrc { get; set; }
        public List<string> ListPath { get; set; }
    }
}
