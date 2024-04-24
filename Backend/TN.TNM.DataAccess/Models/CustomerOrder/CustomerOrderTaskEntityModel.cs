using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Employee;

namespace TN.TNM.DataAccess.Models.CustomerOrder
{
    public class CustomerOrderTaskEntityModel
    {
        public Guid Id { get; set; }
        public Guid? OrderDetailId { get; set; }
        public Guid? OrderActionId { get; set; }
        public Guid? ServicePacketId { get; set; }
        public Guid? OptionId { get; set; }
        public string OptionName { get; set; }
        public int? Stt { get; set; }
        public string OrderActionCode { get; set; }
        public string Path { get; set; }
        public Guid? VendorId { get; set; }
        public string VendorName { get; set; }
        public Guid? EmpId { get; set; }
        public string EmpName { get; set; }
        public string EmpPhone { get; set; }
        public List<Guid> ListEmpId { get; set; }
        public List<EmployeeEntityModel> ListEmployeeEntityModel { get; set; }
        public string ListEmpName { get; set; }
        public bool? isExtend { get; set; } //Có phải là dịch vụ phát sinh hay không
        public string Mission { get; set; }
        public string Note { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid UpdatedById { get; set; }
        public DateTime UpdatedDate { get; set; }
        public Guid TenantId { get; set; }
        public bool IsPersonInCharge { get; set; }
        public bool? SendThongBao { get; set; }
        
        public int? NguoiThucHienType { get; set; } //1: Nhà cung cấp, 2 Nhân viên HDTL
        public int? StatusId { get; set; }
        public bool? XacNhanDichVu { get; set; } //Hiện thị nút xác nhận thực hiện dịch vụ theo người đăng nhập
        public DateTime? HanPheDuyet { get; set; }
        public bool? EnableBaoCaoDoanhThu { get; set; }
        public DateTime? NgayYeuCau { get; set; }
        public string GoiDichVu { get; set; }
        public string StatusOrderName { get; set; }
        public string Status { get; set; }

        public Guid? VendorOrderDetailId { get; set; }

        public Guid? VendorOrderId { get; set; }
        public string VendorOrderCode { get; set; }

        public bool? ShowBtn { get; set; }

        //Phân loại dịch vụ
        public bool? ThanhToanTruoc { get; set; }
        public decimal? Quantity { get; set; }

        public int? RateStar { get; set; }
        public string RateContent { get; set; }

    }
}
