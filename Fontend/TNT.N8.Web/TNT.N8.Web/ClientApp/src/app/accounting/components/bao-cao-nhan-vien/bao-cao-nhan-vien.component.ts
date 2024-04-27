import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WarningComponent } from '../../../shared/toast/warning/warning.component';
import { TranslateService } from '@ngx-translate/core';
import { GetPermission } from '../../../shared/permission/get-permission';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import 'moment/locale/pt-br';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { EmployeeService } from '../../../employee/services/employee.service';

@Component({
  selector: 'app-bao-cao-nhan-vien',
  templateUrl: './bao-cao-nhan-vien.component.html',
  styleUrls: ['./bao-cao-nhan-vien.component.css'],
  providers: [
    DatePipe,
    DecimalPipe
  ]
})
export class BaoCaoNhanVienComponent implements OnInit {
  listEmp: Array<any> = [];
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  auth: any = JSON.parse(localStorage.getItem("auth"));

  actionAdd: boolean = true;
  actionDownload: boolean = true;
  loading: boolean = false;
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  @ViewChild('myTable', { static: false }) myTable: any;


  listEmployee: Array<any> = [];

  leftColNumber: number = 12;
  rightColNumber: number = 0;
  filterGlobal: string;

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  warningConfig: MatSnackBarConfig = { panelClass: 'warning-dialog', horizontalPosition: 'end', duration: 5000 };
  /*Check user permission*/


  employeeType: number = 1; //1: Nhân viên, 2: Công tác viên
  listEmpSelected = [];
  listAllEmp = [];
  tuNgay: Date = new Date();
  denNgay: Date = new Date();

  constructor(
    private translate: TranslateService,
    private getPermission: GetPermission,
    public snackBar: MatSnackBar,
    private router: Router,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private employeeService: EmployeeService,
    private decimalPipe: DecimalPipe,
  ) {
    this.translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    let resource = "acc/accounting/bao-cao-nhan-vien";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.snackBar.openFromComponent(WarningComponent, { data: "Bạn không có quyền truy cập vào đường dẫn này vui lòng quay lại trang chủ", ...this.warningConfig });
      this.router.navigate(['/home']);
    }
    else {
      await this.searchData();
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  listColRow1 = [];
  listColRow = [];

  listColRow2 = [];

  async searchData() {
    this.loading = true;

    if (this.tuNgay > this.denNgay) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Ngày bắt đầu không được lớn hơn ngày kết thúc!" };
      this.showMessage(msg);
      return;
    }
    let param = {
      employeeType: parseInt(this.employeeType.toString()),
      listEmpId: this.listEmpSelected ? this.listEmpSelected.map(x => x.employeeId) : [],
      tuNgay: convertToUTCTime(new Date(this.tuNgay)),
      denNgay: convertToUTCTime(new Date(this.denNgay)),
    };

    let result: any = await this.employeeService.baoCaoNhanVien(param);
    console.log("result", result)
    this.loading = false;
    if (result.statusCode == 200) {
      this.listAllEmp = result.listAllEmp;
      this.listColRow1 = result.listColField1;
      this.listColRow2 = result.listColField.filter(x =>
        x.key.includes("tongDoanhThuKH") || x.key.includes("mucThuong") ||
        x.key.includes("khuyenKhich") || x.key.includes("mucThuongDuKien") || x.key.includes("khuyenKhichDuKien"));
      this.listColRow = result.listColField;
      this.listEmp = result.listEmp;
      if (this.myTable) this.myTable.first = 0;
    } else {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
      this.showMessage(msg);
    }
  }


  refreshFilter() {
    this.listEmpSelected = null;
    this.tuNgay = new Date();
    this.denNgay = new Date();

    this.filterGlobal = '';
    this.listEmp = [];
    this.isShowFilterLeft = false;
    this.leftColNumber = 12;
    this.rightColNumber = 0;
    this.searchData();
  }


  showFilter() {
    if (this.innerWidth < 1024) {
      this.isShowFilterTop = !this.isShowFilterTop;
    } else {
      this.isShowFilterLeft = !this.isShowFilterLeft;
      if (this.isShowFilterLeft) {
        this.leftColNumber = 9;
        this.rightColNumber = 3;
      } else {
        this.leftColNumber = 12;
        this.rightColNumber = 0;
      }
    }
  }

  onViewDetail(rowData: any) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/employee/detail', { employeeId: rowData.employeeId, contactId: rowData.contactId }])
    );
    window.open(url, '_blank');
  }


  exportExcel() {
    let title = "Báo cáo " + (this.employeeType == 1 ? "nhân viên" : "cộng tác viên");
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);

    let startMergeIndex = 5;
    let soLanMerge = 0;
    let dataHeaderRow1 = []
    this.listColRow1.forEach((item, index) => {
      dataHeaderRow1.push(item.name)
      if (item.name.includes("Tháng")) {
        soLanMerge++;
        dataHeaderRow1.push("");
        dataHeaderRow1.push("");
        dataHeaderRow1.push("");
        dataHeaderRow1.push("");
      }
    });

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


    let dataHeaderRow = this.listColRow.map(x => x.name);

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

      if (index + 1 < 5 || index + 1 > startMergeIndex * soLanMerge + 4) {
        worksheet.mergeCells(headerRow1.getCell((index + 1)).address, headerRow.getCell(index + 1).address);
      }
    });
    headerRow.height = 32;

    for (let i = 1; i <= soLanMerge; i++) {
      worksheet.mergeCells(headerRow1.getCell(startMergeIndex * i).address, headerRow1.getCell(startMergeIndex * i + 4).address);
    }

    let data: Array<any> = [];
    this.listEmp.forEach((item, index) => {
      let row: Array<any> = [];
      this.listColRow.forEach((col, indexCol) => {
        row[indexCol] = item[col.key];
        if(indexCol != 0) row[indexCol] = this.decimalPipe.transform(item[col.key]).toString();
      });
      data.push(row);
    });

    data.forEach((el) => {
      let row = worksheet.addRow(el);
      row.font = { name: 'Times New Roman', size: 11 };

      this.listColRow.forEach((col, indexCol) => {
        row.getCell(indexCol + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        row.getCell(indexCol + 1).alignment = { vertical: 'middle', horizontal: 'center' };
        if (indexCol == 0) row.getCell(indexCol + 1).alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    /* fix with for column */
    dataHeaderRow1.forEach((col, indexCol) => {
      if(indexCol == 0) worksheet.getColumn(indexCol + 1).width = 30;
      if(indexCol != 0) worksheet.getColumn(indexCol + 1).width = 22;
    });

    this.exportToExel(workBook, title);
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

