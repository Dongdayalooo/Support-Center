import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import 'moment/locale/pt-br';
import { DecimalPipe } from '@angular/common';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { AccountingService } from '../../services/accounting.service';



@Component({
  selector: 'app-bao-cao-doanh-thu',
  templateUrl: './bao-cao-doanh-thu.component.html',
  styleUrls: ['./bao-cao-doanh-thu.component.css'],
  providers: [
    DecimalPipe,
    DatePipe,
  ]
})

export class BaoCaoDoanhThuComponent implements OnInit {
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  actionDownload: boolean = true;
  loading: boolean = false;
  innerWidth: number = 0; //number window size first


  listData = [];

  @ViewChild('myTable') myTable: Table;

  //Bộ lọc
  isGlobalFilter: string = '';
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;

  //Loại báo cáo
  listBaoCao = [
    { index: 0, name: "Doanh thu tổng hợp" },
    { index: 1, name: "Doanh thu theo đơn dịch vụ" },
    { index: 2, name: "Doanh thu theo khách hàng" },
    { index: 3, name: "Doanh thu theo nhân viên" },
  ];

  baoCaoSelected = { index: 0, name: "Doanh thu tổng hợp" };
  listCol = [];

  listNhomDichVu = [];
  listDichVu = [];
  listLoaiDoanhThu = [];
  listPhanHangKhachHang = [];
  listKhachHang = [];
  listGoiDichVu = [];
  listLoaiNhanVien = [];
  listChucVu = [];

  //Selected
  listNhomDichVuSelected = [];
  listDichVuSelected = [];
  listLoaiDoanhThuSelected = [];
  listPhanHangKhachHangSelected = [];
  listKhachHangSelected = [];
  listGoiDichVuSelected = [];
  listLoaiNhanVienSelected = [];
  listChucVuSelected = [];
  tuNgay: Date;
  denNgay: Date;
  doanhThuTu: number;
  doanhThuDen: number;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private getPermission: GetPermission,
    private messageService: MessageService,
    private decimalPipe: DecimalPipe,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private accountingService: AccountingService,

  ) {
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    let resource = "acc/accounting/bao-cao-doanh-thu";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("download") == -1) {
        this.actionDownload = false;
      }
      await this.getMasterBaoCaoTongHop();

    }
  }

  async getMasterBaoCaoTongHop() {
    let param = {
      TabIndex: this.baoCaoSelected.index
    };
    this.initTable();

    this.loading = true;
    let result: any = await this.accountingService.getMasterBaoCaoTongHop(param);
    this.loading = false;
    if (result.statusCode == 200) {
      this.listNhomDichVu = result.listNhomDichVu;
      this.listDichVu = result.listDichVu;
      this.listLoaiDoanhThu = result.listLoaiDoanhThu;
      this.listPhanHangKhachHang = result.listPhanHangKh;
      this.listKhachHang = result.listCustomer;
      this.listGoiDichVu = result.listGoiDichVu;
      this.listLoaiNhanVien = result.listLoaiNhanVien;
      this.listChucVu = result.listChucVu;
      this.getBaoCaoTongHop();
    } else {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }

  initTable() {
    //Doanh thu tổng hợp
    if (this.baoCaoSelected.index == 0) {
      this.listCol = [
        { field: 'name', header: 'Dịch vụ', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'nhomDv', header: 'Nhóm dịch vụ', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'soLuongDat', header: 'Số lượng đặt', textAlign: 'center', display: 'table-cell', width: '150px' },
        { field: 'thanhToanTruoc', header: 'Loại doanh thu', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'doanhThuTuKH', header: 'Doanh thu từ KH', textAlign: 'right', display: 'table-cell', width: '150px' },
        { field: 'thanhToanChoNcc', header: 'Thanh toán cho Ncc', textAlign: 'right', display: 'table-cell', width: '150px' },
        { field: 'hoaHongNhanVe', header: 'Hoa hồng nhận về', textAlign: 'right', display: 'table-cell', width: '150px' },
        { field: 'tongDoanhThu', header: 'Tổng doanh thu', textAlign: 'right', display: 'table-cell', width: '150px' },
      ]
    }
    //Daonh thu theo đơn dịch vụ
    if (this.baoCaoSelected.index == 1) {
      this.listCol = [
        { field: 'customerOrderCode', header: 'Đơn đặt dịch vụ', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'orderActionCode', header: 'Phiếu hỗ trợ dịch vụ', textAlign: 'left', display: 'table-cell', width: '190px' },
        { field: 'customerName', header: 'Khách hàng', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'phanHang', header: 'Phân hạng', textAlign: 'center', display: 'table-cell', width: '100px' },
        { field: 'ngayDatHang', header: 'Ngày đặt hàng', textAlign: 'center', display: 'table-cell', width: '130px' },
        { field: 'goiDichVu', header: 'Gói dịch vụ', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'dichVu', header: 'Dịch vụ', textAlign: 'left', display: 'table-cell', width: '280px' },
        { field: 'doanhThuTuKH', header: 'Doanh thu từ KH', textAlign: 'right', display: 'table-cell', width: '135px' },
        { field: 'thanhToanNcc', header: 'Thanh toán cho Ncc', textAlign: 'right', display: 'table-cell', width: '135px' },
        { field: 'thanhToanHoaHong', header: 'Hoa hồng', textAlign: 'right', display: 'table-cell', width: '135px' },
        { field: 'tongDoanhThu', header: 'Tổng doanh thu', textAlign: 'right', display: 'table-cell', width: '135px' },
      ]
    }
    //Daonh thu theo  khách hàng
    if (this.baoCaoSelected.index == 2) {
      this.listCol = [
        { field: 'customerName', header: 'Khách hàng', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'phanHang', header: 'Phân hạng', textAlign: 'center', display: 'table-cell', width: '100px' },
        { field: 'soDonDatHang', header: 'Số đơn đặt dịch vụ', textAlign: 'center', display: 'table-cell', width: '150px' },
        { field: 'goiDichVu', header: 'Gói dịch vụ', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'dichVu', header: 'Dịch vụ sử dụng', textAlign: 'left', display: 'table-cell', width: '280px' },
        { field: 'tongTienKh', header: 'Tổng tiền KH trả trước', textAlign: 'right', display: 'table-cell', width: '150px' },
        { field: 'tongTienThanhToanNcc', header: 'Thanh toán cho Ncc', textAlign: 'right', display: 'table-cell', width: '150px' },
        { field: 'tongTienHoaHong', header: 'Hoa hồng', textAlign: 'right', display: 'table-cell', width: '150px' },
        { field: 'tongDoanhThu', header: 'Tổng doanh thu', textAlign: 'right', display: 'table-cell', width: '150px' },
      ]
    }

    //Daonh thu theo nhân viên
    if (this.baoCaoSelected.index == 3) {
      this.listCol = [
        { field: 'employeeName', header: 'Nhân viên', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'phanLoai', header: 'Phân loại', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'chucVu', header: 'Chức vụ', textAlign: 'left', display: 'table-cell', width: '150px' },
        { field: 'tongSoLanDatDichVu', header: 'Tổng số dịch vụ đã hỗ trợ', textAlign: 'center', display: 'table-cell', width: '150px' },
        { field: 'dichVu', header: 'Dịch vụ hỗ trợ', textAlign: 'left', display: 'table-cell', width: '280px' },
        { field: 'tongDoanhThu', header: 'Tổng doanh thu', textAlign: 'right', display: 'table-cell', width: '150px' },
      ]
    }

  }

  async getBaoCaoTongHop() {
    this.listData = [];
    let param = {
      TabIndex: this.baoCaoSelected.index,

      ListNhomDichVuId: this.listNhomDichVuSelected ? this.listNhomDichVuSelected.map(x => x.categoryId) : [],
      ListDichVuId: this.listDichVuSelected ? this.listDichVuSelected.map(x => x.id) : [],
      ListGoiDichVuId: this.listGoiDichVuSelected ? this.listGoiDichVuSelected.map(x => x.id) : [],
      ListLoaiDoanhThuId: this.listLoaiDoanhThuSelected ? this.listLoaiDoanhThuSelected.map(x => x.value) : [],
      TuNgay: this.tuNgay ? convertToUTCTime(new Date(this.tuNgay)) : null,
      DenNgay: this.denNgay ? convertToUTCTime(new Date(this.denNgay)) : null,
      DoanhThuTu: this.doanhThuTu,
      DoanhThuDen: this.doanhThuDen,

      ListPhanHangId: this.listPhanHangKhachHangSelected ? this.listPhanHangKhachHangSelected.map(x => x.categoryId) : [],
      ListKhachHang: this.listKhachHangSelected ? this.listKhachHangSelected.map(x => x.customerId) : [],
      ListChucVuId: this.listChucVuSelected ? this.listChucVuSelected.map(x => x.value) : [],
      ListLoaiNhanVienId: this.listLoaiNhanVienSelected ? this.listLoaiNhanVienSelected.map(x => x.value) : [],
    };

    if (param.TuNgay && param.DenNgay && param.TuNgay > param.DenNgay) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Thời gian từ không được lớn hơn thời gian đến!" };
      this.showMessage(msg);
      return;
    }

    if (param.DoanhThuTu && param.DoanhThuDen && param.DoanhThuTu > param.DoanhThuDen) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Tổng doanh thu từ không được lớn hơn tổng doanh thu đến!" };
      this.showMessage(msg);
      return;
    }

    this.loading = true;
    let result: any = await this.accountingService.getBaoCaoTongHop(param);
    this.loading = false;
    if (result.statusCode == 200) {
      this.listData = result.baoCaoDoanhThu;
    } else {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }


  refreshFilter() {
    this.listNhomDichVuSelected = [];
    this.listDichVuSelected = [];
    this.listLoaiDoanhThuSelected = [];
    this.listPhanHangKhachHangSelected = [];
    this.listKhachHangSelected = [];
    this.listGoiDichVuSelected = [];
    this.listLoaiNhanVienSelected = [];
    this.listChucVuSelected = [];
    this.tuNgay = null;
    this.denNgay = null;
    this.doanhThuTu = null;
    this.doanhThuDen = null;
    this.resetTable();
    this.getBaoCaoTongHop();
  }

  resetTable() {
    if (this.myTable) {
      this.myTable.reset();
    }
  }

  leftColNumber: number = 12;
  rightColNumber: number = 0;
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

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  clearToast() {
    this.messageService.clear();
  }

  viewDetail(rowData, type) {
    let url;
    //Phiếu yêu cầu
    if (type == 1) url = this.router.serializeUrl(this.router.createUrlTree(['order/create', { OrderId: rowData.customerOrderId }]));
    //Phiếu hỗ trợ
    if (type == 2) url = this.router.serializeUrl(this.router.createUrlTree(['order/create', { OrderId: rowData.orderActionId }]));
    // Khách hàng
    if (type == 3) url = this.router.serializeUrl(this.router.createUrlTree(['/order/create', { customerId: rowData.customerId }]));
    // Nhân viên
    if (type == 4) url = this.router.serializeUrl(this.router.createUrlTree(['/employee/detail', { employeeId: rowData.employeeId, contactId: rowData.contactId }]));
    window.open(url, '_blank');
  }

  exportExcel() {
    let title = this.baoCaoSelected.name;
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);
    worksheet.pageSetup.margins = {
      left: 0.25, right: 0.25,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    };
    worksheet.pageSetup.paperSize = 9;  //A4 : 9

    let dataHeaderRow1 = this.listCol.map(x => x.header);
    let headerRow1 = worksheet.addRow(dataHeaderRow1);

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
    headerRow1.height = 32;


    let listColNumber = ["doanhThuTuKH", "thanhToanNcc", "tongTienKh", "thanhToanChoNcc",
      "tongTienThanhToanNcc", "tongTienHoaHong", "tongSoLanDatDichVu",
      "thanhToanHoaHong", "hoaHongNhanVe", "tongDoanhThu"];

    let data: Array<any> = [];
    this.listData.forEach((item, index) => {
      let row: Array<any> = [];
      this.listCol.forEach((col, indexCol) => {
        if (listColNumber.includes(col.field) && item[col.field]) {
          row[indexCol] = this.decimalPipe.transform(item[col.field]).toString();
        }
        else if (col.field == "ngayDatHang" && item[col.field]) {
          row[indexCol] = this.datePipe.transform(item[col.field], "dd/MM/yyyy");
        }
        else if (col.field == "dichVu" || col.field == "goiDichVu") {
          row[indexCol] = item[col.field] != null ? item[col.field].split('<br>').join('\n') : "";
        } else {
          row[indexCol] = item[col.field] ?? "";
        }
      });
      data.push(row);
    });

    data.forEach((el) => {
      let row = worksheet.addRow(el);
      row.font = { name: 'Times New Roman', size: 11 };
      this.listCol.forEach((col, indexCol) => {
        row.getCell(indexCol + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(indexCol + 1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        if (indexCol == 0) row.getCell(indexCol + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        if (col.field == "dichVu" || col.field == "goiDichVu") row.getCell(indexCol + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });

    /* fix with for column */
    this.listCol.forEach((col, indexCol) => {
      if (indexCol == 0) worksheet.getColumn(indexCol + 1).width = 30;
      if (indexCol != 0) worksheet.getColumn(indexCol + 1).width = 22;
      if (col.field == "dichVu" || col.field == "goiDichVu") worksheet.getColumn(indexCol + 1).width = 35;
    });

    this.exportToExel(workbook, title);
  }

  exportToExel(workbook: Workbook, fileName: string) {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
