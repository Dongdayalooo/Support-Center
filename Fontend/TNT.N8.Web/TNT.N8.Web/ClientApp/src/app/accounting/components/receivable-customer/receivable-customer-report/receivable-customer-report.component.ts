import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountingService } from '../../../services/accounting.service';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { SortEvent, MessageService } from 'primeng/api';
import * as moment from 'moment';
import 'moment/locale/pt-br';
import { Table } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { async } from '@angular/core/testing';

class doanhthu_KTTNModel {
  customerCode: string;
  customerId: string;
  contactId: string;
  tenKH: string;
  phanHang: string;
  ngayDatDV: Date;
  phieuDatDV: string;
  phieuHoTroDV: string;
  goiDichVu: string;
  dichVu: string;
  trangThai: string;
  tongTien: number;
  ngayThanhToan: Date;
}

class doanhthu_NCCNModel {
  customerCode: string;
  customerId: string;
  contactId: string;
  tenKH: string;
  customerOrderId: string;
  phanHang: string;
  ngayDatDV: Date;
  phieuDatDV: string;
  phieuHoTroDV: string;
  goiDichVu: string;
  dichVu: string;
  donHang: string;
  tongTien: number;
}
class FilterModel {
  id: string;
  name: string;
}

class CategoryEntityModel {
  categoryId: string;
  categoryName: string;
}

class CustomerEntityModel {
  customerId: string;
  customerName: string;
}
@Component({
  selector: 'app-receivable-customer-report',
  templateUrl: './receivable-customer-report.component.html',
  styleUrls: ['./receivable-customer-report.component.css'],
  providers: [
    DecimalPipe
  ]
})
export class ReceivableCustomerReportComponent implements OnInit {
  loading: boolean = false;
  nowDate: Date = new Date();
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 0;
  colSumarySection: number = 4;
  //master data
  tongDatHang: number = 0;
  tongThanhToan: number = 0;
  tongThanhToan_NCC: number = 0;
  tongChoThanhToan: number = 0;
  dulieu_doanhthu_KTTN: Array<doanhthu_KTTNModel> = [];
  dulieu_doanhthu_NCC: Array<doanhthu_NCCNModel> = [];

  //table
  colsList: any;
  selectedColumns: any[];
  @ViewChild('myTable') myTable: Table;
  //filter
  currentYear: number = new Date().getFullYear();
  minYear: number = this.currentYear - 10;
  maxStartDate: Date = new Date();
  maxEndDate: Date = new Date();
  filterGlobal: string;

  // Bộ lọc
  danhsach_phanloaiKH: any[];
  danhsach_nhomKH: any[];
  danhsach_khachhang: any[];
  danhsach_goiDV: any[];
  danhsach_dichvu: any[];
  today: Date = new Date();
  loaiBaoCaoValue: string = "1";

  packetSelected: Array<FilterModel> = [];
  dichVuSelected: Array<FilterModel> = [];
  khachHangSelected: Array<CustomerEntityModel> = [];
  phanHangSelected: Array<CategoryEntityModel> = [];
  nhomKhachHangSelected: Array<CategoryEntityModel> = [];
  fromDate: Date = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
  toDate: Date = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);

  constructor(
    private translate: TranslateService,
    private accountingService: AccountingService,
    private getPermission: GetPermission,
    public messageService: MessageService,
    private router: Router,
    private decimalPipe: DecimalPipe
  ) {
    this.translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }
  auth: any = JSON.parse(localStorage.getItem('auth'));
  //list action in page
  actionAdd: boolean = true;
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  dateFieldFormat: string = 'DD/MM/YYYY';

  sortColumnInList(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      /**Customize sort date */
      if (event.field == 'createdDate') {
        const date1 = moment(value1, this.dateFieldFormat);
        const date2 = moment(value2, this.dateFieldFormat);
        let result: number = -1;
        if (moment(date2).isBefore(date1, 'day')) { result = 1; }
        return result * event.order;
      }
      /**End */
      let result = null;
      if (value1 == null && value2 != null)
        result = -1;
      else if (value1 != null && value2 == null)
        result = 1;
      else if (value1 == null && value2 == null)
        result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      return (event.order * result);
    });
  }

  async ngOnInit() {
    //Check permission
    let resource = "acc/accounting/receivable-customer-report/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      this.loading = true;
      this.initTable();
      await this.getMasterData();
      this.search();
      this.loading = false;
    }
  }
  async getMasterData() {
    // Lấy danh sách dữ liệu cho bộ lọc
    let result: any = await this.accountingService.getMasterDataReport();
    if (result.statusCode === 200) {
      this.danhsach_phanloaiKH = result.danhSach_PhanHangKH;
      this.danhsach_nhomKH = result.danhSach_NhomKH;
      this.danhsach_khachhang = result.danhSach_KhachHang;
      this.danhsach_goiDV = result.danhSach_GoiDichVu;
      this.danhsach_dichvu = result.danhSach_DichVu;
    } else {
      this.showToast('error', 'Thông báo', 'Lấy dữ liệu thất bại')
    }
  }

  async search() {
    let reportType = 1;
    //Doanh thu mang lại cho KTTN
    if (this.loaiBaoCaoValue == "1") {
      //reset table
      this.dulieu_doanhthu_KTTN = [];
    }
    else {
      this.dulieu_doanhthu_NCC = [];
      reportType = 2;
    }

    let fromDate = null;
    let toDate = null;
    if (this.fromDate) fromDate = convertToUTCTime(this.fromDate);
    if (this.toDate) toDate = convertToUTCTime(this.toDate);
    if (!fromDate || !toDate) {
      this.showToast('error', 'Thông báo', 'Chọn ngày tháng');
      return;
    }
    let listPacketIdSelected = this.packetSelected.map(x => x.id);
    let listDicvuIdSelected = this.dichVuSelected.map(x => x.id);
    let phanhangKHIdSelected = this.phanHangSelected.map(x => x.categoryId);
    let nhomKHIdSelected = this.nhomKhachHangSelected.map(x => x.categoryId);
    let khachHangIdSelected = this.khachHangSelected.map(x => x.customerId);

    let result: any = await this.accountingService.searchReceivableCustomerReportNew(phanhangKHIdSelected, nhomKHIdSelected, khachHangIdSelected, listPacketIdSelected, listDicvuIdSelected, fromDate, toDate, reportType);
    if (result.statusCode === 200) {
      console.log("result", result)
      if (result.receivableCustomerReport != null) {
        if (this.loaiBaoCaoValue == "1") {
          this.dulieu_doanhthu_KTTN = result.receivableCustomerReport;
          this.tongDatHang = result.tongDatHang;
          this.tongThanhToan = result.tongThanhToan;
          this.tongChoThanhToan = result.tongChoThanhToan;

          if (this.dulieu_doanhthu_KTTN.length === 0) {
            this.showToast('warn', 'Thông báo', 'Không tìm thấy khách hàng nào');
          }
        }
        else {
          this.dulieu_doanhthu_NCC = result.receivableCustomerReport;
          this.tongThanhToan_NCC = result.tongThanhToan;
        }
      }
    }
  }

  initTable() {
    this.colsList = [
      { field: 'tenKH', header: 'Tên KH', textAlign: 'left', display: 'table-cell', width: "145px" },
      { field: 'phanHang', header: 'Phân hạng', textAlign: 'center', display: 'table-cell', width: "100px" },
      { field: 'ngayDatDV', header: 'Ngày đặt dịch vụ', textAlign: 'center', display: 'table-cell', width: "100px" },
      { field: 'phieuDatDV', header: 'Phiếu đặt dịch vụ', textAlign: 'left', display: 'table-cell', width: "150px" },
      { field: 'phieuHoTroDV', header: 'Phiếu hỗ trợ dịch vụ', textAlign: 'left', display: 'table-cell', width: "150px" },
      { field: 'goiDichVu', header: 'Gói dịch vụ', textAlign: 'left', display: 'table-cell', width: "150px" },
      { field: 'dichVu', header: 'Dịch vụ', textAlign: 'left', display: 'table-cell', width: "200px" },
      { field: 'trangThai', header: 'Trạng thái phiếu yêu cầu', textAlign: 'center', display: 'table-cell', width: "100px" },
      { field: 'tongTien', header: 'Tổng tiền', textAlign: 'right', display: 'table-cell', width: "100px" },
      { field: 'ngayThanhToan', header: 'Ngày thanh toán', textAlign: 'center', display: 'table-cell', width: "100px" },
    ];
    this.selectedColumns = this.colsList;
  }

  async refreshFilter() {
    this.dulieu_doanhthu_KTTN = [];
    this.packetSelected = [];
    this.dichVuSelected = [];
    this.phanHangSelected = [];
    this.khachHangSelected = [];
    this.nhomKhachHangSelected = [];
    this.isShowFilterLeft = false;
    this.leftColNumber = 12;
    this.rightColNumber = 0;
    this.colSumarySection = 4;
    this.filterGlobal = '';
    this.fromDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.toDate = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);

    this.loading = true;
    await this.search();
    this.loading = false;
  }

  showFilter() {
    if (this.innerWidth < 1024) {
      this.isShowFilterTop = !this.isShowFilterTop;
    } else {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 9;
        this.rightColNumber = 3;
        this.colSumarySection = 6;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
        this.colSumarySection = 4;
      }
    }
  }

  viewDetail(rowData, type) {
    let url;
    if (type == 1) url = this.router.serializeUrl(this.router.createUrlTree(['/customer/create', { customerId: rowData.customerId, contactId: rowData.contactId }]));
    if (type == 2) url = this.router.serializeUrl(this.router.createUrlTree(['order/create', { OrderId: rowData.orderId }]));
    if (type == 3) url = this.router.serializeUrl(this.router.createUrlTree(['order/orderAction', { OrderActionId: rowData.orderActionId }]));
    if (type == 4) url = this.router.serializeUrl(this.router.createUrlTree(['/vendor/detail-order', { vendorOrderId: rowData.vendorOrderId }]));
    window.open(url, '_blank');
  }

  async doanhThuMangLaiChoKTTN() {
    this.initTable();
    this.loaiBaoCaoValue = "1";
    this.loading = true;
    await this.search();
    this.loading = false;
  }

  async doanhThuMangLaiChoNCC() {
    this.colsList = [
      { field: 'tenKH', header: 'Tên KH', textAlign: 'left', display: 'table-cell', width: "145px" },
      { field: 'phanHang', header: 'Phân hạng', textAlign: 'center', display: 'table-cell', width: "100px" },
      { field: 'ngayDatDV', header: 'Ngày đặt dịch vụ', textAlign: 'center', display: 'table-cell', width: "120px" },
      { field: 'phieuDatDV', header: 'Phiếu đặt dịch vụ', textAlign: 'left', display: 'table-cell', width: "150px" },
      { field: 'phieuHoTroDV', header: 'Phiếu hỗ trợ dịch vụ', textAlign: 'left', display: 'table-cell', width: "150px" },
      { field: 'goiDichVu', header: 'Gói dịch vụ', textAlign: 'left', display: 'table-cell', width: "150px" },
      { field: 'donHang', header: 'Đơn hàng', textAlign: 'left', display: 'table-cell', width: "150px" },
      { field: 'dichVu', header: 'Dịch vụ', textAlign: 'left', display: 'table-cell', width: "200px" },
      { field: 'tongTien', header: 'Tổng tiền', textAlign: 'right', display: 'table-cell', width: "100px" },
    ];

    this.selectedColumns = this.colsList;
    this.loaiBaoCaoValue = "2";
    this.loading = true;
    await this.search();
    this.loading = false;
  }
  exportExcel() {
    let title = "Báo cáo " + (this.loaiBaoCaoValue == "1" ? "doanh thu mang lại cho KTTN" : "doanh thu mang lại cho NCC");
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);

    let dataHeaderMain = title.toUpperCase();
    let headerMain = worksheet.addRow([dataHeaderMain]);
    headerMain.font = { size: 18, bold: true };
    worksheet.mergeCells(`A${1}:K${1}`);
    headerMain.getCell(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    worksheet.addRow([]);
    worksheet.addRow([]);

    let dataHeaderRow = this.loaiBaoCaoValue == "1" ? ['STT', 'Tên KH', 'Phân hạng', 'Ngày đặt dịch vụ', 'Phiếu đặt dịch vụ', 'Phiếu hỗ trợ dịch vụ', 'Gói dịch vụ', 'Dịch vụ', 'Trạng thái phiếu yêu cầu', 'Tổng tiền', 'Ngày thanh toán'] : ['STT', 'Tên KH', 'Phân hạng', 'Ngày đặt dịch vụ', 'Phiếu đặt dịch vụ', 'Phiếu hỗ trợ dịch vụ', 'Gói dịch vụ', 'Đơn hàng', 'Dịch vụ', 'Tổng tiền'];

    let headerRow = worksheet.addRow(dataHeaderRow);
    headerRow.font = { name: 'Time New Roman', size: 10, bold: true };
    dataHeaderRow.forEach((item, index) => {
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8DB4E2' }
      };
    });
    headerRow.height = 40;

    let data: Array<any> = [];
    if (this.loaiBaoCaoValue == "1") {
      this.dulieu_doanhthu_KTTN.forEach((item, index) => {
        let row: Array<any> = [];
        row[0] = index + 1;
        row[1] = item.tenKH;
        row[2] = item.phanHang;
        row[3] = item.ngayDatDV;
        row[4] = item.phieuDatDV;
        row[5] = item.phieuHoTroDV;
        row[6] = item.goiDichVu;
        row[7] = item.dichVu;
        row[8] = item.trangThai;
        row[9] = this.decimalPipe.transform(item.tongTien).toString();
        row[10] = item.ngayThanhToan;

        data.push(row);
      });
    }
    else {
      this.dulieu_doanhthu_NCC.forEach((item, index) => {
        let row: Array<any> = [];
        row[0] = index + 1;
        row[1] = item.tenKH;
        row[2] = item.phanHang;
        row[3] = item.ngayDatDV;
        row[4] = item.phieuDatDV;
        row[5] = item.phieuHoTroDV;
        row[6] = item.goiDichVu;
        row[7] = item.donHang;
        row[8] = item.dichVu;
        row[9] = this.decimalPipe.transform(item.tongTien).toString();

        data.push(row);
      });
    }
    data.forEach((el, index, array) => {
      let row = worksheet.addRow(el);
      row.font = { name: 'Times New Roman', size: 11 };

      row.getCell(1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };

      row.getCell(2).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(3).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(4).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(5).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(6).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

      row.getCell(7).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(7).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };

      row.getCell(8).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(8).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      row.getCell(9).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(9).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      row.getCell(10).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(10).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      row.getCell(11).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(11).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    /* fix with for column */
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 30;
    worksheet.getColumn(7).width = 40;
    worksheet.getColumn(8).width = 60;
    worksheet.getColumn(9).width = 25;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 15;

    this.exportToExel(workBook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  change_GoiDichVu(event: any) {

  }
}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
