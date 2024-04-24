import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, FormControl, ValidatorFn, AbstractControl, } from '@angular/forms';
import { CategoryService } from "../../../../shared/services/category.service";
import { EmployeeService } from "../../../../employee/services/employee.service";
import { WarningComponent } from '../../../../shared/toast/warning/warning.component';
import { AccountingService } from "../../../services/accounting.service";
import { VendorService } from "../../../../vendor/services/vendor.service";
import { AuthenticationService } from "../../../../shared/services/authentication.service";
import { GetPermission } from '../../../../shared/permission/get-permission';
import { Table } from 'primeng/table';
import { SortEvent } from 'primeng/api';
import * as moment from 'moment';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import 'moment/locale/pt-br';
import { DecimalPipe } from '@angular/common';
import { CustomerService } from '../../../../customer/services/customer.service';

interface Category {
  categoryId: string,
  categoryName: string,
  categoryCode: string
}

interface CashPayment {
  payableInvoiceId: string;
  payableInvoiceCode: string;
  payableInvoiceDetail: string;
  payableInvoicePrice: number;
  payableInvoicePriceCurrency: string;
  payableInvoiceReason: string;
  payableInvoiceNote: string;
  registerType: string;
  organizationId: string;
  statusId: string;
  recipientName: string;
  recipientAddress: string;
  unitPrice: number;
  currencyUnit: string;
  exchangeRate: number;
  amount: number;
  amountText: string;
  active: boolean;
  createdById: string;
  createdDate: string;
  paidDate: string;
  updatedById: string;
  updatedDate: string;
  objectId: string;
  payableInvoiceReasonText: string;
  avatarUrl: string;
  createdByName: string;
  vouchersDate: string;
  backgroundColorForStatus: string;
  objectName: string;
  statusName: string;
}


@Component({
  selector: 'app-cash-payments-list',
  templateUrl: './cash-payments-list.component.html',
  styleUrls: ['./cash-payments-list.component.css'],
  providers: [
    DecimalPipe,
    DatePipe
  ]
})

export class CashPaymentsListComponent implements OnInit {

  listCashPayableInvoice: Array<CashPayment> = [];
  filterForm: FormGroup;
  userPermission: any = localStorage.getItem("UserPermission").split(',');
  auth: any = JSON.parse(localStorage.getItem("auth"));

  filterGlobar: string;
  actionAdd: boolean = true;
  actionDownload: boolean = true;
  loading: boolean = false;
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  minYear: number = 2000;
  currentYear: number = (new Date()).getFullYear();
  maxEndDate: Date = new Date();
  payerList: Array<any> = [];
  payer: string = '';

  listReason: Array<any> = [];
  listStatus: Array<any> = [];
  listEmployee: Array<any> = [];

  payableInvoiceCode: string = '';
  payableInvoiceReasonIds: any;
  objectIds: Array<any> = [];
  createdByIds: Array<any> = [];
  fromDate: Date = null;
  toDate: Date = null;
  statusIds: Array<any> = [];
  nowDate: Date = new Date();

  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");

  @ViewChild('myTable') myTable: Table;
  colsList: any;
  selectedColumns: any[];
  frozenCols: any[];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private accountingService: AccountingService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private authenticationService: AuthenticationService,
    private vendorService: VendorService,
    private employeeService: EmployeeService,
    private customerService: CustomerService,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private decimalPipe: DecimalPipe,
  ) {
    translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    let resource = "acc/accounting/cash-payments-list/";
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
      this.loading = true;
      this.initTable();
      await this.getMasterData();
      this.loading = false;
    }
  }

  initTable() {
    this.colsList = [
      { field: 'payableInvoiceCode', header: 'Mã chứng từ', textAlign: 'left', display: 'table-cell' },
      { field: 'payableInvoiceReasonText', header: 'Lý do chi', textAlign: 'left', display: 'table-cell' },
      { field: 'payableInvoiceDetail', header: 'Nội dung chi', textAlign: 'left', display: 'table-cell' },
      { field: 'objectName', header: 'Đối tượng chi', textAlign: 'left', display: 'table-cell' },
      { field: 'amount', header: 'Số tiền(VNĐ)', textAlign: 'right', display: 'table-cell' },
      { field: 'createdDate', header: 'Ngày tạo', textAlign: 'right', display: 'table-cell' },
      { field: 'statusName', header: 'Trạng thái', textAlign: 'center', display: 'table-cell' },
      { field: 'createdByName', header: 'Người tạo', textAlign: 'left', display: 'table-cell' },
    ];
    this.selectedColumns = this.colsList;
  }

  goToCreate() {
    this.router.navigate(['/accounting/cash-payments-create']);
  }

  goToDetail(rowData: any) {
    this.router.navigate(['/accounting/cash-payments-view', { payableInvoiceId: rowData.payableInvoiceId }]);
  }

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

  leftColNumber: number = 12;
  rightColNumber: number = 0;
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

  async getMasterData() {
    await this.accountingService.getMasterDataPayableInvoiceSearch().subscribe(response => {
      const result = <any>response;

      this.listStatus = result.statusOfPaymentList;

      this.listReason = result.reasonOfPaymentList;

      this.listEmployee = result.lstUserEntityModel;

      this.searchPayableInvoice();
    }, error => { })
  }

  changeReasonPay(value: any) {
    this.payerList = [];
    this.loading = true;
    this.payer = '';
    this.objectIds = [];
    this.categoryService.getCategoryById(value.categoryId).subscribe(response => {
      const result = <any>response;
      this.loading = false;
      this.payer = result.category.categoryCode;
      if (this.payer === 'CVI') {
        this.loading = true;
        this.employeeService.searchEmployee('', '', '', '', [], '').subscribe(response1 => {
          const result1 = <any>response1;
          this.loading = false;
          this.payerList = result1.employeeList;
          this.payerList.forEach(item => {
            item.employeeName = item.employeeCode + ' - ' + item.employeeName;
          });
        }, error => { });
      } else if (this.payer === 'CTA') {
        this.loading = true;
        this.vendorService.getAllVendorToPay().subscribe(response2 => {
          const result2 = <any>response2;
          this.loading = false;
          this.payerList = result2.vendorList;
          this.payerList.forEach(item => {
            item.vendorName = item.vendorCode + ' - ' + item.vendorName;
          });
        }, error => { });
      } else if (this.payer === 'CHA') {
        this.loading = true;
        this.customerService.getAllCustomer().subscribe(response3 => {
          const result3 = <any>response3;
          this.loading = false;
          this.payerList = result3.customerList;
          this.payerList.forEach(item => {
            item.customerName = item.customerCode + ' - ' + item.customerName;
          });
        }, error => { });
      } else {
        this.payerList = [];
        this.payer = '';
      }
    }, error => { });
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  searchPayableInvoice() {
    if (this.payableInvoiceCode) {
      this.payableInvoiceCode = this.payableInvoiceCode.trim();
    }
    let listPayableInvoiceReasonIds: Array<string> = [];
    if (this.payableInvoiceReasonIds) {
      listPayableInvoiceReasonIds.push(this.payableInvoiceReasonIds.categoryId);
    } else {
      listPayableInvoiceReasonIds = this.payableInvoiceReasonIds;
    }

    let listObjectIds: Array<string> = [];
    if (this.payer === 'CVI') {
      listObjectIds = this.objectIds.map(x => x.employeeId);
    } else if (this.payer == 'CTA') {
      listObjectIds = this.objectIds.map(x => x.vendorId);
    } else if (this.payer === 'CHA') {
      listObjectIds = this.objectIds.map(x => x.customerId);
    } else {
      listObjectIds = this.objectIds.map(x => x.objectIds);
    }

    let listCreatedByIds: Array<string> = [];
    listCreatedByIds = this.createdByIds.map(x => x.employeeId);

    let fromDate = null;
    if (this.fromDate) {
      fromDate = this.fromDate;
      fromDate.setHours(0, 0, 0, 0);
      fromDate = convertToUTCTime(fromDate);
    }

    let toDate = null;
    if (this.toDate) {
      toDate = this.toDate;
      toDate.setHours(23, 59, 59, 999);
      toDate = convertToUTCTime(toDate);
    }

    let listStatusIds: Array<string> = [];
    listStatusIds = this.statusIds.map(x => x.categoryId);

    this.loading = true;
    this.accountingService.searchPayableInvoice(this.auth.UserId, this.payableInvoiceCode, listPayableInvoiceReasonIds,
      listCreatedByIds, fromDate, toDate, listStatusIds, listObjectIds).subscribe(response => {
        var result = <any>response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.listCashPayableInvoice = result.payableInvList;
          if (this.listCashPayableInvoice.length == 0) {
            let msg = { severity: 'warn', summary: 'Thông báo:', detail: 'Không tìm thấy phiếu chi nào!' };
            this.showMessage(msg);
          }
          else {
            this.listCashPayableInvoice.forEach(item => {
              item.createdDate = this.datePipe.transform(item.createdDate, 'dd/MM/yyyy');
            });
          }
        } else {
          let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
  }

  refreshFilter() {
    this.payableInvoiceCode = '';
    this.payableInvoiceReasonIds = null;
    this.objectIds = [];
    this.fromDate = null;
    this.toDate = null;
    this.statusIds = [];
    this.createdByIds = [];
    this.payer = '';
    this.listCashPayableInvoice = [];
    this.filterGlobar = '';
    this.isShowFilterLeft = false;
    this.leftColNumber = 12;
    this.rightColNumber = 0;
    this.searchPayableInvoice();
  }

  exportExcel() {
    let title = "Danh sách phiếu chi tiền mặt";
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);
    let dataHeaderRow = ['STT', 'Mã chứng từ', 'Lý do chi', 'Nội dụng thu', 'Đối tượng chi', 'Số tiền', 'Ngày tạo', 'Người tạo', 'Trạng thái'];
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
    headerRow.height = 38;

    let data: Array<any> = [];

    this.listCashPayableInvoice.forEach((item, index) => {
      let row: Array<any> = [];
      row[0] = index + 1;
      row[1] = item.payableInvoiceCode.toString();
      row[2] = item.payableInvoiceReasonText.toString();
      row[3] = item.payableInvoiceDetail.toString();
      row[4] = item.objectName.toString();
      row[5] = this.decimalPipe.transform(item.amount).toString();
      row[6] = item.createdDate.toString();
      row[7] = item.createdByName.toString();
      row[8] = item.statusName.toString();
      data.push(row);
    });

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
    });

    /* fix with for column */
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 25;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 25;
    worksheet.getColumn(9).width = 15;

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
