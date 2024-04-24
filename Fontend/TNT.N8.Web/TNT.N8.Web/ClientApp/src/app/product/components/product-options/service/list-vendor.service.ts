import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { UpdatePriceVendorMappingOptionResult, VendorListModel, VendorModel } from '../model/list-vendor';
import { Observable } from 'rxjs';
import { VendorMappingOption } from '../../../../../../src/app/shared/models/VendorMappingOption.model';
import { CauHinhMucHoaHong } from '../../../../../../src/app/shared/models/cauHinhHoaHong.model';

@Injectable({
  providedIn: 'root'
})
export class ListVendorService {

  constructor(private httpClient: HttpClient) { }
  getAllVendorToPay() {
    const url = localStorage.getItem('ApiEndPoint') + '/api/vendor/getAllVendor';
    return this.httpClient.post(url, {}).pipe(
      map((response: VendorModel) => {
        return <VendorModel>response;
      }));
  }
  searchVendorAsync(vendorName: string, vendorCode: string, vendorGroupIdList: Array<string>, userId: string) {
    let url = localStorage.getItem('ApiEndPoint') + '/api/vendor/searchVendor';
    return new Promise((resolve, reject) => {
      return this.httpClient.post(url, { VendorName: vendorName, VendorCode: vendorCode, VendorGroupIdList: vendorGroupIdList, UserId: userId }).toPromise()
        .then((response: VendorListModel) => {
          resolve(response);
        });
    });
  }
  getDataSearchVendor(useId: string) {
    let url = localStorage.getItem('ApiEndPoint') + '/api/vendor/getDataSearchVendor';
    return new Promise((resolve, reject) => {
      return this.httpClient.post(url, {
        UserId: useId
      }).toPromise()
        .then((response: VendorListModel) => {
          resolve(response);
        });
    });
  }


  getMasterDataAddVendorToOption(optionId: string, listVendorId: string[], donGiaTu: number, donGiaDen: number, thoiGianTu: Date, thoiGianDen: Date) {
    let url = localStorage.getItem('ApiEndPoint') + '/api/options/getMasterDataAddVendorToOption';
    return new Promise((resolve, reject) => {
      return this.httpClient.post(url, {
        OptionId: optionId,
        ListVendorId: listVendorId,
        DonGiaTu: donGiaTu,
        DonGiaDen: donGiaDen,
        ThoiGianTu: thoiGianTu,
        ThoiGianDen: thoiGianDen,
      }).toPromise()
        .then((response) => {
          resolve(response);
        });
    });
  }

  addVendorToOption(data: VendorMappingOption, optionId: string, thanhToanTruoc: boolean, listCauHinhHoaHong: CauHinhMucHoaHong[]) {
    let url = localStorage.getItem('ApiEndPoint') + '/api/options/addVendorToOption';
    return new Promise((resolve, reject) => {
      return this.httpClient.post(url, {
        VendorMappingOption: data,
        OptionId: optionId,
        ThanhToanTruoc: thanhToanTruoc,
        ListCauHinhHoaHong: listCauHinhHoaHong,
      }).toPromise()
        .then((response) => {
          resolve(response);
        });
    });
  }


  deleteVendorMappingOption(vendorId: string, optionId: string) {
    let url = localStorage.getItem('ApiEndPoint') + '/api/options/deleteVendorMappingOption';
    return new Promise((resolve, reject) => {
      return this.httpClient.post(url, {
        VendorId: vendorId,
        OptionId: optionId,
      }).toPromise()
        .then((response) => {
          resolve(response);
        });
    });
  }

  quickCreateVendor(
    VendorGroup, VendorName,
    MST, Phone,
    Email, Website,
    Address, Description,

    Bank, Account,
    AccountName, Branch,

    vendorId, optionId,

  ) {
    let url = localStorage.getItem('ApiEndPoint') + '/api/options/quickCreateVendor';
    return new Promise((resolve, reject) => {
      return this.httpClient.post(url, {
        VendorId: vendorId,
        OptionId: optionId,
      }).toPromise()
        .then((response) => {
          resolve(response);
        });
    });
  }

  updatePriceVendorMappingOption(vendorId: string, optionId: string, price: number): Observable<UpdatePriceVendorMappingOptionResult> {
    let url = localStorage.getItem('ApiEndPoint') + '/api/options/updatePriceVendorMappingOption';
    return this.httpClient.post(url,
      {
        VendorId: vendorId,
        OptionId: optionId,
        Price: price
      }
    ).pipe(
      map((response: UpdatePriceVendorMappingOptionResult) => {
        return <UpdatePriceVendorMappingOptionResult>response;
      }));
  }

  importVendorMappingOptions(listImport: VendorMappingOption[], optionId: string) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/options/importVendorMappingOptions';
    return this.httpClient.post(url, {
      ListImport: listImport,
      OptionId: optionId,
    }).pipe(
      map((response: VendorModel) => {
        return <VendorModel>response;
      }));
  }
}
