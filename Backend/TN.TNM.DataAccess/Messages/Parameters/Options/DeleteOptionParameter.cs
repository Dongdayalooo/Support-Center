using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Options
{
    public class DeleteOptionParameter : BaseParameter
    {
        public List<Guid> Id { get; set; }
        public string PasswordCeo { get; set; }
    }
}
