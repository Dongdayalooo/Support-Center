using System;
using System.Collections.Generic;

//File này định nghĩa một đối tượng dữ liệu (entity) trong C# được sử dụng trong Entity Framework Core để tương tác với cơ sở dữ liệu
namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CauHinhPhanHangKh
    {
        public Guid Id { get; set; }
        public int? DieuKienId { get; set; }
        public decimal? GiaTriTu { get; set; }
        public decimal? GiaTriDen { get; set; }
        public Guid? PhanHangId { get; set; }
        public Guid? ParentId { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public Guid? TenantId { get; set; }
    }
}
