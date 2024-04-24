using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.FireBase
{
    public class ThongBaoDayChatParameter: BaseParameter
    {
        public Guid ReceiverId { get; set; }
        public bool Sos { get; set; }
    }
}
