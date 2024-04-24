export class CauHinhMucChietKhauModel {
    id: string | null;
    phanHangId: string | null;
    phanHang: string;
    loaiChietKhauId: number | null;
    loaiChietKhau: string;
    giaTri: number | null;
    dieuKienId: number | null;
    dieuKien: string;
    giaTriTu: number | null;
    giaTriDen: number | null;
    thoiGianTu: Date | null;
    thoiGianDen: Date | null;
    parentId: string | null;
    createdDate: string;
    createdById: string;
    updatedDate: string | null;
    updatedById: string | null;
    tenantId: string | null;
}