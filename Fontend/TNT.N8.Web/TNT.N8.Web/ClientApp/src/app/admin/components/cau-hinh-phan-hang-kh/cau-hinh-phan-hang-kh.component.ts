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
import { CauHinhPhanHangKhModel } from '../../../../../src/app/shared/models/cauHinhPhanHangKh.model';

@Component({
  selector: 'app-cau-hinh-phan-hang-kh',
  templateUrl: './cau-hinh-phan-hang-kh.component.html',
  styleUrls: ['./cau-hinh-phan-hang-kh.component.css']
})
export class CauHinhPhanHangKhComponent implements OnInit {
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';

  cauHinhPhanHangForm: FormGroup;
  phanHangControl: FormControl
  dieuKienControl: FormControl
  giaTriTuControl: FormControl
  giaTriDenControl: FormControl


  currentCauHinh: CauHinhPhanHangKhModel = null;
  dialogCauHinh: boolean = false;
  level: number = 0;
  isEditCauHinh: boolean = false;

  loading: boolean = false;


  listCauHinhPhanHangKh: CauHinhPhanHangKhModel[] = [];
  listCauHinhPhanHangKhTree: TreeNode[] = [];
  listDieuKienPhanHangKh: TrangThaiGeneral[] = [];
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
    this.dieuKienControl = new FormControl(null);
    this.giaTriTuControl = new FormControl(null);
    this.giaTriDenControl = new FormControl(null);

    this.cauHinhPhanHangForm = new FormGroup({
      phanHangControl: this.phanHangControl,
      dieuKienControl: this.dieuKienControl,
      giaTriTuControl: this.giaTriTuControl,
      giaTriDenControl: this.giaTriDenControl,

    });
  }

  changeTab() {
    this.loading = true;
    this.systemParameterService.getDataCauHinhMucThuongTab(4).subscribe(response => {
      this.loading = false;

      let result = <any>response;
      if (result.statusCode != 200) {
        this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
        return;
      }
      console.log("result", result)
      this.listPhanLoaiKh = result.listPhanLoaiKh
      this.listCauHinhPhanHangKh = result.listCauHinhPhanHangKh;
      this.listDieuKienPhanHangKh = result.listDieuKienPhanHangKh;

      let listChildren = this.listCauHinhPhanHangKh.filter(x => x.parentId == null);
      this.listCauHinhPhanHangKhTree = this.mapCauHinhToTree(listChildren);
    });
  }


  saveCauHinh() {
    this.loading = true;

    var cauHinh = new CauHinhPhanHangKhModel();
    debugger
    if (this.cauHinhPhanHangForm.invalid) {
      this.cauHinhPhanHangForm.markAllAsTouched();
      this.loading = false;
      return this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Vui lòng nhập đủ các trường thông tin!" });
    }

    cauHinh.id = this.isEditCauHinh ? this.currentCauHinh?.id : null;
    cauHinh.phanHangId = this.phanHangControl.value?.categoryId;
    cauHinh.dieuKienId = this.dieuKienControl.value?.value;
    cauHinh.giaTriTu = this.giaTriTuControl.value;
    cauHinh.giaTriDen = this.giaTriDenControl.value;
    cauHinh.parentId = this.level == 1 ? (this.isEditCauHinh ? this.currentCauHinh?.parentId : this.currentCauHinh?.id) : null;

    if(cauHinh.giaTriTu > cauHinh.giaTriDen && cauHinh.parentId){{
      this.loading = false;
      return this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Giá trị từ không được lớn hơn giá trị đến!" });
    }}

    this.loading = true;
    this.systemParameterService.createUpdateCauHinhPhkh(cauHinh).subscribe(response => {
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
  mapCauHinhToTree(listHeSo: CauHinhPhanHangKhModel[]): TreeNode[] {
    let result: Array<TreeNode> = [];
    listHeSo.forEach((item) => {
      let listChildren = this.listCauHinhPhanHangKh.filter(x => x.parentId == item?.id);
      let listChildrenNode: Array<TreeNode> = listChildren.length > 0 ? this.mapCauHinhToTree(listChildren) : [];

      let node: TreeNode = { data: item, children: listChildrenNode }
      node.expanded = true;
      result.push(node);
    })
    return result;
  }

  parentCauHinh: CauHinhPhanHangKhModel = null;
  addEditCauHinhKhuyenKhich(rowData: CauHinhPhanHangKhModel, level: number, isEditCauHinh: boolean) {
    this.cauHinhPhanHangForm.reset();
    this.setForm();
    this.level = level;
    this.isEditCauHinh = isEditCauHinh;
    if (rowData == null) {
      this.currentCauHinh = new CauHinhPhanHangKhModel();
      rowData = new CauHinhPhanHangKhModel();
    } else {
      this.currentCauHinh = rowData;
    }
    //Nếu là lv0
    if (level == 0) {
      var listKey = ["phanHangControl"];
      listKey.forEach(item => {
        this.cauHinhPhanHangForm.get(item).setValidators([Validators.required]);
        this.cauHinhPhanHangForm.get(item).updateValueAndValidity();
      });
      this.phanHangControl.setValue(this.listPhanLoaiKh.find(x => x.categoryId == rowData.phanHangId))
    }
    //Nếu là lv1
    else {
      this.parentCauHinh = this.listCauHinhPhanHangKh.find(x => x.id == rowData.parentId || (this.isEditCauHinh == false && x.id == rowData.id));
      var listKey = ["dieuKienControl", "giaTriTuControl", "giaTriDenControl"];
      listKey.forEach(item => {
        this.cauHinhPhanHangForm.get(item).setValidators([Validators.required]);
        this.cauHinhPhanHangForm.get(item).updateValueAndValidity();
        this.cauHinhPhanHangForm.get(item).setValue(null);
      });

      this.dieuKienControl.setValue(this.listDieuKienPhanHangKh.find(x => x.value == rowData.dieuKienId))
      this.giaTriTuControl.setValue(rowData.giaTriTu);
      this.giaTriDenControl.setValue(rowData.giaTriDen);
    }
    this.dialogCauHinh = true;
  }

  deleteCauHinhPhanHangKH(id: string) {
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa?',
      accept: () => {
        this.loading = true;
        this.systemParameterService.deleteCauHinhPhanHangKH(id).subscribe(response => {
          this.loading = false;
          let result = <any>response;
          if (result.statusCode == 200) {
            this.listCauHinhPhanHangKhTree = [];
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
    this.cauHinhPhanHangForm.markAsUntouched();
    this.cauHinhPhanHangForm.reset();
    this.dialogCauHinh = false;
    this.currentCauHinh = null;
    this.parentCauHinh = null;
    this.level = 0;
  }
}
