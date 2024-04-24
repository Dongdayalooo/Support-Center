import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as $ from 'jquery';

//PrimeNg
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { CategoryEntityModel, TrangThaiGeneral } from '../../../product/models/product.model';
import { SystemParameterService } from '../../services/system-parameter.service';
import * as moment from "moment";
import { DecimalPipe } from '@angular/common';
import { CauHinhMucChietKhauModel } from '../../../shared/models/cauHinhChietKhau.model';

@Component({
  selector: 'app-cau-hinh-muc-chiet-khau',
  templateUrl: './cau-hinh-muc-chiet-khau.component.html',
  styleUrls: ['./cau-hinh-muc-chiet-khau.component.css']
})
export class CauHinhMucChietKhauComponent implements OnInit {
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';

  cauHinhForm: FormGroup;
  phanHangControl: FormControl
  loaiChietKhauControl: FormControl
  giaTriControl: FormControl
  dieuKienControl: FormControl
  giaTriTuControl: FormControl
  giaTriDenControl: FormControl
  thoiGianTuControl: FormControl
  thoiGianDenControl: FormControl


  currentCauHinh: CauHinhMucChietKhauModel = null;
  dialogCauHinh: boolean = false;
  level: number = 0;
  isEditCauHinh: boolean = false;

  loading: boolean = false;


  listCauHinhChietKhau: CauHinhMucChietKhauModel[] = [];
  listCauHinhChietKhauTree: TreeNode[] = [];
  listDieuKienChietKhau: TrangThaiGeneral[] = [];
  listKieuThuong: TrangThaiGeneral[] = [];
  listPhanLoaiKh: CategoryEntityModel[] = [];

  constructor(
    private decimalPipe: DecimalPipe,
    private messageService: MessageService,
    private translate: TranslateService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private systemParameterService: SystemParameterService,
    private confirmationService: ConfirmationService,
  ) {
    this.translate.setDefaultLang('vi');
  }

  ngOnInit() {
    this.setForm();
    this.changeTab();
  }

  setForm() {
    this.phanHangControl = new FormControl(null);
    this.loaiChietKhauControl = new FormControl(null);
    this.dieuKienControl = new FormControl(null);
    this.giaTriControl = new FormControl(null);

    this.giaTriTuControl = new FormControl(null);
    this.giaTriDenControl = new FormControl(null);
    this.thoiGianTuControl = new FormControl(null);
    this.thoiGianDenControl = new FormControl(null);


    this.cauHinhForm = new FormGroup({
      phanHangControl: this.phanHangControl,
      loaiChietKhauControl: this.loaiChietKhauControl,
      giaTriControl: this.giaTriControl,
      giaTriTuControl: this.giaTriTuControl,
      dieuKienControl: this.dieuKienControl,
      giaTriDenControl: this.giaTriDenControl,
      thoiGianTuControl: this.thoiGianTuControl,
      thoiGianDenControl: this.thoiGianDenControl,
    });
  }

  changeTab() {
    this.loading = true;
    this.systemParameterService.getDataCauHinhMucThuongTab(5).subscribe(response => {
      this.loading = false;

      let result = <any>response;
      if (result.statusCode != 200) {
        this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
        return;
      }
      this.listPhanLoaiKh = result.listPhanLoaiKh
      this.listCauHinhChietKhau = result.listCauHinhChietKhau;
      this.listDieuKienChietKhau = result.listDieuKienChietKhau;

      this.listKieuThuong = result.listKieuThuong;
      let listChildren = this.listCauHinhChietKhau.filter(x => x.parentId == null);
      this.listCauHinhChietKhauTree = this.mapCauHinhToTree(listChildren);
    });
  }

  saveCauHinh() {
    this.loading = true;

    var cauHinh = new CauHinhMucChietKhauModel();
    if (this.cauHinhForm.invalid) {
      this.cauHinhForm.markAllAsTouched();
      this.loading = false;
      return this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Vui lòng nhập đủ các trường thông tin!" });
    }

    cauHinh.id = this.isEditCauHinh ? this.currentCauHinh?.id : null;
    cauHinh.phanHangId = this.phanHangControl.value?.categoryId;
    cauHinh.giaTri = this.giaTriControl.value;
    cauHinh.dieuKienId = this.dieuKienControl.value?.value;
    cauHinh.loaiChietKhauId = this.loaiChietKhauControl.value?.value;
    cauHinh.giaTriTu = this.giaTriTuControl.value;
    cauHinh.giaTriDen = this.giaTriDenControl.value;
    cauHinh.thoiGianTu = this.thoiGianTuControl.value ? convertToUTCTime(this.thoiGianTuControl.value) : null;
    cauHinh.thoiGianDen = this.thoiGianDenControl.value ? convertToUTCTime(this.thoiGianDenControl.value) : null;
    cauHinh.parentId = this.level == 1 ? (this.isEditCauHinh ? this.currentCauHinh?.parentId : this.currentCauHinh?.id) : null;

    if (cauHinh.giaTri > 100 && !cauHinh.parentId && cauHinh.loaiChietKhauId == 1) {
      this.loading = false;
      return this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Giá trị không được vượt quá 100%!" });
    }

    //Nếu là lv1
    if (cauHinh.parentId) {
      let dieuKien = this.dieuKienControl.value?.value;
      //Nếu là điều kiện từ đến
      if ([1, 2, 3, 4, 5, 6, 7, 10, 12].includes(dieuKien) && cauHinh.giaTriTu > cauHinh.giaTriDen) {
        this.loading = false;
        return this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Giá trị từ không được lớn hơn giá trị đến!" });
      }

      //Điều kiện giới tính
      if ([11].includes(dieuKien) && (cauHinh.giaTriTu != 0 && cauHinh.giaTriTu != 1)) {
        this.loading = false;
        return this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Giá trị của giới tính chỉ được nhập 0 hoặc 1!" });
      }

      //Điều kiện từ ngày đến ngày
      if ([9].includes(dieuKien) && cauHinh.thoiGianTu > cauHinh.thoiGianDen) {
        this.loading = false;
        return this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Thời gian từ không được lớn hơn thời gian đến!" });
      }
    }

    this.systemParameterService.createUpdateCauHinhChietKhau(cauHinh).subscribe(response => {
      this.loading = false;
      let result = <any>response;
      if (result.statusCode == 200) {
        this.changeTab();
        this.closeCauHinhKhuyenKhich();
        this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: result.messageCode });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
      }
    });
  }

  //Hệ số khuyến khích
  mapCauHinhToTree(listHeSo: CauHinhMucChietKhauModel[]): TreeNode[] {
    let result: Array<TreeNode> = [];
    listHeSo.forEach((item) => {
      let listChildren = this.listCauHinhChietKhau.filter(x => x.parentId == item?.id);
      let listChildrenNode: Array<TreeNode> = listChildren.length > 0 ? this.mapCauHinhToTree(listChildren) : [];

      let node: TreeNode = { data: item, children: listChildrenNode }
      node.expanded = true;
      result.push(node);
    })
    return result;
  }

  parentCauHinh: CauHinhMucChietKhauModel = null;
  addEditCauHinhKhuyenKhich(rowData: CauHinhMucChietKhauModel, level: number, isEditCauHinh: boolean) {
    this.cauHinhForm.reset();
    this.setForm();

    this.level = level;
    this.isEditCauHinh = isEditCauHinh;
    if (rowData == null) {
      this.currentCauHinh = new CauHinhMucChietKhauModel();
      rowData = new CauHinhMucChietKhauModel();
    } else {
      this.currentCauHinh = rowData;
    }

    //Nếu là lv0
    if (level == 0) {
      var listKey = ["phanHangControl", "loaiChietKhauControl", "giaTriControl"];
      listKey.forEach(item => {
        this.cauHinhForm.get(item).setValidators([Validators.required]);
        this.cauHinhForm.get(item).updateValueAndValidity();
      });
      this.phanHangControl.setValue(this.listPhanLoaiKh.find(x => x.categoryId == rowData.phanHangId));
      this.loaiChietKhauControl.setValue(this.listKieuThuong.find(x => x.value == rowData.loaiChietKhauId))
      this.giaTriControl.setValue(rowData.giaTri)
    }
    //Nếu là lv1
    else {
      this.parentCauHinh = this.listCauHinhChietKhau.find(x => x.id == rowData.parentId || (this.isEditCauHinh == false && x.id == rowData.id));
      var listKey = ["dieuKienControl", "giaTriTuControl", "giaTriDenControl"];
      listKey.forEach(item => {
        this.cauHinhForm.get(item).setValidators([Validators.required]);
        this.cauHinhForm.get(item).updateValueAndValidity();
        this.cauHinhForm.get(item).setValue(null);
      });
      this.dieuKienControl.setValue(this.listDieuKienChietKhau.find(x => x.value == rowData.dieuKienId));
      this.changeDieuKien();
      this.giaTriTuControl.setValue(rowData.giaTriTu);
      this.giaTriDenControl.setValue(rowData.giaTriDen);
      this.thoiGianTuControl.setValue(rowData.thoiGianTu);
      this.thoiGianDenControl.setValue(rowData.thoiGianDen);
    }
    this.dialogCauHinh = true;
  }

  changeDieuKien() {
    if (this.dieuKienControl.value?.value) {
      var listKeyReq = [];
      var listKeyNotReq = [];

      //Điều kiện số từ đến
      if ([1, 2, 3, 4, 5, 6, 7, 10, 12].includes(this.dieuKienControl.value?.value)) {
        listKeyReq = ["giaTriTuControl", "giaTriDenControl"];
        listKeyNotReq = ["thoiGianTuControl", "thoiGianDenControl"];
      }

      //Điều kiện giới tính
      if ([11].includes(this.dieuKienControl.value?.value)) {
        listKeyReq = ["giaTriTuControl"];
        listKeyNotReq = ["thoiGianTuControl", "thoiGianDenControl", "giaTriDenControl"];
      }

      //Điều kiện thời gian từ đến
      if ([9].includes(this.dieuKienControl.value?.value)) {
        listKeyReq = ["thoiGianTuControl", "thoiGianDenControl"];
        listKeyNotReq = ["giaTriTuControl", "giaTriDenControl"];
      }

      //Điều kiện ngày sinh
      if ([8].includes(this.dieuKienControl.value?.value)) {
        listKeyNotReq = ["giaTriTuControl", "giaTriDenControl", "thoiGianTuControl", "thoiGianDenControl"];
      }

      listKeyReq.forEach(item => {
        this.cauHinhForm.get(item).setValue(null);
        this.cauHinhForm.get(item).setValidators([Validators.required]);
        this.cauHinhForm.get(item).updateValueAndValidity();
      });
      listKeyNotReq.forEach(item => {
        this.cauHinhForm.get(item).setValue(null);
        this.cauHinhForm.get(item).setValidators([]);
        this.cauHinhForm.get(item).updateValueAndValidity();
      });
    }
  }

  deleteCauHinhChietKhau(id: string) {
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa?',
      accept: () => {
        this.loading = true;
        this.systemParameterService.deleteCauHinhChietKhau(id).subscribe(response => {
          this.loading = false;
          let result = <any>response;
          if (result.statusCode == 200) {
            this.listCauHinhChietKhauTree = [];
            this.changeTab();
            this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: result.messageCode });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
          }
        });
      }
    });
  }

  closeCauHinhKhuyenKhich() {
    this.cauHinhForm.markAsUntouched();
    this.cauHinhForm.reset();
    this.dialogCauHinh = false;
    this.parentCauHinh = null;
    this.currentCauHinh = null;
    this.level = 0;
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

