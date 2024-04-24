import * as $ from 'jquery';
import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import 'moment/locale/pt-br';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { PriceProductModel } from '../../models/product.model';

import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";


interface PriceProduct {
  priceProductId: string,
  productId: string,
  productCode: string,
  productName: string,
  effectiveDate: Date,
  priceVnd: string,
  minQuantity: number,
  priceForeignMoney: string,
  customerGroupCategory: string,
  customerGroupCategoryName: string,
  createdById: string,
  createdDate: Date,
  ngayHetHan: Date,
  tiLeChietKhau: number
}

interface Category {
  categoryId: string,
  categoryName: string,
  categoryCode: string,
}

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.css'],
  providers: [
    DatePipe,
  ]
})
export class PriceListComponent implements OnInit {
  fixed: boolean = false;
  withFiexd: string = "";

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  auth: any = JSON.parse(localStorage.getItem('auth'));
  //get system parameter
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();
  loading: boolean = false;
  awaitResult: boolean = false;// khóa nút lưu
  cols: any[];
  selectedColumns: any[];
  listStatus: Array<Category> = [];
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  priveListId: string;
  isUpdate: boolean = false;
  isDisplayName: boolean = false;
  priceProductId: string;

  listGroupCustomer: Array<Category> = [];

  /*START : FORM PriceList*/
  priceProductForm: FormGroup;
  optionControl: FormControl;
  effectiveDateControl: FormControl;
  priceVNDControl: FormControl;
  MinimumQuantityControl: FormControl;
  ngayHetHanControl: FormControl;
  tiLeChietKhauControl: FormControl;
  /*END : FORM PriceList*/

  isUpdateAI: boolean = false;

  minYear: number = 2000;
  currentYear: number = (new Date()).getFullYear();
  maxEndDate: Date = new Date();

  /*Import*/
  displayDialog: boolean = false;
  importFileExcel: any = null;
  messErrFile: any = [];
  cellErrFile: any = [];
  fileName: string = '';
  listPriceProductImport: Array<PriceProductModel> = [];

  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('save') save: ElementRef;

  listOption = [];
  listPriceOption: PriceProduct[] = [];

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private productService: ProductService,
    private el: ElementRef,
    private renderer: Renderer2,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public dialogService: DialogService,
    private router: Router,
  ) {

    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (this.toggleButton && this.notifi) {
        if (!this.toggleButton.nativeElement.contains(e.target) &&
          !this.notifi.nativeElement.contains(e.target) &&
          !this.save.nativeElement.contains(e.target)) {
          this.isOpenNotifiError = false;
        }
      }
    });
  }

  async ngOnInit() {
    this.setForm();
    this.setTable();
    this.getMasterData();

    let resource = "sal/product/price-list/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Thông báo:', detail: 'Bạn không có quyền truy cập vào đường dẫn này vui lòng quay lại trang chủ' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    } else {

      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
    }
  }
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

  setTable() {
    this.cols = [
      { field: 'optionName', header: 'Tên hàng hóa', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'priceVnd', header: 'Giá bán', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'tiLeChietKhau', header: 'Thuế GTGT', width: '150px', textAlign: 'right', color: '#f44336' },
      { field: 'effectiveDate', header: 'Ngày hiệu lực', width: '50px', textAlign: 'right', color: '#f44336' },
      { field: 'ngayHetHan', header: 'Ngày hết hạn', width: '50px', textAlign: 'right', color: '#f44336' },
    ];

    this.selectedColumns = this.cols;
  }


  mappingPiceProductForm(): PriceProductModel {
    let newPriceProduct = new PriceProductModel();
    newPriceProduct.PriceProductId = this.priceProductId;


    newPriceProduct.ProductId = this.priceProductForm.controls['optionControl'].value?.id;

    let efectiveDate = this.priceProductForm.controls['effectiveDateControl'].value;
    newPriceProduct.EffectiveDate = convertToUTCTime(efectiveDate);
    newPriceProduct.PriceVnd = this.priceProductForm.controls['priceVNDControl'].value;
    newPriceProduct.MinQuantity = this.MinimumQuantityControl.value;
    newPriceProduct.TiLeChietKhau = this.priceProductForm.controls['tiLeChietKhauControl'].value;

    let ngayHetHan = this.priceProductForm.controls['ngayHetHanControl'].value;
    if (ngayHetHan) {
      newPriceProduct.NgayHetHan = convertToUTCTime(ngayHetHan);
    }
    return newPriceProduct;
  }

  savePrice() {
    debugger
    if (!this.priceProductForm.valid) {
      this.priceProductForm.markAllAsTouched();
      let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Vui lòng nhập đủ các thông tin!' };
      this.showMessage(msg);
      return;
    }

    let priceProduct: PriceProductModel = this.mappingPiceProductForm();

    this.awaitResult = true;
    this.loading = true;
    this.productService.createOrUpdatePriceProduct(priceProduct).subscribe(response => {
      this.loading = false;
      this.awaitResult = false;

      var result = <any>response;
      if (result.statusCode != 200) {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
        return;
      }
      this.resetForm();

      let mgs = { severity: 'success', summary: 'Thông báo:', detail: 'Thêm chi phí thành công' };
      this.showMessage(mgs);

      this.getMasterData();
    }, error => { });
  }


  delPriceProduct(rowData) {
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa?',
      accept: () => {
        this.productService.deletePriceProduct(rowData.priceProductId).subscribe(response => {
          var result = <any>response;
          if (result.statusCode == 200) {
            this.getMasterData();
            let mgs = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(mgs);
          } else {
            let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(mgs);
          }
        });
      }
    });
  }

  cancel() {
    this.isUpdate = false;
    this.resetForm();
  }

  changeOption(data) {

  }

  /*Hiển thị lại thông tin bổ sung*/
  reShowNote(event: any) {
    let rowData: PriceProduct = event.data;
    this.isUpdate = true;
    this.priceProductId = rowData.priceProductId;

    let option = this.listOption.find(c => c.id == rowData.productId);

    this.isDisplayName = true;
    this.priceProductForm.controls['optionControl'].setValue(option);
    this.priceProductForm.controls['effectiveDateControl'].setValue(new Date(rowData.effectiveDate));
    this.priceProductForm.controls['priceVNDControl'].setValue(rowData.priceVnd);
    this.priceProductForm.controls['MinimumQuantityControl'].setValue(1);

    if (rowData.ngayHetHan) {
      this.priceProductForm.controls['ngayHetHanControl'].setValue(new Date(rowData.ngayHetHan));
    }

    this.priceProductForm.controls['tiLeChietKhauControl'].setValue(rowData.tiLeChietKhau);
  }

  getMasterData() {
    this.loading = true;
    this.productService.getMasterDataPriceList().subscribe(response => {
      var result = <any>response;
      this.loading = false;

      if (result.statusCode != 200) {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
        return;
      }

      this.listOption = result.listOption;
      this.listPriceOption = result.listPriceOption;
    });
  }

  resetForm() {
    this.priceProductId = null;
    this.priceProductForm.reset();
    this.priceProductForm.markAsUntouched();
    this.isDisplayName = false;
    this.isInvalidForm = false;
    this.isOpenNotifiError = false;
    this.priceProductForm.controls['MinimumQuantityControl'].setValue(1);
    this.isUpdate = false;
  }

  setForm() {
    this.optionControl = new FormControl(null, [Validators.required]);
    this.effectiveDateControl = new FormControl(null, [Validators.required]);
    this.priceVNDControl = new FormControl(null, [Validators.required]);
    this.tiLeChietKhauControl = new FormControl(null);
    this.MinimumQuantityControl = new FormControl(1, [Validators.required]);
    this.ngayHetHanControl = new FormControl(null, [Validators.required]);
    this.priceProductForm = new FormGroup({
      optionControl: this.optionControl,
      effectiveDateControl: this.effectiveDateControl,
      priceVNDControl: this.priceVNDControl,
      MinimumQuantityControl: this.MinimumQuantityControl,
      tiLeChietKhauControl: this.tiLeChietKhauControl,
      ngayHetHanControl: this.ngayHetHanControl
    });
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  showDialogImport() {
    this.displayDialog = true;
  }

  downloadTemplateExcel() {
    let dateUTC = new Date();
    let title = "Template_Import_Bng_Gia";
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Sheet1');
    worksheet.pageSetup.margins = {
      left: 0.25, right: 0.25,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.pageSetup.paperSize = 9;  //A4 : 9


    let dataRow1 = [];
    dataRow1[1] = `Template import Bảng giá bán`
    let row1 = worksheet.addRow(dataRow1);
    row1.font = { name: 'Arial', size: 15, bold: true };
    worksheet.mergeCells(`A${row1.number}:F${row1.number}`);
    row1.alignment = { vertical: 'bottom', horizontal: 'center', wrapText: true };
    worksheet.addRow([]);

    // let dataRow2 = [];
    // dataRow2[1] = `    `
    // let row2 = worksheet.addRow(dataRow2);
    // row2.font = { name: 'Arial', size: 18, bold: true };
    // row2.alignment = { vertical: 'bottom', horizontal: 'center', wrapText: true };

    let dataRow3 = [];
    dataRow3[2] = `- Các cột màu đỏ là các cột bắt buộc nhập.
    - Các cột có ký hiệu (*) là các cột bắt buộc nhập theo điều kiện.
    - Mã sản phẩm, ngày hiệu lực và Mã nhóm khách hàng không được trùng nhau hoàn toàn giữa 2 bản ghi.`
    let row3 = worksheet.addRow(dataRow3);
    row3.font = { name: 'Arial', size: 11, color: { argb: 'ff0000' } };
    worksheet.mergeCells(`B${row3.number}:F${row3.number}`);
    row3.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataRow4 = [];
    dataRow4[2] = `- Tất cả dữ liệu nhập cần trùng với dữ liệu trong hệ thống.
    - Các trường dữ liệu là kiểu số không nhập dữ liệu cần để mặc định là 0.`
    let row4 = worksheet.addRow(dataRow4);
    row4.font = { name: 'Arial', size: 11, color: { argb: 'ff0000' } };
    worksheet.mergeCells(`B${row4.number}:F${row4.number}`);
    row4.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

    let dataHeaderRow = ['Mã sản phẩm*', 'Ngày hiệu lực*', 'Giá bán VND*', 'Số lượng tối thiểu*', 'Giá bán ngoại tệ', 'Nhóm khách hàng'];
    let headerRow = worksheet.addRow(dataHeaderRow);
    headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: '0D0904' } };
    dataHeaderRow.forEach((item, index) => {
      if (index !== 4 && index !== 5) {
        headerRow.getCell(index + 1).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'ff0000' } };
      }
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'C6E2FF' }
      };
    });
    headerRow.height = 25;

    let dataHeaderRow2 = ['BKAV-ANTIVIRUS', '11-04-2021', '300000', '1', '0', 'UTA'];
    let headerRow2 = worksheet.addRow(dataHeaderRow2);
    headerRow2.font = { name: 'Arial', size: 10, bold: false };
    dataHeaderRow2.forEach((item, index) => {
      headerRow2.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow2.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
      if (index == 0 || index == 5) {
        headerRow2.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      } else {
        headerRow2.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
      }

    });
    headerRow2.height = 18;

    worksheet.addRow([]);
    worksheet.getRow(3).height = 50;
    worksheet.getRow(4).height = 50;
    worksheet.getColumn(1).width = 30;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 30;

    this.exportToExel(workbook, title);
    // this.productService.downloadPriceProductTemplate().subscribe(response => {
    //   this.loading = false;
    //   const result = <any>response;
    //   if (result.templateExcel != null && result.statusCode === 200) {
    //     const binaryString = window.atob(result.templateExcel);
    //     const binaryLen = binaryString.length;
    //     const bytes = new Uint8Array(binaryLen);
    //     for (let idx = 0; idx < binaryLen; idx++) {
    //       const ascii = binaryString.charCodeAt(idx);
    //       bytes[idx] = ascii;
    //     }
    //     const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //     const link = document.createElement('a');
    //     link.href = window.URL.createObjectURL(blob);
    //     const fileName = result.fileName + ".xls";
    //     //const fileName = result.nameFile  + ".xlsx";
    //     link.download = fileName;
    //     link.click();
    //   }
    // }, error => { this.loading = false; });
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  chooseFile(event: any) {
    this.fileName = event.target.files[0].name;
    this.importFileExcel = event.target;
  }

  cancelFile() {
    $("#importFilePriceProduct").val("")
    this.fileName = "";
  }

  importExcel() {
    if (this.fileName == "") {
      let mgs = { severity: 'error', summary: 'Thông báo:', detail: "Chưa chọn file cần nhập" };
      this.showMessage(mgs);
    } else {

      const targetFiles: DataTransfer = <DataTransfer>(this.importFileExcel);
      const reader: FileReader = new FileReader();
      reader.readAsBinaryString(targetFiles.files[0]);

      reader.onload = (e: any) => {

        /* read workbook */
        const bstr: string = e.target.result;

        const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        // kiểm tra form value và file excel có khớp mã với nhau hay không
        let code = 'Sheet1';
        if (workbook.Sheets[code] === undefined) {
          let mgs = { severity: 'error', summary: 'Thông báo:', detail: "File không hợp lệ" };
          this.showMessage(mgs);
          return;
        }

        //lấy data từ file excel của product
        const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[code];
        /* save data */
        let dataPriceProduct: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
        dataPriceProduct.shift();


        this.displayDialog = false;
      }
    }
  }

}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
