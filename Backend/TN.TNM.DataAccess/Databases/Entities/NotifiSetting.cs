﻿using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class NotifiSetting
    {
        public Guid NotifiSettingId { get; set; }
        public string NotifiSettingName { get; set; }
        public Guid? ScreenId { get; set; }
        public Guid? NotifiActionId { get; set; }
        public bool IsApproved { get; set; }
        public bool IsParticipant { get; set; }
        public bool IsCreated { get; set; }
        public bool IsPersonIncharge { get; set; }
        public bool SendInternal { get; set; }
        public int? BackHourInternal { get; set; }
        public bool IsSystem { get; set; }
        public string SystemTitle { get; set; }
        public string SystemContent { get; set; }
        public bool IsEmail { get; set; }
        public string EmailTitle { get; set; }
        public string EmailContent { get; set; }
        public bool IsSms { get; set; }
        public string SmsTitle { get; set; }
        public string SmsContent { get; set; }
        public bool SendCustomer { get; set; }
        public int? BackHourCustomer { get; set; }
        public bool IsCustomerEmail { get; set; }
        public string CustomerEmailTitle { get; set; }
        public string CustomerEmailContent { get; set; }
        public bool IsCustomerSms { get; set; }
        public string CustomerSmsTitle { get; set; }
        public string CustomerSmsContent { get; set; }
        public bool Active { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? TenantId { get; set; }
        public Guid? ObjectBackHourInternal { get; set; }
        public Guid? ObjectBackHourCustomer { get; set; }
    }
}
