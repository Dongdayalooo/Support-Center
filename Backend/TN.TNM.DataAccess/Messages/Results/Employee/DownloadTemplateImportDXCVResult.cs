﻿using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Results.Employee
{
    public class DownloadTemplateImportDXTLResult:BaseResult
    {
        public byte[] TemplateExcel { get; set; }
        public string FileName { get; set; }
    }
}
