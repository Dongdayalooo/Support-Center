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
    // { index: 1, name: "Doanh thu theo đơn dịch vụ" },
    // { index: 2, name: "Doanh thu theo khách hàng" },
    // { index: 3, name: "Doanh thu theo nhân viên" },
  ];

  baoCaoSelected = { index: 0, name: "Doanh thu tổng hợp" };
  listCol = [];

  listNhomDichVu = [];
  listDichVu = [];
  listLoaiDoanhThu = [];
  listGoiDichVu = [];

  //Selected
  listNhomDichVuSelected = [];
  listDichVuSelected = [];
  listLoaiDoanhThuSelected = [];
  listGoiDichVuSelected = [];
  tuNgay: Date;
  denNgay: Date;
  doanhThuTu: number;
  doanhThuDen: number;


  constructor(
    private router: Router,
    private getPermission: GetPermission,
    private messageService: MessageService,
    private accountingService: AccountingService,

  ) {
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    // Define the resource path
    let resource = "acc/accounting/bao-cao-doanh-thu";
    // Kiểm tra quyền truy cập tài nguyên của người dùng
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      // Nếu người dùng có quyền, trích xuất các hành động có sẵn từ đối tượng quyền
      // let listCurrentActionResource = permission.listCurrentActionResource;
      // // Kiểm tra xem hành động 'thêm' có được phép hay không, nếu không, hãy tắt chức năng 'thêm'
      // if (listCurrentActionResource.indexOf("add") == -1) {
      //   this.actionAdd = false;
      // }
      // // Kiểm tra xem hành động 'tải xuống' có được phép hay không, nếu không, hãy tắt chức năng 'tải xuống'
      // if (listCurrentActionResource.indexOf("download") == -1) {
      //   this.actionDownload = false;
      // }
      // Lấy dữ liệu cần thiết cho chức năng
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
      this.listGoiDichVu = result.listGoiDichVu;
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
    this.listGoiDichVuSelected = [];
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

}

function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};
