using System;
using System.Collections.Generic;
using System.Text;

namespace TN.TNM.DataAccess.Messages.Parameters.Options
{
    public class GetBaoCaoTongHopParameter: BaseParameter
    {
        public int TabIndex { get; set; }

        public List<Guid> ListNhomDichVuId { get; set; }
        public List<Guid> ListDichVuId { get; set; }
        public List<Guid> ListGoiDichVuId { get; set; }
        public List<int> ListLoaiDoanhThuId { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public decimal? DoanhThuTu { get; set; }
        public decimal? DoanhThuDen { get; set; }

        public List<Guid> ListPhanHangId { get; set; }
        public List<Guid> ListKhachHangId { get; set; }

        public List<int> ListChucVuId { get; set; }
        public List<int> ListLoaiNhanVienId { get; set; }
    }
}
