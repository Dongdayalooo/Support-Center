import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AdvertisementConfigurationEntityModel, CreateOrEditMobileAppConfigurationResult, MobileAppConfigurationEntityModel, PaymentMethodConfigure, TakeMobileAppConfigurationResult } from '../models/mobile-app-configuraton.models';
import { CauHinhThongTinWebBanHangModel } from '../../../../src/app/shared/models/CauHinhThongTinWebBanHangModel';
import { CauHinhDanhGiaWebModel } from '../../../../src/app/shared/models/CauHinhDanhGiaWebModel';
import { CauHinhGioiThieuWebModel } from '../../../../src/app/shared/models/CauHinhGioiThieuWebModel';
import { CauHinhQuangCaoDoiTacModel } from '../../../../src/app/shared/models/CauHinhQuangCaoDoiTacModel';
import { CauHinhAnhLinkWebModel } from '../../../../src/app/shared/models/CauHinhAnhLinkWebModel';

@Injectable()
export class MobileAppConfigurationService {
    constructor(private httpClient: HttpClient) { }

    createOrEditMobileAppConfiguration(mobileAppConfigurationEntityModel: MobileAppConfigurationEntityModel) {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/createOrEditMobileAppConfiguration';
        return this.httpClient.post(url, { MobileAppConfigurationEntityModel: mobileAppConfigurationEntityModel })
            .pipe(
                map((response: CreateOrEditMobileAppConfigurationResult) => {
                    return response;
                })
            );
    }

    takeMobileAppConfiguration() {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/takeMobileAppConfiguration';
        return this.httpClient.post(url, {})
            .pipe(
                map((response: TakeMobileAppConfigurationResult) => {
                    return response;
                })
            );
    }

    deletePaymentMethod(rowData: PaymentMethodConfigure) {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/deletePaymentMethod';
        return this.httpClient.post(url, { Payment: rowData })
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    createOrUpdatePaymentMethod(rowData: PaymentMethodConfigure) {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/createOrUpdatePaymentMethod';
        return this.httpClient.post(url, { Payment: rowData })
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }

    createOrEditAdvertisementConfiguration(advertisementConfigurationEntityModel: AdvertisementConfigurationEntityModel) {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/createOrEditAdvertisementConfiguration';
        return this.httpClient.post(url, { AdvertisementConfigurationEntityModel: advertisementConfigurationEntityModel })
            .pipe(
                map((response: CreateOrEditMobileAppConfigurationResult) => {
                    return response;
                })
            );
    }

    deleteAdvertisementConfiguration(id: string) {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/deleteAdvertisementConfiguration';
        return this.httpClient.post(url, { Id: id })
            .pipe(
                map((response: CreateOrEditMobileAppConfigurationResult) => {
                    return response;
                })
            );
    }

    uploadMobileAppConfigurationImage(fileList: File[]): Promise<Response> {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/uploadMobileAppConfigurationImage';
        let formData: FormData = new FormData();
        for (var i = 0; i < fileList.length; i++) {
            formData.append('fileList', fileList[i]);
        }
        return new Promise((resolve, reject) => {
            return this.httpClient.post(url, formData).toPromise()
                .then((response: Response) => {
                    resolve(response);
                });
        });
    }

    uploadAdvertisementConfigurationImage(fileList: File[]): Promise<Response> {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/uploadAdvertisementConfigurationImage';
        let formData: FormData = new FormData();
        for (var i = 0; i < fileList.length; i++) {
            formData.append('fileList', fileList[i]);
        }
        return new Promise((resolve, reject) => {
            return this.httpClient.post(url, formData).toPromise()
                .then((response: Response) => {
                    resolve(response);
                });
        });
    }

    createUpdateCauHinhWeb(
        CauHinhThongTinWebBanHang: CauHinhThongTinWebBanHangModel,
        CauHinhDanhGiaWeb: CauHinhDanhGiaWebModel[],
        CauHinhGioiThieuWeb: CauHinhGioiThieuWebModel[],
        CauHinhQuangCaoDoiTac: CauHinhQuangCaoDoiTacModel[],
        listCauHinhAnhLink: CauHinhAnhLinkWebModel[],
    ) {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/createUpdateCauHinhWeb';
        return this.httpClient.post(url, {
            CauHinhThongTinWebBanHang: CauHinhThongTinWebBanHang,
            CauHinhDanhGiaWeb: CauHinhDanhGiaWeb,
            CauHinhGioiThieuWeb: CauHinhGioiThieuWeb,
            CauHinhQuangCaoDoiTac: CauHinhQuangCaoDoiTac,
            CauHinhAnhLinkWeb: listCauHinhAnhLink,
        }).pipe(
            map((response: any) => {
                return response;
            })
        );
    }

    getDataCauHinhWeb() {
        const url = localStorage.getItem('ApiEndPoint') + '/api/MobileAppConfiguration/getDataCauHinhWeb';
        return this.httpClient.post(url, {})
            .pipe(
                map((response: any) => {
                    return response;
                })
            );
    }


}