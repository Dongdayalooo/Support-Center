export class VendorModel {
    statusCode: number;
    messageCode: string;
    vendorList: VendorListModel[];
}

export class VendorListModel {
  prepaymentValue(prepaymentValue: any): any {
    throw new Error('Method not implemented.');
  }
    id: string;
    vendorId: string;
    vendorName: string
    vendorCode: string;
    vendorGroupId: string;
    vendorGroupName: string;
    active: boolean;
    contactId: string;
    countVendorInformation: number;
    createdById: string;
    createdDate: string;
    paymentId: string;
    totalPayableValue: number;
    totalPurchaseValue: number;
    canDelete: boolean;
    address: string;
    email: string;
    phoneNumber: string;
    listoptionId: Array<string>;
    price: number;
    isEdit: boolean = false;
    isSave: boolean = false;
    soLuongToiThieu: any;
    giaTriThanhToan: any;
    thoiGianTu: any;
    thoiGianDen: string | number | Date;
    yeuCauThanhToan: number;
    donViTien: any;
  thueGtgt: any;
  giaTriChietKhau: string;
  chietKhauId: number;
    constructor() {
        this.vendorName = "";
    }
}

export class VendorGroupModel {
    categoryId: string;
    categoryName: string;
    categoryCode: string;
}

export class UpdatePriceVendorMappingOptionResult {
    statusCode: number;
    message: string;
}