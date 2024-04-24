import { Component, OnInit, ElementRef, Inject, Input } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as $ from 'jquery';

//PrimeNg
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { CauHinhHeSoKhuyenKhichModel } from '../../../../../src/app/shared/models/cauHinhHeSoKhuyenKhich.model';
import { CategoryEntityModel, OptionsEntityModel, TrangThaiGeneral } from '../../../../../src/app/product/models/product.model';
import { SystemParameterService } from '../../services/system-parameter.service';
import { CauHinhPhanHangKhModel } from '../../../../../src/app/shared/models/cauHinhPhanHangKh.model';
import * as moment from "moment";
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cau-hinh-he-so-khuyen-khich',
  templateUrl: './cau-hinh-he-so-khuyen-khich.component.html',
  styleUrls: ['./cau-hinh-he-so-khuyen-khich.component.css']
})
export class CauHinhHeSoKhuyenKhichComponent implements OnInit {
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';

  @Input() type: number = 1;

  cauHinhKhuyenKhichForm: FormGroup;
  chucVuControl: FormControl
  loaiNhanVienControl: FormControl
  dichVuControl: FormControl
  loaiThuongControl: FormControl
  giaTriThuongControl: FormControl

  loaiThoiGianControl: FormControl
  chuKyControl: FormControl
  tanSuatControl: FormControl

  tuNgayControl: FormControl
  denNgayControl: FormControl

  dieuKienControl: FormControl
  giaTriTuControl: FormControl
  giaTriDenControl: FormControl


  currentCauHinhKhuyenKhich: CauHinhHeSoKhuyenKhichModel = null;
  dialogCauHinhKhuyenKhich: boolean = false;
  level: number = 0;
  isEditKhuyenKhich: boolean = false;

  loading: boolean = false;


  listKieuThuong: TrangThaiGeneral[] = [];

  listCauHinhHeSoKhuyenKhich: CauHinhHeSoKhuyenKhichModel[] = [];
  listCauHinhHeSoKhuyenKhichTree: TreeNode[] = [];
  listTieuChiApDungKhuyenKhich: TrangThaiGeneral[] = [];
  listLoaiDoiTuong: TrangThaiGeneral[] = [];

  listLoaiApDungCHKH: TrangThaiGeneral[] = [];
  listLoaiThoiGianCHKH: TrangThaiGeneral[] = [];
  listTanSuatCHKH: TrangThaiGeneral[] = [];

  listPosition = [];

  listOption: OptionsEntityModel[] = [];

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
    this.chucVuControl = new FormControl(null);
    this.loaiNhanVienControl = new FormControl(null);

    this.dichVuControl = new FormControl(null);
    this.loaiThuongControl = new FormControl(null);
    this.giaTriThuongControl = new FormControl(null);


    this.loaiThoiGianControl = new FormControl(null);
    this.chuKyControl = new FormControl(null);
    this.tanSuatControl = new FormControl(null);

    this.tuNgayControl = new FormControl(null);
    this.denNgayControl = new FormControl(null);

    this.dieuKienControl = new FormControl(null);
    this.giaTriTuControl = new FormControl(null);
    this.giaTriDenControl = new FormControl(null);

    this.cauHinhKhuyenKhichForm = new FormGroup({
      chucVuControl: this.chucVuControl,
      loaiNhanVienControl: this.loaiNhanVienControl,

      dichVuControl: this.dichVuControl,
      loaiThuongControl: this.loaiThuongControl,

      giaTriThuongControl: this.giaTriThuongControl,
      loaiThoiGianControl: this.loaiThoiGianControl,
      chuKyControl: this.chuKyControl,
      tanSuatControl: this.tanSuatControl,
      tuNgayControl: this.tuNgayControl,
      denNgayControl: this.denNgayControl,

      dieuKienControl: this.dieuKienControl,
      giaTriTuControl: this.giaTriTuControl,
      giaTriDenControl: this.giaTriDenControl,

    });
  }

  changeTab() {
    this.loading = true;
    this.systemParameterService.getDataCauHinhMucThuongTab(this.type == 1 ? 2 : 3).subscribe(response => {
      this.loading = false;

      let result = <any>response;
      if (result.statusCode != 200) {
        this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: result.messageCode });
        return;
      }
      console.log("result", result)

      this.listPosition = result.listPosition;
      this.listKieuThuong = result.listKieuThuong;
      this.listTieuChiApDungKhuyenKhich = result.listTieuChiApDungKhuyenKhich;
      this.listCauHinhHeSoKhuyenKhich = result.listCauHinhHeSoKhuyenKhich;
      this.listLoaiDoiTuong = result.listLoaiDoiTuong;

      this.listLoaiApDungCHKH = result.listLoaiApDungCHKH;
      this.listLoaiThoiGianCHKH = result.listLoaiThoiGianCHKH;
      this.listTanSuatCHKH = result.listTanSuatCHKH;
      this.listOption = result.listOption;

      let listChildren = this.listCauHinhHeSoKhuyenKhich.filter(x => x.parentId == null);
      this.listCauHinhHeSoKhuyenKhichTree = this.mapCauHinhToTree(listChildren);
    });
  }


  saveCauHinhKhuyenKhich() {
    this.loading = true;
    var cauHinh = new CauHinhHeSoKhuyenKhichModel();
    if (this.cauHinhKhuyenKhichForm.invalid) {
      this.cauHinhKhuyenKhichForm.markAllAsTouched();
      this.loading = false;
      return this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Vui lòng nhập đủ các trường thông tin!" });
    }

    cauHinh.id = this.isEditKhuyenKhich ? this.currentCauHinhKhuyenKhich?.id : null;
    cauHinh.chucVuId = this.chucVuControl.value?.value;
    cauHinh.doiTuongApDungId = this.loaiNhanVienControl.value?.value;
    cauHinh.loaiThuongId = this.loaiThuongControl.value?.value;
    cauHinh.type = this.type;
    cauHinh.giaTriThuong = this.giaTriThuongControl.value;
    cauHinh.tuNgay = this.tuNgayControl.value;
    cauHinh.denNgay = this.denNgayControl.value;
    cauHinh.dieuKienId = this.dieuKienControl.value?.value;
    cauHinh.giaTriTu = this.giaTriTuControl.value;
    cauHinh.giaTriDen = this.giaTriDenControl.value;
    cauHinh.parentId = this.level == 1 ? (this.isEditKhuyenKhich ? this.currentCauHinhKhuyenKhich?.parentId : this.currentCauHinhKhuyenKhich?.id) : null;

    //Nếu là thưởng theo % => không quá 100%
    if (cauHinh.loaiThuongId == 1 && cauHinh.giaTriThuong > 100) {
      this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Giá trị không được vượt quá 100%" });
      this.loading = false;
      return;
    }

    if (new Date(cauHinh.tuNgay) > new Date(cauHinh.denNgay)) {
      this.messageService.add({ severity: 'error', summary: 'Thông báo', detail: "Thời gian từ không được lớn hơn thời gian đến" });
      this.loading = false;
      return;
    }

    this.systemParameterService.createUpdateHeSoKhuyenKhich(cauHinh).subscribe(response => {
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
  mapCauHinhToTree(listHeSo: CauHinhHeSoKhuyenKhichModel[]): TreeNode[] {
    let result: Array<TreeNode> = [];
    listHeSo.forEach((item) => {
      let listChildren = this.listCauHinhHeSoKhuyenKhich.filter(x => x.parentId == item?.id);
      let listChildrenNode: Array<TreeNode> = listChildren.length > 0 ? this.mapCauHinhToTree(listChildren) : [];

      let node: TreeNode = { data: item, children: listChildrenNode }
      node.expanded = true;
      result.push(node);
    })
    return result;
  }


  parentCauHinh: CauHinhHeSoKhuyenKhichModel = null;
  addEditCauHinhKhuyenKhich(rowData: CauHinhHeSoKhuyenKhichModel, level: number, isEditKhuyenKhich: boolean) {
    this.cauHinhKhuyenKhichForm.reset();
    this.setForm();

    this.level = level;
    this.isEditKhuyenKhich = isEditKhuyenKhich;
    if (rowData == null) {
      this.currentCauHinhKhuyenKhich = new CauHinhHeSoKhuyenKhichModel();
      rowData = new CauHinhHeSoKhuyenKhichModel();
    } else {
      this.currentCauHinhKhuyenKhich = rowData;
    }

    //Nếu là lv0
    if (level == 0) {
      var listKey = ["chucVuControl", "loaiNhanVienControl", "tuNgayControl", "denNgayControl", "loaiThuongControl", "giaTriThuongControl"];
      listKey.forEach(item => {
        this.cauHinhKhuyenKhichForm.get(item).setValidators([Validators.required]);
        this.cauHinhKhuyenKhichForm.get(item).updateValueAndValidity();
      });

      this.chucVuControl.setValue(this.listPosition.find(x => x.value == rowData.chucVuId));
      this.loaiNhanVienControl.setValue(this.listLoaiDoiTuong.find(x => x.value == rowData.doiTuongApDungId));
      this.loaiThuongControl.setValue(this.listKieuThuong.find(x => x.value == rowData.loaiThuongId));
      this.giaTriThuongControl.setValue(rowData.giaTriThuong);

      if (rowData.tuNgay) this.tuNgayControl.setValue(new Date(rowData.tuNgay))
      if (rowData.denNgay) this.denNgayControl.setValue(new Date(rowData.denNgay))
    }
    //Nếu là lv1
    else {
      this.parentCauHinh = this.listCauHinhHeSoKhuyenKhich.find(x => x.id == rowData.parentId || (this.isEditKhuyenKhich == false && x.id == rowData.id));
      var listKey = ["dieuKienControl", "giaTriTuControl", "giaTriDenControl"];
      listKey.forEach(item => {
        this.cauHinhKhuyenKhichForm.get(item).setValidators([Validators.required]);
        this.cauHinhKhuyenKhichForm.get(item).updateValueAndValidity();
        this.cauHinhKhuyenKhichForm.get(item).setValue(null);
      });

      this.dieuKienControl.setValue(this.listTieuChiApDungKhuyenKhich.find(x => x.value == rowData.dieuKienId))
      this.giaTriTuControl.setValue(rowData.giaTriTu);
      this.giaTriDenControl.setValue(rowData.giaTriDen);
    }
    this.dialogCauHinhKhuyenKhich = true;
  }

  deleteCauHinhKhuyenKhich(rowData: CauHinhHeSoKhuyenKhichModel) {
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa?',
      accept: () => {
        this.loading = true;
        this.systemParameterService.deleteCauHinhHeSoKhuyenKhich(rowData).subscribe(response => {
          this.loading = false;
          let result = <any>response;
          if (result.statusCode == 200) {
            this.listCauHinhHeSoKhuyenKhichTree = [];
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
    this.cauHinhKhuyenKhichForm.markAsUntouched();
    this.cauHinhKhuyenKhichForm.reset();
    this.dialogCauHinhKhuyenKhich = false;
    this.currentCauHinhKhuyenKhich = null;
    this.parentCauHinh = null;
    this.level = 0;
  }

  updateFormcomtrol(listKey, isRequired) {
    listKey.forEach(item => {
      if (isRequired) {
        this.cauHinhKhuyenKhichForm.get(item).setValidators([Validators.required]);
      } else {
        this.cauHinhKhuyenKhichForm.get(item).setValidators([]);
      }
      this.cauHinhKhuyenKhichForm.get(item).updateValueAndValidity();
      this.cauHinhKhuyenKhichForm.get(item).setValue(null);
      this.cauHinhKhuyenKhichForm.get(item).markAsUntouched();
    });
  }


  generateMucApDungCol(rowData: CauHinhHeSoKhuyenKhichModel): string {
    let value = "";
    let end = " - Mức hưởng: " + (rowData.loaiThuongId == 1 ? ((rowData.giaTriThuong) + "% tổng doanh thu") : (" " + this.decimalPipe.transform(rowData.giaTriThuong, '1.0-0')));
    value = "Từ ngày " + moment(new Date(rowData.tuNgay)).format("DD/MM/YYYY") + " đến " + moment(new Date(rowData.denNgay)).format("DD/MM/YYYY") + end;
    return value;
  }

}
