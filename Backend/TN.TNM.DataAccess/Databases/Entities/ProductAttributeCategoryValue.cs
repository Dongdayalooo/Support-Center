﻿using System;
using System.Collections.Generic;

namespace TN.TNM.DataAccess.Databases.Entities
{
    public partial class ProductAttributeCategoryValue
    {
        public ProductAttributeCategoryValue()
        {
            OrderProductDetailProductAttributeValue = new HashSet<OrderProductDetailProductAttributeValue>();
            QuoteProductDetailProductAttributeValue = new HashSet<QuoteProductDetailProductAttributeValue>();
        }

        public Guid ProductAttributeCategoryValueId { get; set; }
        public string ProductAttributeCategoryValue1 { get; set; }
        public Guid ProductAttributeCategoryId { get; set; }
        public Guid CreatedById { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? UpdatedById { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool Active { get; set; }
        public Guid? TenantId { get; set; }

        public ProductAttributeCategory ProductAttributeCategory { get; set; }
        public ICollection<OrderProductDetailProductAttributeValue> OrderProductDetailProductAttributeValue { get; set; }
        public ICollection<QuoteProductDetailProductAttributeValue> QuoteProductDetailProductAttributeValue { get; set; }
    }
}
