﻿using System;

namespace TN.TNM.DataAccess.Models
{
    public class CategoryEntityModel : BaseModel<DataAccess.Databases.Entities.Category>
    {
        public Guid? CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string CategoryCode { get; set; }
        public Guid? CategoryTypeId { get; set; }
        public string CategoryTypeName { get; set; }
        public Guid? CreatedById { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool? Active { get; set; }
        public bool? IsEdit { get; set; }
        public bool? IsDefault { get; set; }
        public string CategoryTypeCode { get; set; }
        public int? CountCategoryById { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsDefauld { get; set; }
        public int? StepId { get; set; }
        public decimal? Value { get; set; }
        public Guid? TenantId { get; set; }

        public CategoryEntityModel()
        {
        }

        public CategoryEntityModel(DataAccess.Databases.Entities.Category entity)
        {
            Mapper(entity, this);
            //Xu ly sau khi lay tu DB len
        }

        public override DataAccess.Databases.Entities.Category ToEntity()
        {
            //Code tien xu ly model truoc khi day vao DB
            var entity = new DataAccess.Databases.Entities.Category();
            Mapper(this, entity);
            return entity;
        }
    }
}
