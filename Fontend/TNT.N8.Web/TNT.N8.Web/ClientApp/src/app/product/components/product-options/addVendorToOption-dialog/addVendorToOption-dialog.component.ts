import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

//PrimeNg
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { VendorMappingOption } from '../../../../../../src/app/shared/models/VendorMappingOption.model';
import { ListVendorService } from '../service/list-vendor.service';
import { CategoryEntityModel } from '../../../../../../src/app/product/models/product.model';
import { CauHinhMucHoaHong } from '../../../../../../src/app/shared/models/cauHinhHoaHong.model';

export interface IDialogData {
  selectedCategoryId: string;
  selectedCategoryName: string;
  selectedCategoryCode: string;
  sortOrder: number;
  selectedCategoryType: string;
  selectedCategoryTypeId: string;
  categoryCreated: boolean;
  categoryCreatedId: string;
  categoryEdited: boolean;
  mode: string;
  message: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-addVendorToOption-dialog',
  templateUrl: './addVendorToOption-dialog.component.html',
  styleUrls: ['./addVendorToOption-dialog.component.css']
})
export class AddVendorToOptionDialogComponent implements OnInit {
  listVendor = [];
  listKieuThanhToan = [];

  disabledPopup: boolean = false;

  //Form cho thanh toán trước
  vendorAddForm: FormGroup;
  vendorControl: FormControl = new FormControl(null, [Validators.required]);
  soLuongToiThieuControl: FormControl = new FormControl(1);

  thoiGianTuControl: FormControl = new FormControl(null, [Validators.required]);
  thoiGianDenControl: FormControl = new FormControl(null, [Validators.required]);

  donGiaControl: FormControl = new FormControl(null,);
  donViTienControl: FormControl = new FormControl(null);
  thueGtgtControl: FormControl = new FormControl(null);
  loaiChietKhauControl: FormControl = new FormControl(null);
  giaTriChietKhauControl: FormControl = new FormControl(null);
  yeuCauThanhToanControl: FormControl = new FormControl(null);
  giaTriThanhToanControl: FormControl = new FormControl(null);


  //Form cho cấu hình hoa hồng
  cauHinhHoaHongForm: FormGroup;
  loaiHoaHongControl: FormControl = new FormControl(null);
  giaTriHoaHongControl: FormControl = new FormControl(null);

  dieuKienControl: FormControl = new FormControl(null);
  giaTriTuControl: FormControl = new FormControl(null);
  giaTriDenControl: FormControl = new FormControl(null);


  isView: boolean = false;

  data: any = null;
  optionId = null;
  isEdit: boolean = false;

  loading: boolean = false;

  thanhToanTruoc: boolean = false;

  listDonViTien: CategoryEntityModel[] = [];
  listDieuKienHoaHong: CategoryEntityModel[] = [];

  listCauHinhHoaHong: CauHinhMucHoaHong[] = [];

  listCauHinhHoaHongTree: TreeNode[] = [];


  constructor(
    private el: ElementRef,
    private messageService: MessageService,
    private translate: TranslateService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private vendorService: ListVendorService,
    private confirmationService: ConfirmationService,

  ) {
    this.translate.setDefaultLang('vi');
    this.listVendor = this.config.data.vendorList;
    this.listKieuThanhToan = this.config.data.listKieuThanhToan;
    this.data = this.config.data.data;
    this.isEdit = this.config.data.isEdit;
    this.optionId = this.config.data.optionId;
    this.thanhToanTruoc = this.config.data.thanhToanTruoc;
    this.listDonViTien = this.config.data.listDonViTien;
    this.listCauHinhHoaHong = this.config.data.listCauHinhHoaHong;
    this.listDieuKienHoaHong = this.config.data.listDieuKienHoaHong;
    this.isView = this.config.data.isView;
  }

  ngOnInit() {
    this.initForm();
    this.setData();
  }

  initForm() {
    if (this.thanhToanTruoc) {
      this.donGiaControl = new FormControl(null, [Validators.required]);
      this.donViTienControl = new FormControl(null, [Validators.required]);
      this.thueGtgtControl = new FormControl(null, [Validators.required]);
      this.loaiChietKhauControl = new FormControl(null, [Validators.required]);
      this.giaTriChietKhauControl = new FormControl(null, [Validators.required]);
      this.yeuCauThanhToanControl = new FormControl(null, [Validators.required]);
      this.giaTriThanhToanControl = new FormControl(null, [Validators.required]);
    }

    this.vendorAddForm = new FormGroup({
      vendorControl: this.vendorControl,
      soLuongToiThieuControl: this.soLuongToiThieuControl,
      thoiGianTuControl: this.thoiGianTuControl,
      thoiGianDenControl: this.thoiGianDenControl,
      donGiaControl: this.donGiaControl,
      donViTienControl: this.donViTienControl,
      thueGtgtControl: this.thueGtgtControl,
      loaiChietKhauControl: this.loaiChietKhauControl,
      giaTriChietKhauControl: this.giaTriChietKhauControl,
      yeuCauThanhToanControl: this.yeuCauThanhToanControl,
      giaTriThanhToanControl: this.giaTriThanhToanControl,

    });

    this.cauHinhHoaHongForm = new FormGroup({
      loaiHoaHongControl: this.loaiHoaHongControl,
      giaTriHoaHongControl: this.giaTriHoaHongControl,
      dieuKienControl: this.dieuKienControl,
      giaTriTuControl: this.giaTriTuControl,
      giaTriDenControl: this.giaTriDenControl,
    });
  }

  setData() {
    if (this.listCauHinhHoaHong) this.listCauHinhHoaHongTree = this.mapCauHinhToTree(1);

    if (this.isEdit) {
      let vendor = this.listVendor.find(x => x.vendorId == this.data?.vendorId);
      this.vendorControl.setValue(vendor);
      this.soLuongToiThieuControl.setValue(1);
      this.thoiGianTuControl.setValue(new Date(this.data?.thoiGianTu));
      this.thoiGianDenControl.setValue(new Date(this.data?.thoiGianDen));

      this.donGiaControl.setValue(this.data?.price);
      this.donViTienControl.setValue(this.listDonViTien.find(x => x.categoryId == this.data?.donViTienId));
      this.thueGtgtControl.setValue(this.data?.thueGtgt);
      this.loaiChietKhauControl.setValue(this.listKieuThanhToan.find(x => x.value == this.data?.chietKhauId));
      this.giaTriChietKhauControl.setValue(this.data?.giaTriChietKhau);
      this.yeuCauThanhToanControl.setValue(this.listKieuThanhToan.find(x => x.value == this.data?.yeuCauThanhToan));
      this.giaTriThanhToanControl.setValue(this.data?.giaTriThanhToan);

      if (this.isView) this.vendorAddForm.disable();
    } else {
      this.yeuCauThanhToanControl.setValue(this.listKieuThanhToan[0]);
    }
  }

  // mapBy == 1: id;
  // mapBy == 2: index;
  mapCauHinhToTree(mapBy: number): TreeNode[] {

    let indexItem = 0;
    let result: Array<TreeNode> = [];
    let listChildren = mapBy == 1 ? this.listCauHinhHoaHong.filter(x => x.parentId == null) : this.listCauHinhHoaHong.filter(x => x.indexParent == null);
    listChildren.forEach((item) => {
      item.indexParent = null;
      const oldIndex = item.index;
      item.index = indexItem;
      indexItem++;

      let listChildrenNode: Array<TreeNode> = [];
      let listChildren1 = mapBy == 1 ? this.listCauHinhHoaHong.filter(x => x.parentId == item?.id) : this.listCauHinhHoaHong.filter(x => x.indexParent == oldIndex);
      listChildren1.forEach(item1 => {
        item1.indexParent = item.index;
        item1.index = indexItem;
        indexItem++;

        let node: TreeNode = { data: item1 }
        node.expanded = true;
        listChildrenNode.push(node);
      });

      let node: TreeNode = { data: item, children: listChildrenNode }
      node.expanded = true;
      result.push(node);
    })
    return result;
  }

  currentCauHinhHoaHong: CauHinhMucHoaHong = null;
  dialogCauHinhHoaHong: boolean = false;
  isAddCauHinhHoaHong: boolean = false;
  isEditCauHinh: boolean = false;

  listDieuKienThanhToan: CategoryEntityModel[] = [];
  addEditCauHinhHoaHong(rowData: CauHinhMucHoaHong, isAddCauHinhHoaHong: boolean, isEditCauHinh: boolean) {
    this.isAddCauHinhHoaHong = isAddCauHinhHoaHong;
    this.currentCauHinhHoaHong = rowData;
    this.isEditCauHinh = isEditCauHinh;

    //Nếu là level 0
    if (this.currentCauHinhHoaHong == null || (this.currentCauHinhHoaHong?.indexParent == null && this.isAddCauHinhHoaHong)) {
      this.updateCauHinhHoaHongForm(0);
      if (rowData?.loaiHoaHong) this.loaiHoaHongControl.setValue(this.listKieuThanhToan.find(x => x.value == rowData?.loaiHoaHong));
      if (rowData?.giaTriHoaHong) this.giaTriHoaHongControl.setValue(rowData?.giaTriHoaHong);
    }
    //Nếu là level 1
    else {
      debugger
      this.updateCauHinhHoaHongForm(1);
      if (rowData?.dieuKienId) this.dieuKienControl.setValue(this.listDieuKienHoaHong.find(x => x.categoryId == rowData?.dieuKienId));
      if (rowData?.giaTriTu >= 0) this.giaTriTuControl.setValue(rowData?.giaTriTu);
      if (rowData?.giaTriDen) this.giaTriDenControl.setValue(rowData?.giaTriDen);
    }
    this.dialogCauHinhHoaHong = true;
    this.disabledPopup = true;
    this.vendorAddForm.disable();
  }

  updateCauHinhHoaHongForm(level: number) {
    if (level == 0) {
      this.loaiHoaHongControl.setValidators([Validators.required]);
      this.giaTriHoaHongControl.setValidators([Validators.required]);
      this.dieuKienControl.setValidators([]);
      this.giaTriTuControl.setValidators([]);
      this.giaTriDenControl.setValidators([]);
    } else {
      this.loaiHoaHongControl.setValidators([]);
      this.giaTriHoaHongControl.setValidators([]);
      this.dieuKienControl.setValidators([Validators.required]);
      this.giaTriTuControl.setValidators([Validators.required]);
      this.giaTriDenControl.setValidators([]);
    }

    this.loaiHoaHongControl.updateValueAndValidity();
    this.giaTriHoaHongControl.updateValueAndValidity();
    this.dieuKienControl.updateValueAndValidity();
    this.giaTriTuControl.updateValueAndValidity();
    this.giaTriDenControl.updateValueAndValidity();
  }

  closeCauHinhHoaHong() {
    this.dialogCauHinhHoaHong = false;
    this.currentCauHinhHoaHong = null;
    this.isAddCauHinhHoaHong = false;
    this.cauHinhHoaHongForm.markAsUntouched();
    this.cauHinhHoaHongForm.reset();
    this.disabledPopup = false;
    this.vendorAddForm.enable();
  }

  async saveCauHinhHoaHong() {
    this.cauHinhHoaHongForm.markAllAsTouched();
    if (!this.cauHinhHoaHongForm.valid) return this.showToast('error', 'Thông báo', "Vui lòng nhập đầy đủ thông tin!");

    //Nếu là thêm cấu hình hoa hồng
    if (this.isAddCauHinhHoaHong == true && this.loaiHoaHongControl.value?.value == 1 && this.giaTriHoaHongControl.value > 100) return this.showToast('error', 'Thông báo', "Giá trị hoa hồng không được vượt quá 100%!");

    //nếu là thêm điều kiện của hoa hồng
    if (this.isAddCauHinhHoaHong == false) {
      if (this.giaTriDenControl.value && this.giaTriDenControl.value < this.giaTriTuControl.value) return this.showToast('error', 'Thông báo', "Giá trị từ không được lớn hơn giá trị đến!");

      //Kiểm tra xem điều kiện đã tồn tại theo mức hoa hồng đó chưa, Nếu là chỉnh sửa lv1
      if (this.currentCauHinhHoaHong?.index != null) {
        let listDieuKien = this.listCauHinhHoaHong.filter(x =>
          (
            (this.isEditCauHinh && x.indexParent == this.currentCauHinhHoaHong?.indexParent && x.index != this.currentCauHinhHoaHong?.index) ||
            (!this.isEditCauHinh && x.indexParent == this.currentCauHinhHoaHong?.index)
          ) && x.dieuKienId == this.dieuKienControl.value?.categoryId);

        //Nếu là thêm mới và tồn tại điều kiện hoặc là chỉnh sửa trùng với 
        if (listDieuKien.length > 0) return this.showToast('error', 'Thông báo', "Điều kiện tính hoa hồng đã tồn tại!");
      }
    }

    await this.setDataUpdateCreateCauHinhHoaHong();
    this.listCauHinhHoaHongTree = this.mapCauHinhToTree(2)
    this.closeCauHinhHoaHong();
  }

  async setDataUpdateCreateCauHinhHoaHong() {
    //Nếu là thêm mới điều kiện hoặc thêm mới hoa hồng
    if (!this.isEditCauHinh) {
      var cauHinh = new CauHinhMucHoaHong();
      cauHinh.index = Math.max(...this.listCauHinhHoaHong.map(o => o.index)) + 1;
      cauHinh.loaiHoaHong = this.loaiHoaHongControl.value?.value;
      cauHinh.giaTriHoaHong = this.giaTriHoaHongControl.value;
      cauHinh.dieuKienId = this.dieuKienControl.value?.categoryId;
      cauHinh.dieuKienName = this.dieuKienControl.value?.categoryName;
      cauHinh.giaTriTu = this.giaTriTuControl.value;
      cauHinh.giaTriDen = this.giaTriDenControl.value;
      cauHinh.indexParent = this.currentCauHinhHoaHong?.index;
      this.listCauHinhHoaHong.push(cauHinh);
    } else {
      let cauHinh = this.listCauHinhHoaHong.find(x => x.index == this.currentCauHinhHoaHong.index);
      cauHinh.loaiHoaHong = this.loaiHoaHongControl.value?.value;
      cauHinh.giaTriHoaHong = this.giaTriHoaHongControl.value;
      cauHinh.dieuKienId = this.dieuKienControl.value?.categoryId;
      cauHinh.dieuKienName = this.dieuKienControl.value?.categoryName;
      cauHinh.giaTriTu = this.giaTriTuControl.value;
      cauHinh.giaTriDen = this.giaTriDenControl.value;
    }
  }

  delCauHinhHoaHong(rowData: CauHinhMucHoaHong) {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn xóa dòng này?`,
      accept: async () => {
        this.listCauHinhHoaHong = this.listCauHinhHoaHong.filter(x => x.index != rowData.index && x.indexParent != rowData.index);
        this.listCauHinhHoaHongTree = this.mapCauHinhToTree(2)
      }
    });


  }

  async onSaveClick() {
    if (!this.vendorAddForm.valid) {
      Object.keys(this.vendorAddForm.controls).forEach(key => {
        if (this.vendorAddForm.controls[key].valid == false) {
          this.vendorAddForm.controls[key].markAsTouched();
        }
      });
      this.showToast('error', 'Thông báo', "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    var vendorMappingOption = new VendorMappingOption();
    vendorMappingOption.id = this.data?.id;
    vendorMappingOption.optionId = this.optionId;
    vendorMappingOption.vendorId = this.vendorControl.value.vendorId;
    vendorMappingOption.price = this.donGiaControl.value;
    vendorMappingOption.soLuongToiThieu = 1;
    vendorMappingOption.thoiGianTu = convertToUTCTime(this.thoiGianTuControl.value);
    vendorMappingOption.thoiGianDen = convertToUTCTime(this.thoiGianDenControl.value);


    //Có trả trước
    vendorMappingOption.donViTienId = this.donViTienControl.value?.categoryId;
    vendorMappingOption.thueGtgt = this.thueGtgtControl.value;
    vendorMappingOption.chietKhauId = this.loaiChietKhauControl.value?.value;
    vendorMappingOption.giaTriChietKhau = this.giaTriChietKhauControl.value;
    vendorMappingOption.yeuCauThanhToan = this.yeuCauThanhToanControl.value?.value;
    vendorMappingOption.giaTriThanhToan = this.giaTriThanhToanControl.value;

    if (vendorMappingOption.chietKhauId == 1 && vendorMappingOption.giaTriChietKhau > 100) return this.showToast('warn', 'Thông báo', 'Giá trị chiết khấu % không được lớn hơn 100');
    if (vendorMappingOption.yeuCauThanhToan == 1 && vendorMappingOption.giaTriThanhToan > 100) return this.showToast('warn', 'Thông báo', 'Giá trị thanh toán % không được lớn hơn 100');

    if (vendorMappingOption.thoiGianTu > vendorMappingOption.thoiGianDen) return this.showToast('warn', 'Thông báo', 'Thời gian bắt đầu không được lớn hơn thời gian kết thúc');
    this.loading = true;
    let result: any = await this.vendorService.addVendorToOption(vendorMappingOption, this.optionId, this.thanhToanTruoc, this.listCauHinhHoaHong);
    this.loading = false;
    if (result.statusCode != 200) {
      this.showToast('error', 'Thông báo', result.messageCode);
      return;
    }

    this.showToast('success', 'Thông báo', result.messageCode);
    this.ref.close(true);
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }


  onCancelClick() {
    this.ref.close(false);
  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};