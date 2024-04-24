import { BaseType } from "../../../../src/app/shared/models/baseType.model";

export class VendorOrderModel {
    vendorOrderId: string;
    vendorOrderType: number | null;
    vendorOrderCode: string;
    vendorOrderDate: string | null;
    createdById: string | null;
    createdBy: string;
    statusName: string;
    statusId: number | null;
    vendorId: string | null;
    vendorName: string;
    vendorEmail: string;
    vendorPhone: string;
    vendorAddress: string;
    vendorNguoiLienHeId: string | null;
    vendorNguoiLienHeEmail: string;
    vendorNguoiLienPhone: string;
    orderActionId: string | null;
    orderActionName: string;
    customerId: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    note: string;
    vendorNguoiLienHe: string;
    paymentMethodId: string | null;
    phuongThucThanhToan: any | null;

    amount: number | null;
    discountValue: number | null;
    discountType: number | null;
    discountObject: BaseType | null;
    createdDate: string;
    updatedById: string | null;
    updatedDate: string | null;
    totalPayment: number | null;
}