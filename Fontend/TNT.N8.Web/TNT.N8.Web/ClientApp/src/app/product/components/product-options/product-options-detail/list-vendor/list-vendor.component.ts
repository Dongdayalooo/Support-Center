import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { VendorGroupModel, VendorListModel } from '../../model/list-vendor';
import { ListVendorService } from '../../service/list-vendor.service';
import { AbstractBase } from '../../../../../shared/abstract-base.component';
import { RegexConst } from '../../../../../shared/regex-const';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng';
import { AddVendorToOptionDialogComponent } from '../../addVendorToOption-dialog/addVendorToOption-dialog.component';
import { BaseType } from '../../../../../../../src/app/shared/models/baseType.model';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import { VendorMappingOption } from '../../../../../../../src/app/shared/models/VendorMappingOption.model';
import { ShowErrImportDialogComponent } from '../../../../../../../src/app/shared/components/showErrImport/showErrImport-dialog.component';
import { CategoryEntityModel } from '../../../../../../../src/app/product/models/product.model';
import { CauHinhMucHoaHong } from '../../../../../../../src/app/shared/models/cauHinhHoaHong.model';


@Component({
  selector: 'app-list-vendor',
  templateUrl: './list-vendor.component.html',
  styleUrls: ['./list-vendor.component.css']
})
export class ListVendorComponent extends AbstractBase implements OnInit {
  @Input() optionId: string;
  @ViewChild('dt') myTable: Table;

  listVendorGroup: VendorGroupModel[] = [];
  listBank: VendorGroupModel[] = [];
  vendorList: VendorListModel[] = [];

  listKieuThanhToan: BaseType[] = []

  listDonViTien: CategoryEntityModel[] = [];

  listVendorMappingOption: VendorListModel[] = [];

  listDieuKienHoaHong: CategoryEntityModel[] = [];

  loading = false;
  cols: any[];
  rows = 10;
  auth: any = JSON.parse(localStorage.getItem("auth"));
  showModal: boolean = false;
  createVendorForm: FormGroup;
  emailPattern = RegexConst.emailPattern;
  vendorAdd: VendorListModel = null;

  filterGlobal: string = "";

  //responsive
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 2;

  filterNhaCungCap = [];
  filterDonGiaTu: number = null;
  filterDonGiaDen: number = null;

  filterThoiGianTu: Date = null;
  filterThoiGianDen: Date = null;

  thanhToanTruoc: boolean = false;

  listCauHinhHoaHong: CauHinhMucHoaHong[] = [];

  constructor(
    injector: Injector,
    private vendorService: ListVendorService,
    private _activatedRoute: ActivatedRoute,

  ) {
    super(injector);
    this.innerWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.initForm();
    this._activatedRoute.params.subscribe(params => {
      this.optionId = params['optionId'];
    });
    this.loadTable();
  }

  clearToast() {
    this.message.clear();
  }

  async loadTable() {
    this.loading = true;
    let listVendorId = this.filterNhaCungCap ? this.filterNhaCungCap.map(x => x.vendorId) : [];
    let [result]: any = await Promise.all([
      this.vendorService.getMasterDataAddVendorToOption(this.optionId, listVendorId, this.filterDonGiaTu, this.filterDonGiaDen, this.filterThoiGianTu, this.filterThoiGianDen)
    ]);

    this.loading = false;
    if (result.statusCode != 200) {
      this.clearToast();
      this.showToast('error', 'Thông báo', result.messageCode);
      return;
    }
    console.log("result", result)
    this.listVendorGroup = result.listVendorGroup;
    this.listBank = result.listBank;
    this.vendorList = result.vendorList;
    this.listKieuThanhToan = result.listKieuThanhToan;
    this.listVendorMappingOption = result.listVendorMappingOption;
    this.thanhToanTruoc = result.thanhToanTruoc;
    this.listDonViTien = result.listDonViTien;
    this.listCauHinhHoaHong = result.listCauHinhHoaHong;
    this.listDieuKienHoaHong = result.listDieuKienHoaHong;
    this.initCol();
  }

  initCol() {
    this.cols = [
      { field: 'stt', header: 'Stt', textAlign: "center", width: '50px' },
      { field: 'vendorGroupName', header: 'Nhóm nhà cung cấp', textAlign: "left", width: '150px' },
      { field: 'vendorName', header: 'Tên nhà cung cấp', textAlign: "left", width: '200px' },
      { field: 'email', header: 'Email', textAlign: "left", width: '150px' },
      { field: 'phoneNumber', header: 'Số điện thoại', textAlign: "left", width: '150px' },
      { field: 'address', header: 'Địa chỉ', textAlign: "left", width: '200px' },
      // { field: 'soLuongToiThieu', header: 'Số lượng tối thiểu', textAlign: "right", width: '120px' },
      { field: 'donViTien', header: 'Đơn vị tiền', textAlign: "right", width: '120px' },
      { field: 'price', header: 'Đơn giá', textAlign: "right", width: '150px' },
      { field: 'thueGtgt', header: 'Thuế GTGT (%)', textAlign: "right", width: '150px' },
      { field: 'giaTriChietKhau', header: 'Chiết khấu', textAlign: "right", width: '150px' },
      { field: 'prepaymentValue', header: 'Giá trị thanh toán ', textAlign: "right", width: '150px' },
      { field: 'efftiveDate', header: 'Thời gian hiệu lực', textAlign: "center", width: '190px' },
      { field: 'mucHoaHong', header: 'Mức hoa hồng', textAlign: "center", width: '190px' },
    ];

    if (this.thanhToanTruoc) {
      this.cols = this.cols.filter(x => x.field != "mucHoaHong");
    } else {
      let listFieldRemove = ["donViTien", "price", "thueGtgt", "giaTriChietKhau", "prepaymentValue", "efftiveDate"];
      this.cols = this.cols.filter(x => !listFieldRemove.includes(x.field));
    }


  }

  open(): void {
    this.showModal = true;
  }

  close(): void {
    this.showModal = false;
  }

  refreshFilter() {
    this.filterNhaCungCap = [];
    this.filterDonGiaTu = null;
    this.filterDonGiaDen = null
    this.filterThoiGianTu = null;
    this.filterThoiGianDen = null;
    this.loadTable();
  }

  displayChooseFileImportDialog: boolean = false;
  onpenDialogChoseFileExcel() {
    this.displayChooseFileImportDialog = true;
  }

  closeChooseFileImportDialog() {
    this.cancelFile();
  }

  fileName: string = "";
  cancelFile() {
    let fileInput = $("#importFileProduct")
    fileInput.replaceWith(fileInput.val('').clone(true));
    this.fileName = "";
  }

  onClickImportBtn(event: any) {
    /* clear value của file input */
    event.target.value = ''
  }

  importFileExcel: any = null;
  chooseFile(event: any) {
    this.fileName = event.target?.files[0]?.name;
    this.importFileExcel = event.target;
  }

  importExcel() {
    if (this.fileName == "") {
      let mgs = { severity: 'error', summary: 'Thông báo:', detail: "Chưa chọn file cần nhập" };
      this.showMessage(mgs);
      return;
    }

    const targetFiles: DataTransfer = <DataTransfer>(this.importFileExcel);
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(targetFiles.files[0]);
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      let code = 'Sheet1';
      if (!workbook.Sheets[code]) {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: "File không hợp lệ" };
        this.showMessage(mgs);
        return;
      }

      //lấy data từ file excel
      const worksheetProduct: XLSX.WorkSheet = workbook.Sheets[code];
      /* save data */
      let listImportRawData: Array<any> = XLSX.utils.sheet_to_json(worksheetProduct, { header: 1 });
      /* remove header */
      listImportRawData = listImportRawData.filter((e, index) => index != 0);
      /* nếu không nhập 2 trường required: tên + mã khách hàng thì loại bỏ */
      listImportRawData = listImportRawData.filter(e => (e[1] && e[4]));
      /* chuyển từ raw data sang model */
      let listImport: Array<VendorMappingOption> = [];

      listImportRawData?.forEach(_rawData => {

        let mapping = new VendorMappingOption();
        mapping.stt = _rawData[0] ? _rawData[0] : null;
        mapping.vendorName = _rawData[1] ? _rawData[1].trim() : "";
        mapping.soLuongToiThieu = 1;
        mapping.price = _rawData[2] ? _rawData[2] : null;
        mapping.yeuCauThanhToan = _rawData[3] ? _rawData[3] : null;
        mapping.giaTriThanhToan = _rawData[4] ? _rawData[4] : null;
        var thoiGianTuDen = _rawData[5] ? _rawData[5].split("-") : [];

        if (thoiGianTuDen.length == 2) {
          mapping.thoiGianTu = new Date(thoiGianTuDen[0].trim());
          mapping.thoiGianDen = new Date(thoiGianTuDen[1].trim());

          mapping.thoiGianTu = mapping.thoiGianTu ? convertToUTCTime(mapping.thoiGianTu) : null;
          mapping.thoiGianDen = mapping.thoiGianDen ? convertToUTCTime(mapping.thoiGianDen) : null;
        }

        listImport = [...listImport, mapping];
      });

      this.vendorService.importVendorMappingOptions(listImport, this.optionId).subscribe(response => {
        const result: any = response;

        if (result.statusCode != 200) {
          let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(mgs);
          return;
        }

        this.displayChooseFileImportDialog = false;
        //Nếu trả lại list thì show lỗi
        if (result.listImport != null && result.listImport.length > 0) {
          let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(mgs);
          this.showErrImport(result.listImport)
        } else {
          let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(mgs);
          this.loadTable();
        }
      });
    }
  }

  showErrImport(listImport) {
    let ref = this.dialogService.open(ShowErrImportDialogComponent, {
      header: "Thông tin lỗi",
      width: '90%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "auto"
      },
      data: {
        listData: listImport,
        listColumn: this.cols.filter(x => x.field == "stt" || x.field == "vendorName" || x.field == "soLuongToiThieu" || x.field == "price" || x.field == "prepaymentValue" || x.field == "efftiveDate")
      }
    });

    ref.onClose.subscribe(result => {
      if (result) this.loadTable();
    });
  }



  exportExcel() {
    let title = `Bảng giá nhà cung cấp dịch vụ`;

    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);


    let titleRow = worksheet.addRow([`Bảng giá nhà cung cấp dịch vụ`]);
    titleRow.font = { name: 'Time New Roman', size: 14, bold: true };
    titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    worksheet.mergeCells("A1:J1");
    worksheet.addRow([]);
    //data grid
    let dataHeaderRow1: Array<string> = this.cols.map(e => e.header);
    let headerRow1 = worksheet.addRow(dataHeaderRow1);
    headerRow1.font = { name: 'Time New Roman', size: 10, bold: true };
    headerRow1.height = 30;
    headerRow1.font = { name: 'Time New Roman', size: 10, bold: true };
    dataHeaderRow1.forEach((item, index) => {
      headerRow1.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow1.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow1.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8DB4E2' }
      };
    });

    let data: Array<any> = [];

    this.listVendorMappingOption.forEach((item, index) => {
      let row: Array<any> = [];
      if (this.thanhToanTruoc == true) {
        row[0] = index + 1;
        row[1] = item.vendorGroupName;
        row[2] = item.vendorName;
        row[3] = item.email;
        row[4] = item.phoneNumber;
        row[5] = item.address;
        row[6] = item.donViTien;
        row[7] = this.numberWithCommas(item.price);
        row[8] = item.thueGtgt;
        row[9] = item.chietKhauId == 1 ? (item.giaTriChietKhau + " % ") : item.giaTriChietKhau;
        row[10] = item.yeuCauThanhToan == 1 ? item.giaTriThanhToan + "%" : this.numberWithCommas(item.giaTriThanhToan);
        row[11] = moment(new Date(item.thoiGianTu)).format('DD/MM/YYYY') + " - " + moment(new Date(item.thoiGianDen)).format('DD/MM/YYYY');
      } else {
        row[0] = index + 1;
        row[1] = item.vendorGroupName;
        row[2] = item.vendorName;
        row[3] = item.email;
        row[4] = item.phoneNumber;
        row[5] = item.address;
        row[6] = "";
        debugger
        let listHh = this.getMucHoaHong(item.id, null);
        listHh.forEach(data => {
          if (data.loaiHoaHong == 1) {
            row[6] += (data.giaTriHoaHong + "% ,");
          } else {
            row[6] += ((data.giaTriHoaHong != null ? (data.giaTriHoaHong) : ""))
          }
        });
      }
      data.push(row);
    });

    data.forEach((el, index, array) => {
      let row = worksheet.addRow(el);
      row.font = { name: 'Times New Roman', size: 11 };

      row.getCell(1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

      row.getCell(2).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      row.getCell(3).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(4).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(5).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(6).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(7).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(7).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

      if (this.thanhToanTruoc == true) {
        row.getCell(9).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(9).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

        row.getCell(8).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(8).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

        row.getCell(10).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(10).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };


        row.getCell(11).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(11).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

        row.getCell(12).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(12).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

      }
    });

    //sign reagion
    worksheet.addRow([]);


    /* fix with for column */
    worksheet.getColumn(1).width = 10;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 32;
    worksheet.getColumn(4).width = 25;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 32;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 25;

    this.exportToExel(workBook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  numberWithCommas(x) {
    if (x == null) return;
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  showFilter() {
    if (this.innerWidth < 1024) {
      this.isShowFilterTop = !this.isShowFilterTop;
    } else {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 8;
        this.rightColNumber = 4;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
      }
    }
  }


  initForm() {
    this.createVendorForm = new FormGroup({
      'VendorGroup': new FormControl(null, [Validators.required]),
      'VendorName': new FormControl('', [Validators.required, this.checkBlankString()]),
      'MST': new FormControl(''),
      'Phone': new FormControl(''),
      'Email': new FormControl(''),
      'Website': new FormControl(''),
      'Address': new FormControl(''),
      'Description': new FormControl(''),

      'Bank': new FormControl(null, [Validators.required]),
      'Account': new FormControl(null, [Validators.required, this.checkBlankString()]),
      'AccountName': new FormControl(null, [Validators.required, this.checkBlankString()]),
      'Branch': new FormControl(null, [Validators.required, this.checkBlankString()]),

      'ContactName': new FormControl(""),
      'ContactGender': new FormControl("NAM"),
      'ContactEmail': new FormControl(""),
      'ContactPhone': new FormControl(""),
    });

  }

  checkBlankString(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } => {
      if (control.value !== null && control.value !== undefined) {
        if (control.value.trim() === "") {
          return { 'blankString': true };
        }
      }
      return null;
    }
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }

  resetForm() {
    this.createVendorForm.reset();
    this.createVendorForm.get('VendorGroup').patchValue(null);
    this.createVendorForm.get('MST').patchValue('');
    this.createVendorForm.get('VendorName').patchValue('');
    this.createVendorForm.get('Email').patchValue('');
    this.createVendorForm.get('Phone').patchValue('');
    this.createVendorForm.get('Address').patchValue('');
  }

  addVendorToOption(data) {
    console.log("this.vendorList",this.vendorList)
    let ref = this.dialogService.open(AddVendorToOptionDialogComponent, {
      header: data ? 'Thông tin giá nhà cung cấp' : 'Thêm thông tin giá nhà cung cấp',
      width: '750px',
      contentStyle: {
        "z-index": "1000!important",
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "hidden"
      },
      data: {
        listKieuThanhToan: this.listKieuThanhToan,
        vendorList: this.vendorList,
        data: data,
        isEdit: data ? true : false,
        optionId: this.optionId,
        thanhToanTruoc: this.thanhToanTruoc,
        listDonViTien: this.listDonViTien,
        listCauHinhHoaHong: this.thanhToanTruoc ? [] : [...this.listCauHinhHoaHong.filter(x => x.vendorMappingOptionId == data?.id)],
        listDieuKienHoaHong: this.listDieuKienHoaHong,
      }
    });

    ref.onClose.subscribe(result => {
      if (result) this.loadTable();
    });
  }


  async deleteVendorMappingOption(vendorId) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: async () => {
        this.loading = true;
        let result: any = await this.vendorService.deleteVendorMappingOption(vendorId, this.optionId);
        this.loading = false;
        if (result.statusCode === 200) {
          this.clearToast();
          this.showToast('success', 'Thông báo', result.messageCode);
          this.loadTable();
        } else {
          this.clearToast();
          this.showToast('error', 'Thông báo', result.messageCode);
        }
      }
    })
  }

  quickCreateVendor() {
    if (!this.createVendorForm.valid) {
      Object.keys(this.createVendorForm.controls).forEach(key => {
        if (!this.createVendorForm.controls[key].valid) {
          this.createVendorForm.controls[key].markAsTouched();
        }
      });
      this.showToast('success', 'Thông báo', "Vui lòng nhập đầy đủ thông tin!");
      this.loadTable();
      return;
    }
  }

  parseStringToFloat(str): number {
    if (str === "") return 0;
    str = str.replace(/,/g, '');
    return parseFloat(str);
  }

  getMucHoaHong(id: string, parentId: string): CauHinhMucHoaHong[] {
    return this.listCauHinhHoaHong.filter(x => x.vendorMappingOptionId == id && x.parentId == null);
  }
}


function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

