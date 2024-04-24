import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';
import { VendorOrderModel } from '../../models/vendorOrder.model';
import { VendorOrderDetailModel } from '../../models/vendorOrderDetail.model';
import { VendorService } from "../../services/vendor.service";
import { GetPermission } from '../../../shared/permission/get-permission';

import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { TranslateService } from '@ngx-translate/core';
import { ImageUploadService } from '../../../shared/services/imageupload.service';
import { NoteService } from '../../../shared/services/note.service';
import { ForderConfigurationService } from '../../../admin/components/folder-configuration/services/folder-configuration.service';
import { FileInFolder, FileUploadModel } from '../../../../../src/app/employee/models/kehoach-ot.model';
import { BaseType } from '../../../../../src/app/shared/models/baseType.model';
import { FileUpload } from 'primeng';
import { VendorOrderDetailAtrModel } from '../../models/VendorOrderDetailAtr.model';

class DiscountType {
  name: string;
  code: string;
  value: boolean;
}

class paymentMethod {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
}


@Component({
  selector: 'app-detail-vendor-order',
  templateUrl: './detail-vendor-order.component.html',
  styleUrls: ['./detail-vendor-order.component.css'],
  providers: [ConfirmationService, MessageService, DialogService]
})
export class DetailVendorOrderComponent implements OnInit {
  loading: boolean = false;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  userPermission: any = localStorage.getItem("UserPermission").split(',');

  colsThanhToan = [
    { field: 'maPhieu', header: 'Mã phiếu', width: '120px', textAlign: 'left', color: '#f44336' },
    { field: 'noiDung', header: 'Nội dung', width: '240px', textAlign: 'left', color: '#f44336' },
    { field: 'soTienThuChi', header: 'Số tiền thu chi', width: '90px', textAlign: 'right', color: '#f44336' },
    { field: 'ngayTao', header: 'Ngày tạo', width: '90px', textAlign: 'center', color: '#f44336' },
  ];
  listThongTinThanhToan = [];

  cols = []
  listVendorOrderDetail: Array<VendorOrderDetailModel> = [];

  listVendorOrderDetailAttr: Array<VendorOrderDetailAtrModel> = [];

  file: File[];
  listFile: Array<FileInFolder> = [];
  colsFile = [
    { field: 'fileName', header: 'Tên tài liệu', width: '25%', textAlign: 'left', type: 'string' },
    { field: 'size', header: 'Kích thước', width: '25%', textAlign: 'right', type: 'number' },
    { field: 'createdDate', header: 'Ngày tạo', width: '25%', textAlign: 'right', type: 'date' },
    { field: 'uploadByName', header: 'Người Upload', width: '25%', textAlign: 'left', type: 'string' },
  ];

  defaultLimitedFileSize = Number(this.systemParameterList.find(x => x.systemKey == "LimitedFileSize").systemValueString) * 1024 * 1024;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  strAcceptFile: string = 'image video audio .zip .rar .pdf .xls .xlsx .doc .docx .ppt .pptx .txt';
  uploadedFiles: any[] = [];


  //permission
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  actionSendApprove: boolean = true;
  actionApprove: boolean = true;
  actionReject: boolean = true;

  auth: any = JSON.parse(localStorage.getItem("auth"));
  fixed: boolean = false;
  withFiexd: string = "";
  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $('#parent').width();
      this.withFiexd = width + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
    }
  }

  vendorOrder: VendorOrderModel = new VendorOrderModel();

  //master data
  listPaymentMethod: Array<paymentMethod> = [];
  listKieuThuong: Array<BaseType> = [];
  refreshNote: number = 0;
  isShowThanhToan: boolean = true;


  totalAmountBeforeVat: number = 0; //tổng thành tiền trước thuế
  totalAmountVat: number = 0; //Tổng tiền thuế
  totalAmountCost: number = 0; //Tổng tiền chi phí mua hàng
  totalAmountBeforeDiscount: number = 0;
  totalAmountAferDiscount: number = 0; //tổng tiền sau khi trừ chiết khấu
  discountPerOrder: number = 0; //chiết khấu theo đơn hàng
  dataRow: VendorOrderDetailModel = null;

  tongTienCanThanhToanTruoc: number = 0;

  TotalPayment: number = 0; // tổng tiền đã thanh toán
  TotalPaymentLeft: number = 0; // Tổng tiền còn phải thanh toán

  tongTienDoanhThu: number = 0;
  tongTienHoaHong: number = 0;

  vendorOrderId: string = this.emptyGuid;

  //hiển thị tổng kết giá
  isShow: boolean = true;
  colLeft: number = 9;
  colRight: number = 3;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private getPermission: GetPermission,
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private renderer: Renderer2,
    private imageService: ImageUploadService,
    private noteService: NoteService,
    private folderService: ForderConfigurationService,
    private forderConfigurationService: ForderConfigurationService,
  ) { }

  async ngOnInit() {
    let resource = "buy/vendor/detail-order/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      if (listCurrentActionResource.indexOf("send_approve") == -1) {
        this.actionSendApprove = false;
      }
      if (listCurrentActionResource.indexOf("approve") == -1) {
        this.actionApprove = false;
      }
      if (listCurrentActionResource.indexOf("reject") == -1) {
        this.actionReject = false;
      }
      if (listCurrentActionResource.indexOf("payment") == -1) {
      }
      this.route.params.subscribe(params => { this.vendorOrderId = params['vendorOrderId'] });
      this.getMasterData();
    }
  }

  resetTable() {
    this.listVendorOrderDetail = [];
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }


  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  close() {
    this.confirmationService.confirm({
      message: `Các thay đổi sẽ không được lưu lại. Hành động này không thể được hoàn tác, bạn có chắc chắn muốn huỷ?`,
      accept: () => {
        setTimeout(() => {
          this.router.navigate(['vendor/list-order']);
        }, 500);
      }
    });
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }


  async getMasterData() {
    debugger
    this.loading = true;
    let result: any = await this.vendorService.getVendorOrderByIdAsync(this.vendorOrderId, this.auth.UserId);
    this.loading = false;
    console.log("result", result)

    if (result.statusCode == 200) {
      this.listKieuThuong = result.listKieuThuong;
      this.vendorOrder = result.vendorOrder;
      this.listVendorOrderDetail = result.listVendorOrderDetail;
      this.listVendorOrderDetailAttr = result.listVendorOrderDetailAttr;

      this.listPaymentMethod = result.listPaymentMethod.filter(x => x.categoryCode == "CK" || x.categoryCode == "TM");
      this.listFile = result.listFile;

      this.listThongTinThanhToan = result.listThongTinThanhToan;
      this.vendorOrder.phuongThucThanhToan = this.listPaymentMethod.find(x => x.categoryId == this.vendorOrder.paymentMethodId);
      if (this.vendorOrder.discountType) this.vendorOrder.discountObject = this.listKieuThuong.find(x => x.value == this.vendorOrder.discountType);
      if (this.vendorOrder.paymentMethodId) this.vendorOrder.phuongThucThanhToan = this.listPaymentMethod.find(x => x.categoryId == this.vendorOrder.paymentMethodId);

      this.TotalPayment = result.tongDaTra;
      this.isShowThanhToan = result.isShowThanhToan;

      this.tinhTien();
      this.setCol();
    } else {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }


  setCol() {
    if (this.vendorOrder?.vendorOrderType == 1) {
      this.cols = [
        { field: 'tenDichVu', header: 'Tên dịch vụ', width: '140px', textAlign: 'left', color: '#f44336' },
        { field: 'thongTinChiTiet', header: 'Thông tin chi tiết yêu cầu', width: '240px', textAlign: 'left', color: '#f44336' },
        { field: 'quantity', header: 'Số lượng', width: '90px', textAlign: 'center', color: '#f44336' },
        { field: 'donViTien', header: 'Đơn vị tiền', width: '90px', textAlign: 'center', color: '#f44336' },
        { field: 'price', header: 'Đơn giá', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'thueGtgt', header: 'Thuế VAT(%)', width: '90px', textAlign: 'center', color: '#f44336' },
        { field: 'giaTriChietKhau', header: 'Chiết khấu', width: '90px', textAlign: 'center', color: '#f44336' },
        { field: 'thanhTienSauThue', header: 'Thành tiền sau thuế', width: '120px', textAlign: 'right', color: '#f44336' },
        { field: 'yeuCauThanhToan', header: 'Thanh toán trước', width: '120px', textAlign: 'right', color: '#f44336' }
      ];
    } else {
      this.cols = [
        { field: 'tenDichVu', header: 'Tên dịch vụ', width: '140px', textAlign: 'left', color: '#f44336' },
        { field: 'thongTinChiTiet', header: 'Thông tin chi tiết yêu cầu', width: '260px', textAlign: 'left', color: '#f44336' },
        { field: 'quantity', header: 'Số lượng', width: '90px', textAlign: 'center', color: '#f44336' },
        { field: 'tongTienHoaHong', header: 'Tổng tiền hoa hồng', width: '90px', textAlign: 'center', color: '#f44336' },
        { field: 'ghiChu', header: 'Ghi chú', width: '160px', textAlign: 'right', color: '#f44336' },
        { field: 'thaoTac', header: 'Thao tác', width: '60px', textAlign: 'center', color: '#f44336' },
      ];
    }
  }

  tinhTien(): void {
    this.totalAmountBeforeVat = 0;
    this.totalAmountVat = 0;
    this.totalAmountCost = 0;
    this.totalAmountBeforeDiscount = 0;
    this.totalAmountAferDiscount = 0;
    this.discountPerOrder = 0;
    this.tongTienCanThanhToanTruoc = 0;
    this.TotalPaymentLeft = 0;

    this.tongTienDoanhThu = 0;
    this.tongTienHoaHong = 0;

    this.listVendorOrderDetail?.forEach(item => {
      //Nếu đơn hàng KTTN mua
      if (this.vendorOrder.vendorOrderType == 1) {
        let tongTien = item.quantity * item.price;
        let tienChietKhau = item.chietKhauId == 1 ? (tongTien * item.giaTriChietKhau / 100) : item.giaTriChietKhau;
        let tongTienSauChietKhau = tongTien - tienChietKhau;
        let tienThue = tongTienSauChietKhau * item.thueGtgt / 100;

        this.totalAmountBeforeVat += tongTienSauChietKhau;
        this.totalAmountVat += tienThue;

        let tienThanhToanTruoc = item.yeuCauThanhToan == 1 ? ((tongTienSauChietKhau + tienThue) * item.giaTriThanhToan / 100) : item.giaTriThanhToan;
        this.tongTienCanThanhToanTruoc += tienThanhToanTruoc;
      }
      //Nếu đơn hàng KH thanh toán
      else {
        this.tongTienHoaHong += item.tongTienHoaHong;
        this.tongTienDoanhThu += item.tongTienKhachHangThanhToan;
      }

    });

    if (this.vendorOrder.vendorOrderType == 1) {
      //Tính chiết khấu đơn hàng
      if (this.vendorOrder.discountType && this.vendorOrder.discountValue) {
        this.discountPerOrder = this.vendorOrder.discountType == 1 ? (this.vendorOrder.discountValue * this.totalAmountCost / 100) : this.vendorOrder.discountValue;
      }
      this.totalAmountCost = this.totalAmountBeforeVat + this.totalAmountVat - this.discountPerOrder;
      this.TotalPaymentLeft = this.totalAmountCost - this.TotalPayment;
    } else {
      this.TotalPaymentLeft = this.tongTienHoaHong - this.TotalPayment;
    }
  }


  xemChiTietPhieu(rowData) {
    let url;
    //Nếu là chi, ủy nhiệm chi
    if (this.vendorOrder.vendorOrderType == 1) {
      //Nếu là chuyển khoản
      if (this.vendorOrder.phuongThucThanhToan?.categoryCode == "CK") {
        url = this.router.serializeUrl(this.router.createUrlTree(['/accounting/bank-payments-detail', { id: rowData.phieuId }]));
      }
      //Nếu là tiền mặt
      else if (this.vendorOrder.phuongThucThanhToan?.categoryCode == "TM") {
        url = this.router.serializeUrl(this.router.createUrlTree(['/accounting/cash-payments-view', { payableInvoiceId: rowData.phieuId }]));
      }
    }
    //Nếu là thu/ báo có
    else if (this.vendorOrder.vendorOrderType == 2) {
      //Nếu là chuyển khoản
      if (this.vendorOrder.phuongThucThanhToan?.categoryCode == "CK") {
        url = this.router.serializeUrl(this.router.createUrlTree(['/accounting/bank-receipts-detail', { id: rowData.phieuId }]));
      }
      //Nếu là tiền mặt
      else if (this.vendorOrder.phuongThucThanhToan?.categoryCode == "TM") {
        url = this.router.serializeUrl(this.router.createUrlTree(['/accounting/cash-receipts-view', { receiptInvoiceId: rowData.phieuId }]));
      }
    }
    window.open(url, '_blank');
  }


  invalidValidate: boolean = false;
  async save() {
    debugger
    this.invalidValidate = false;
    if (((!this.vendorOrder.discountObject || (this.vendorOrder.discountValue < 0)) && this.vendorOrder.vendorOrderType == 1) || !this.vendorOrder.phuongThucThanhToan) {
      this.invalidValidate = true;
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng nhập đầy đủ thông tin!" };
      this.showMessage(msg);
      return;
    }

    let vendorOrderId = this.vendorOrderId;
    let discountType = this.vendorOrder.discountObject?.value;
    let discountValue = this.vendorOrder.discountValue;
    let paymentMethodId = this.vendorOrder.phuongThucThanhToan?.categoryId;
    let note = this.vendorOrder.note;
    let userId = this.auth.UserId;

    this.loading = true;
    let result: any = await this.vendorService.updateVendorOrder(vendorOrderId, discountType, discountValue, paymentMethodId, note, userId);
    this.loading = false;
    console.log("result", result)
    if (result.statusCode == 200) {
      let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
      this.showMessage(msg);
      this.invalidValidate = false;
      this.getMasterData();
    } else {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }

  showTotal() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 9 : 12;
    this.colRight = this.isShow ? 3 : 0;

    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }


  async thanhToan() {
    await this.save();
    if (!this.vendorOrder.phuongThucThanhToan) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng chọn hình thức thanh toán!" };
      this.showMessage(msg);
    }

    //Nếu là KTTN thanh toán
    if (this.vendorOrder.vendorOrderType == 1) {
      //Nếu là tiền mặt => tạo phiếu chi
      if (this.vendorOrder.phuongThucThanhToan?.categoryCode == "TM") {
        this.router.navigate(['/accounting/cash-payments-create', { vendorOrderId: this.vendorOrderId }]);
      }
      //Nếu là chuyển khoản => tạo phiếu ủy nhiệm chi
      else if (this.vendorOrder.phuongThucThanhToan?.categoryCode == "CK") {
        this.router.navigate(['/accounting/bank-payments-create', { vendorOrderId: this.vendorOrderId }]);
      }
    }
    //nếu là Ncc thanh toán
    else if (this.vendorOrder.vendorOrderType == 2) {
      //Nếu là tiền mặt => tạo phiếu thu
      if (this.vendorOrder.phuongThucThanhToan?.categoryCode == "TM") {
        this.router.navigate(['/accounting/cash-receipts-create', { vendorOrderId: this.vendorOrderId, vendorId: this.vendorOrder.vendorId, type: 2 }])

      }
      //Nếu là chuyển khoản => tạo phiếu báo có
      else if (this.vendorOrder.phuongThucThanhToan?.categoryCode == "CK") {
        this.router.navigate(['/accounting/bank-receipts-create', { vendorOrderId: this.vendorOrderId, vendorId: this.vendorOrder.vendorId, type: 2 }])

      }
    }
  }

  showDialogAtr: boolean = false;
  listVendorOrderDetailAttrRow: Array<VendorOrderDetailAtrModel> = [];
  currentVendorOrderDetail: VendorOrderDetailModel = null;
  showDetailOrder(rowData: VendorOrderDetailModel) {
    debugger
    this.currentVendorOrderDetail = rowData;
    this.listVendorOrderDetailAttrRow = this.listVendorOrderDetailAttr.filter(x => x.orderDetailId == rowData.orderDetailId);
    this.showDialogAtr = true;
  }

  closeDialogAtr() {
    this.currentVendorOrderDetail = null;
    this.listVendorOrderDetailAttrRow = [];
    this.showDialogAtr = false;
  }


  //Xử lý file 

  /*Event Lưu các file được chọn*/
  handleFile(event, uploader: FileUpload) {
    for (let file of event.files) {
      let size: number = file.size;
      let type: string = file.type;

      if (size <= this.defaultLimitedFileSize) {
        if (type.indexOf('/') != -1) {
          type = type.slice(0, type.indexOf('/'));
        }
        if (this.strAcceptFile.includes(type) && type != "") {
          this.uploadedFiles.push(file);
        } else {
          let subType = file.name.slice(file.name.lastIndexOf('.'));
          if (this.strAcceptFile.includes(subType)) {
            this.uploadedFiles.push(file);
          }
        }
      }
    }
  }

  /*Event Khi click xóa từng file*/
  removeFile(event) {
    let index = this.uploadedFiles.indexOf(event.file);
    this.uploadedFiles.splice(index, 1);
  }

  /*Event Khi click xóa toàn bộ file*/
  clearAllFile() {
    this.uploadedFiles = [];
  }

  /*Event upload list file*/
  myUploader(event: any) {
    let listFileUploadModel: Array<FileUploadModel> = [];
    this.uploadedFiles.forEach(item => {
      let fileUpload: FileUploadModel = new FileUploadModel();
      fileUpload.FileInFolder = new FileInFolder();
      fileUpload.FileInFolder.active = true;
      let index = item.name.lastIndexOf(".");
      let name = item.name.substring(0, index);
      fileUpload.FileInFolder.fileName = name;
      fileUpload.FileInFolder.fileExtension = item.name.substring(index, item.name.length - index);
      fileUpload.FileInFolder.size = item.size;
      fileUpload.FileInFolder.objectId = this.vendorOrderId;
      fileUpload.FileInFolder.objectType = 'VendorOrder';
      fileUpload.FileSave = item;
      listFileUploadModel.push(fileUpload);
    });

    this.loading = true;
    this.forderConfigurationService.uploadFile("VendorOrder", listFileUploadModel, this.vendorOrderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.uploadedFiles = [];
        if (this.fileUpload) {
          this.fileUpload.clear();  //Xóa toàn bộ file trong control
        }
        this.listFile = result.listFileInFolder;
        let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
      else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /*Event khi xóa 1 file đã lưu trên server*/
  deleteFile(file: FileInFolder) {
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa?',
      accept: () => {
        this.forderConfigurationService.deleteFile(file.fileInFolderId).subscribe(res => {
          let result: any = res;

          if (result.statusCode == 200) {
            this.listFile = this.listFile.filter(x => x.fileInFolderId != file.fileInFolderId);

            let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
          }
          else {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }

  downloadFile(data: FileInFolder) {
    this.folderService.downloadFile(data.fileInFolderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        var binaryString = atob(result.fileAsBase64);
        var fileType = result.fileType;
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var idx = 0; idx < binaryLen; idx++) {
          var ascii = binaryString.charCodeAt(idx);
          bytes[idx] = ascii;
        }
        var file = new Blob([bytes], { type: fileType });
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file);
        } else {
          var fileURL = URL.createObjectURL(file);
          if (fileType.indexOf('image') !== -1) {
            window.open(fileURL);
          } else {
            var anchor = document.createElement("a");
            anchor.download = data.fileName.substring(0, data.fileName.lastIndexOf('_')) + "." + data.fileExtension;
            anchor.href = fileURL;
            anchor.click();
          }
        }
      }
      else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  convertFileSize(size: string) {
    let tempSize = parseFloat(size);
    if (tempSize < 1024 * 1024) {
      return true;
    } else {
      return false;
    }
  }



}