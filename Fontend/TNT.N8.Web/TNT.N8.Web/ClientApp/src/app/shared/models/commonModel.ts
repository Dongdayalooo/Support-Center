export class ProvinceModel {
  provinceId: string;
  provinceName: string;
  provinceType: string;
  provinceCode: string;
}

export class DistrictModel {
  districtId: string;
  districtName: string;
  districtType: string;
  districtCode: string;
  provinceId: string;
}


export class WardModel {
  wardId: string;
  wardCode: string;
  wardType: string;
  wardName: string;
  districtId: string;
}

export class ContactVendorDialogModel {
  ContactId: string;
  ObjectId: string;
  ObjectType: string;
  FullName: string;
  GenderDisplay: string;
  GenderName: string;
  Role: string;
  Phone: string;
  Email: string;
  CreatedById: string;
  CreatedDate: Date;
  UpdatedById: string;
  UpdatedDate: Date;
}

export class BankAccountModel {
  bankAccountId: string;
  objectId: string;
  objectType: string;
  bankName: string; //Tên ngân hàng
  accountNumber: string;  //Số tài khoản
  accountName: string;  //Chủ tài khoản
  branchName: string; //Chi nhánh
  bankDetail: string;  //Diễn giải
  createdById: string;
  createdDate: Date;
}

export class PaymentMethodModel {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
}


export class Month {
  label: string;
  result: number;
}

export class ExchangeByVendorModel {
  exchangeId: string;
  exchangeType: string;
  exchangeCode: string;
  exchangeName: string;
  exchangeValue: string;
  exchangeDetail: string;
  exchangeDate: string;
  statusCode: string;
  statusName: string;
  backgroundColorForStatus: string;
}