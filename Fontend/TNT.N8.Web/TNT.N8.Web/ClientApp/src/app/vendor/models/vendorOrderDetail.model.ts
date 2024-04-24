
export class VendorOrderDetailModel {
    vendorOrderDetailId: string;
    vendorOrderId: string;
    orderDetailId: string | null;
    servicePacketId: string | null;
    optionId: string | null;
    isExtend: boolean | null;
    quantity: number | null;
    currencyUnit: string | null;
    vat: number | null;
    discountType: boolean | null;
    discountValue: number | null;
    priceAfterVat: number | null;
    thanhToanTruoc: number | null;
    tongTienHoaHong: number | null;
    ghiChu: string;
    tenDichVu: string;
    thongTinChiTiet: string[];
    currencyUnitName: string;
    price: number | null;
    createdById: string;
    
    createdDate: string;
    updatedById: string | null;
    updatedDate: string | null;
    donViTien: string;
    yeuCauThanhToan: number | null;
    giaTriThanhToan: number | null;
    donViTienId: string | null;
    thueGtgt: number | null;
    chietKhauId: number | null;
    giaTriChietKhau: number | null;
    thanhTienSauThue: number | null;
    phuongThucThanhToan: number | null;

    loaiHoaHongId: number | null;
    giaTriHoaHong: number | null;
    thoiGianThucHien: Date | null;
    tongTienKhachHangThanhToan: number | null;
}