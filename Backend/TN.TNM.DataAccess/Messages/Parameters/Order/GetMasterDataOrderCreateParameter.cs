using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Order
{
    public class GetMasterDataOrderCreateParameter : BaseParameter
    {
        public Guid? CreateObjectId { get; set; }
        public Guid? PackId {get;set;}
    }
}
