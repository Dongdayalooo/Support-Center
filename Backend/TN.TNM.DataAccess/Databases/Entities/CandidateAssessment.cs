﻿using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class CandidateAssessment
    {
        public Guid CandidateAssessmentId { get; set; }
        public Guid CandidateId { get; set; }
        public Guid VacanciesId { get; set; }
        public int Status { get; set; }
        public string OtherReview { get; set; }
        public Guid EmployeeId { get; set; }
        public bool? Active { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public Guid? TenantId { get; set; }
    }
}
