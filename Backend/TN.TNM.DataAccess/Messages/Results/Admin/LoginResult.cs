using System;
using System.Collections.Generic;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Models;
using TN.TNM.DataAccess.Models.Admin;
using TN.TNM.DataAccess.Models.MenuBuild;
using TN.TNM.DataAccess.Models.User;

namespace TN.TNM.DataAccess.Messages.Results.Admin
{
    public class LoginResult : BaseResult
    {
        public AuthEntityModel CurrentUser { get; set; }
        public string UserFullName { get; set; }
        public string UserAvatar { get; set; }
        public string UserEmail { get; set; }
        public bool IsManager { get; set; }
        public Guid? PositionId { get; set; }
        public List<string> PermissionList { get; set; }
        public List<string> ListPermissionResource { get; set; }
        public bool IsAdmin { get; set; }
        public List<SystemParameter> SystemParameterList { get; set; }
        public bool IsOrder { get; set; }
        public bool IsCashier { get; set; }
        public List<MenuBuildEntityModel> ListMenuBuild { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeCodeName { get; set; }
        public ContactEntityModel ContactEntityModel { get; set; }
        public Guid? RoleId { get; set; }
        public List<BaseType> ListChucVu { get; set; }
        public int? ChucVuId { get; set; }
    }
}
