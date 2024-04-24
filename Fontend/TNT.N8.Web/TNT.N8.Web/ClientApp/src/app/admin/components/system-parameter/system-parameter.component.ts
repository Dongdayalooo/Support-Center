import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SystemParameterService } from '../../services/system-parameter.service';
import { EmployeeService } from '../../../employee/services/employee.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService, TreeNode } from 'primeng/api';
import { CauHinhMucThuongModel } from '../../../../../src/app/shared/models/cauHinhMucThuong.model';
import { CategoryEntityModel, EmployeeEntityModel, OptionsEntityModel, TrangThaiGeneral } from '../../../../../src/app/product/models/product.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { CauHinhHeSoKhuyenKhichModel } from '../../../../../src/app/shared/models/cauHinhHeSoKhuyenKhich.model';
import { Table } from 'primeng';
import { BaseType } from '../../../../../src/app/shared/models/baseType.model';
import { CauHinhPhanHangKhModel } from '../../../shared/models/cauHinhPhanHangKh.model';


interface SystemParameterModel {
  systemDescription: string,
  systemKey: string,
  systemValue: boolean,
  systemValueString: string,
  systemGroupCode: string,
  description: string,
  isEdit: boolean
  active: boolean
}

@Component({
  selector: 'app-system-parameter',
  templateUrl: './system-parameter.component.html',
  styleUrls: ['./system-parameter.component.css']
})

export class SystemParameterComponent implements OnInit {
  auth: any = JSON.parse(localStorage.getItem("auth"));
  userId: string = this.auth.UserId;
  loading: boolean = false;
  actionEdit: boolean = true;

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  systemParameterList: Array<SystemParameterModel> = [];
  listGroupSystem: Array<SystemParameterModel> = [];
  listGroupEmail: Array<SystemParameterModel> = [];
  listGroupTemplateEmail: Array<SystemParameterModel> = [];
  listGroupCurrency: Array<SystemParameterModel> = [];
  listGroupLogo: Array<SystemParameterModel> = [];
  colHeader: any[];
  base64Logo: any;
  currentBase64Logo: any;

  @ViewChild('myTableCHMT') myTableCHMT: Table;

 
  filterGlobarCHMT: string = "";

  colCauHinhPhanHang = [
    { field: 'stt', header: '#', textAlign: 'left', display: 'table-cell', colWith: '5%' },
    { field: 'phanHang', header: 'Phân hạng', textAlign: 'left', display: 'table-cell', colWith: '15%' },
    { field: 'giaTriTu', header: 'Giá trị từ', textAlign: 'left', display: 'table-cell', colWith: '15%' },
    { field: 'giaTriDen', header: 'Giá trị đến', textAlign: 'left', display: 'table-cell', colWith: '20%' },
    { field: 'thaoTac', header: 'Thao tác', textAlign: 'center', display: 'table-cell', colWith: '5%' },
  ];

  listEmployee: EmployeeEntityModel[] = [];
  listEmpSelected: EmployeeEntityModel[] = [];

  tabIndex: number = 0;

  @ViewChild('currentLogo') currentLogo: ElementRef;
  validLogo: string = null;

  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  constructor(
    private router: Router,
    private getPermission: GetPermission,
    private translate: TranslateService,
    private employeeService: EmployeeService,
    private systemParameterService: SystemParameterService,
    private messageService: MessageService,
    private ref: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
  ) {
    this.translate.setDefaultLang('vi');
  }

  async ngOnInit() {
    /* #region  init table header */
    this.colHeader = [
      { field: 'loaiThamSo', header: 'Loại Tham Số', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'giaTri', header: 'Giá Trị', textAlign: 'left', display: 'table-cell', colWith: '15%' },
      { field: 'moTa', header: 'Mô tả', textAlign: 'left', display: 'table-cell', colWith: '20%' },
      { field: 'chucNang', header: 'Chức năng', textAlign: 'center', display: 'table-cell', colWith: '5%' },
    ];
    /* #endregion */

    let resource = "sys/admin/system-parameter/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: 'Bạn không có quyền truy cập vào đường dẫn này vui lòng quay lại trang chủ' });
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      this.getMasterData();
    }
  }

  getMasterData() {
    this.loading = true;
    this.systemParameterService.GetAllSystemParameter().subscribe(response => {
      let result = <any>response;
      this.loading = false;
      this.systemParameterList = result.systemParameterList;
      this.systemParameterList.forEach(item => {
        item.isEdit = false;
      });

      //Chia theo groupCode
      this.listGroupSystem = this.systemParameterList.filter(x => x.systemGroupCode == "SYSTEM" && x.active == true);
      this.listGroupEmail = this.systemParameterList.filter(x => x.systemGroupCode == "EMAIL");
      this.listGroupTemplateEmail = this.systemParameterList.filter(x => x.systemGroupCode == "EmailTemplate");
      this.listGroupCurrency = this.systemParameterList.filter(x => x.systemGroupCode == "CURRENCY");
      this.listGroupLogo = this.systemParameterList.filter(x => x.systemGroupCode == "LOGO");

      this.listEmployee = result.listNhanVien;
      this.listEmpSelected = result.listSelectedEmp;

      this.base64Logo = this.systemParameterList.find(x => x.systemKey == 'Logo').systemValueString;
    });
  }

  /*Hủy chỉnh sửa*/
  cancelEdit(data: SystemParameterModel) {
    data.isEdit = false;
  }

  /*Chỉnh sửa*/
  onEdit(data: SystemParameterModel) {
    data.isEdit = true;
  }

  changeParameter(element: any) {
    this.loading = true;


    let systemKey = element.systemKey;
    let systemValue = element.systemValue;
    let systemmValueString = element.systemValueString;

    let listSelectedEmp = [];
    if(systemKey == "ThongBaoKhanCap"){
      listSelectedEmp = this.listEmpSelected ? this.listEmpSelected.map(x => x.employeeId) : [];
    }

    this.systemParameterService.ChangeSystemParameter(systemKey, systemValue, systemmValueString, element.description, listSelectedEmp).subscribe(response => {
      let result = <any>response;
      if (result.statusCode == 200) {
        this.loading = false;
        localStorage.setItem("systemParameterList", JSON.stringify(result.systemParameterList));
        this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: result.messageCode });
        this.getMasterData();
      }
      else {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
      }
    });
  };

  handleFile(event: any) {
    this.validLogo = null;
  }

  async myUploader(event: any) {
    let blobUrl = '';
    this.validLogo = null;
    for (let file of event.files) {
      blobUrl = file.objectURL.changingThisBreaksApplicationSecurity;
    }

    if (blobUrl != '') {
      let base64 = await this.getBase64ImageFromURL(blobUrl);
      this.currentBase64Logo = base64;
      this.ref.detectChanges();
      setTimeout(() => {
        let naturalWidth = this.currentLogo.nativeElement.naturalWidth;
        let naturalHeight = this.currentLogo.nativeElement.naturalHeight;

        if ((naturalWidth < 140 || naturalWidth > 150) && (naturalHeight < 60 || naturalHeight > 70)) {
          this.validLogo = 'chiều rộng trong khoảng: 140px -> 150px, chiêu dài trong khoảng 60px -> 70px';
        } else {
          let description = this.systemParameterList.find(x => x.systemKey == 'Logo').description;
          //Update base64
          this.systemParameterService.ChangeSystemParameter('Logo', null, this.currentBase64Logo, description, []).subscribe(response => {
            let result = <any>response;

            if (result.statusCode == 200) {
              localStorage.setItem("systemParameterList", JSON.stringify(result.systemParameterList));
              this.getMasterData();
              this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: 'Lưu thành công' });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
            }
          });
        }
      }, 1);
    }
  }

  /*Event: xóa 1 file trong list file*/
  onRemove(event: any) {
    this.currentBase64Logo = null;
    this.validLogo = null;
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  currentDoiTuongPhanHangKH: TrangThaiGeneral = null;
  listTieuChiApDungPhanHangKH: TrangThaiGeneral[] = [];
  listPhanLoaiKh: CategoryEntityModel[] = [];
  listCauHinhPhanHangKh: CauHinhPhanHangKhModel[] = [];
  changeTab(index) {
    if (index == 2 || index == 3 || index == 4) {
      this.loading = true;
      this.systemParameterService.getDataCauHinhMucThuongTab(index).subscribe(response => {
        this.loading = false;

        let result = <any>response;
        if (result.statusCode != 200) {
          this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
          return;
        }


        //Nếu là tab cấu hình thưởng
        if (index == 2) {
  
        }
        //Nếu là tab cấu hình phân hạng KH
        else if (index == 4) {
          this.listTieuChiApDungPhanHangKH = result.listTieuChiApDungPhanHangKH;
          this.listPhanLoaiKh = result.listPhanLoaiKh;
          this.listCauHinhPhanHangKh = result.listCauHinhPhanHangKh;
        }
      });
    }
  }
};
