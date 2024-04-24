export class CategoryModel {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  sortOrder: number;
  categoryTypeId: string;
  createdById: string;
  createdDate: Date;
  updatedById: string;
  updatedDate: string;
  active: Boolean;
  isEdit: Boolean;
  isDefault: Boolean;
  statusName: string;
  potentialName: string;
  categoryTypeName: string;
  constructor() { }
}
