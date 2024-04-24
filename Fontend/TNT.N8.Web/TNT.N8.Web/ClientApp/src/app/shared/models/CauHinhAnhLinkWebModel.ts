export class CauHinhAnhLinkWebModel {
    id: string | null;
    anh: string;
    link: string;
    type: number;//--1: Banner, 2: Ưu đãi, 3: quảng cáo trái, 4: quảng cáo phải
    constructor(type: number) {
        this.type = type;
    }
}