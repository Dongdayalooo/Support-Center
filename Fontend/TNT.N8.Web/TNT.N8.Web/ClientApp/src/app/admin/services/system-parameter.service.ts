
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CauHinhMucThuongModel } from '../../../../src/app/shared/models/cauHinhMucThuong.model';
import { CauHinhHeSoKhuyenKhichModel } from '../../../../src/app/shared/models/cauHinhHeSoKhuyenKhich.model';
import { CauHinhPhanHangKhModel } from '../../../../src/app/shared/models/cauHinhPhanHangKh.model';

@Injectable()
export class SystemParameterService {

  constructor(private httpClient: HttpClient) { }

  GetAllSystemParameter() {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/getAllSystemParameter';
    return this.httpClient.post(url, {}).pipe(
      map((response: Response) => {
        return response;

      }));
  }

  ChangeSystemParameter(systemKey: string, systemValue: any, systemValueString: any, description: string, listSelectedEmp: string[]) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/changeSystemParameter';
    return this.httpClient.post(url, {
      SystemKey: systemKey,
      SystemValue: systemValue,
      SystemValueString: systemValueString,
      Description: description,
      ListSelectedEmp: listSelectedEmp
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }


  getDataCauHinhMucThuongTab(tabIndex: number) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/getDataCauHinhMucThuongTab';
    return this.httpClient.post(url, {
      TabIndex: tabIndex
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }

  createUpdateCauHinhMucThuong(cauHinh: CauHinhMucThuongModel[]) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/createUpdateCauHinhMucThuong';
    return this.httpClient.post(url, {
      CauHinh: cauHinh
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }

  deleteCauHinhMucThuong(id: string) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/deleteCauHinhMucThuong';
    return this.httpClient.post(url, {
      Id: id
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }

  createUpdateHeSoKhuyenKhich(cauHinh: CauHinhHeSoKhuyenKhichModel) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/createUpdateHeSoKhuyenKhich';
    return this.httpClient.post(url, {
      CauHinh: cauHinh
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }

  deleteCauHinhHeSoKhuyenKhich(cauHinh: CauHinhHeSoKhuyenKhichModel) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/deleteCauHinhHeSoKhuyenKhich';
    return this.httpClient.post(url, {
      CauHinh: cauHinh
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }

  

  createUpdateCauHinhPhkh(cauHinh: CauHinhPhanHangKhModel) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/createUpdateCauHinhPhkh';
    return this.httpClient.post(url, {
      CauHinh: cauHinh,
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }

  deleteCauHinhPhanHangKH(id: string) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/deleteCauHinhPhanHangKH';
    return this.httpClient.post(url, {
      Id: id,
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }
  
  createUpdateCauHinhChietKhau(cauHinh: CauHinhPhanHangKhModel) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/createUpdateCauHinhChietKhau';
    return this.httpClient.post(url, {
      CauHinh: cauHinh,
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }

  deleteCauHinhChietKhau(id: string) {
    const url = localStorage.getItem('ApiEndPoint') + '/api/company/deleteCauHinhChietKhau';
    return this.httpClient.post(url, {
      Id: id,
    }).pipe(
      map((response: Response) => {
        return response;
      }));
  }

  


}
