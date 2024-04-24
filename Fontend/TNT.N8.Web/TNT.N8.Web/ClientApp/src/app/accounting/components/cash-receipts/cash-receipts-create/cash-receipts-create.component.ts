import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterContentChecked, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, ValidatorFn, AbstractControl, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../../shared/services/category.service';
import { OrganizationService } from '../../../../shared/services/organization.service';
import { CashReceiptModel } from '../../../models/cashReceipt.model';
import { AccountingService } from '../../../services/accounting.service';
import { DatePipe } from '@angular/common';

import * as $ from 'jquery';
import { CashReceiptMappingModel } from '../../../models/cashReceiptMapping.model';
import { EmployeeService } from '../../../../employee/services/employee.service';
import { CustomerService } from '../../../../customer/services/customer.service';
import { VendorService } from '../../../../vendor/services/vendor.service';
import { ValidatorsCommon } from '../../../../shared/CustomValidation/ValidationCommon';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { CustomerOrderService } from '../../../../order/services/customer-order.service';

import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { DecimalPipe } from '@angular/common';
import { OrganizationDialogComponent } from '../../../../shared/components/organization-dialog/organization-dialog.component';
import { PhieuThuBaoCoMappingCustomerOrderModel } from '../../../../../../src/app/shared/models/bankReceiptInvoiceMappingCustomerOrder.model';

interface Category {
  categoryId: string,
  categoryName: string,
  categoryCode: string,
}

interface Customer {
  customerId: string;
  customerCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fullAddress: string;
  paymentId: string;
  maximumDebtDays: number;
  maximumDebtValue: number;
}

interface Order {
  orderId: string,
  orderCode: string,
  amountCollected: string,  //Số tiền nhận
  amountReceivable: number, //Số phải tiền phải thu
  total: number,
  orderDate: Date,
  error: boolean
}

@Component({
  selector: 'app-cash-receipts-create',
  templateUrl: './cash-receipts-create.component.html',
  styleUrls: ['./cash-receipts-create.component.css'],
  providers: [
    DecimalPipe,
  ]
})
export class CashReceiptsCreateComponent implements OnInit, AfterContentChecked {
  awaitResult: boolean = false;
  typesOfReceipt: Array<any> = [];
  organizationList: Array<any> = [];
  statusOfReceipt: Array<any> = [];
  unitMoney: Array<any> = [];
  auth: any = JSON.parse(localStorage.getItem('auth'));
  currentUserName: string = localStorage.getItem('Username') + '-' + localStorage.getItem('UserFullName');
  currentDate: Date = new Date();
  cashReceiptModel = new CashReceiptModel();
  cashReceiptMappingModel = new CashReceiptMappingModel();
  reasonOfReceipt: any[];
  receipter: any;
  receipterList: Array<any> = [];
  currencyCode: any;
  isShowExchangeRate = false;
  isShowPriceForeign = false;
  priceForeign: number;
  currencyLabel: string = 'VND';
  listCurrency: Array<MenuItem> = [];

  cols: any[] = [
    { field: 'orderCode', header: 'Mã đơn hàng', width: '15%', textAlign: 'left', color: '#f44336' },
    { field: 'amountCollected', header: 'Thanh toán', width: '20%', textAlign: 'right', color: '#f44336' },
    { field: 'amountReceivable', header: 'Số phải thu', width: '20%', textAlign: 'right', color: '#f44336' },
    { field: 'amount', header: 'Tổng giá trị đơn hàng', width: '25%', textAlign: 'right', color: '#f44336' },
    { field: 'createdDate', header: 'Ngày mua', width: '20%', textAlign: 'center', color: '#f44336' }
  ];

  cols1: any[] = [
    { field: 'vendorOrderCode', header: 'Mã đơn hàng', width: '35%', textAlign: 'left', color: '#f44336' },
    { field: 'amountCollected', header: 'Thanh toán', width: '20%', textAlign: 'right', color: '#f44336' },
    { field: 'tongTienHoaHong', header: 'Số phải thu', width: '20%', textAlign: 'right', color: '#f44336' },
    { field: 'createdDate', header: 'Ngày mua', width: '20%', textAlign: 'center', color: '#f44336' }
  ];

  createReceiptForm: FormGroup;
  reasonControl: FormControl = new FormControl('');
  registerTypeControl: FormControl = new FormControl('');
  receipters: FormControl = new FormControl('', [Validators.required]);
  organizationName: FormControl = new FormControl('', [Validators.required]);
  status: FormControl = new FormControl('', [Validators.required]);
  receiptDate: FormControl = new FormControl(new Date(), [Validators.required, ValidatorsCommon.formatDate]);
  voucherDate: FormControl = new FormControl(new Date(), [Validators.required, ValidatorsCommon.formatDate]);
  receiptName: FormControl = new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]);
  recipientAddressControl: FormControl = new FormControl('', [Validators.maxLength(250), forbiddenSpaceText]);
  content: FormControl = new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]);
  unitPrice: FormControl = new FormControl('0', [Validators.required]);
  exchangeRate: FormControl = new FormControl('1', [Validators.required]);
  noteControl: FormControl = new FormControl('');
  isSendMailControl: FormControl = new FormControl(true);


  loading: boolean = false;
  actionAdd: boolean = true;
  isCheckAmountGreater: boolean = false;
  isShowAllocation: boolean = false;
  listOrder: Array<any> = [];
  isAllocationFollowMoney: boolean = true;

  totalAmountReceivable: number = 0;
  maxVouchersDate: Date = new Date();
  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();

  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('save') save: ElementRef;

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

  colLeft: number = 9;
  isShow: boolean = true;
  isSendMail: boolean = true;

  //1: phiếu yêu cầu, 2: Đơn hàng
  type: number = 1;
  customerId: string = null;
  orderId: string = null;

  listSelectedCustomerOrder = [];


  vendorOrderId: string = null;
  vendorId: string = null;


  constructor(
    private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private accountingService: AccountingService,
    private employeeService: EmployeeService,
    private customerService: CustomerService,
    private decimalPipe: DecimalPipe,
    private vendorService: VendorService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private renderer: Renderer2,
    public dialogService: DialogService,
    private customerOrderService: CustomerOrderService,
  ) {

  }


  async ngOnInit() {
    this.setForm();
    let resource = "acc/accounting/cash-receipts-create/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Thông báo:', detail: 'Bạn không có quyền truy cập vào đường dẫn này vui lòng quay lại trang chủ' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      this.route.params.subscribe(params => {
        this.customerId = params['customerId'];
        this.orderId = params['orderId'];
        this.type = params['type']; // 1:Phiếu yêu cầu, 2: Đơn hàng


        this.vendorOrderId = params['vendorOrderId'];
        this.vendorId = params['vendorId'];
      });

      await this.getMasterData();
    }
  }

  setForm() {
    this.createReceiptForm = this.formBuilder.group({
      reasonControl: this.reasonControl,
      registerTypeControl: this.registerTypeControl,
      receipters: this.receipters,
      organizationName: this.organizationName,
      status: this.status,
      receiptDate: this.receiptDate,
      voucherDate: this.voucherDate,
      receiptName: this.receiptName,
      recipientAddressControl: this.recipientAddressControl,
      content: this.content,
      unitPrice: this.unitPrice,
      exchangeRate: this.exchangeRate,
      noteControl: this.noteControl,
      isSendMailControl: this.isSendMailControl,
    });
  }

  ngAfterContentChecked(): void {
    this.ref.detectChanges();
  }

  async getMasterData() {
    this.loading = true;
    var result: any = await this.accountingService.getMasterDataReceiptInvoice();
    this.reasonOfReceipt = result.listReason;

    // TKH: Thu khác
    // TTA: Thu tiền Ncc
    // THA: Thu tiền KH
    // TVI: Thu tiền nhân viên

    this.reasonOfReceipt.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    this.typesOfReceipt = result.typesOfReceiptList;
    this.typesOfReceipt.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    this.statusOfReceipt = result.listStatus;

    this.unitMoney = result.unitMoneyList;
    this.organizationList = result.organizationList;

    this.receipterList.forEach(item => {
      item.customerName = item.customerCode + ' - ' + item.customerName;
    });

    this.unitMoney.forEach(item => {
      let optionMenu: MenuItem = {
        label: item.categoryCode,
        command: () => {
          this.currencyLabel = item.categoryCode;
          this.setExchangeRate();
        }
      }
      this.listCurrency.push(optionMenu);
    });

    this.setDefaultValue();
    this.loading = false;
  }

  setDefaultValue() {
    //Trạng thái
    const toSelectOrderStatus = this.statusOfReceipt.find(stt => stt.categoryCode === "DSO");
    this.createReceiptForm.controls['status'].setValue(toSelectOrderStatus);

    //Set giá trị mặc định cho Đơn vị tiền:
    const toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === 'VND');
    this.currencyLabel = toSelectMoneyUnit.categoryCode;

    //Lý do thu và Đối tượng thu
    if (this.customerId) {
      const reasonCode = this.reasonOfReceipt.find(r => r.categoryCode === 'THA');
      this.createReceiptForm.controls['reasonControl'].setValue(reasonCode);
      this.receipter = 'THA';
      this.changeReasonPay(this.reasonControl.value);

    } else if (this.vendorId) {
      const reasonCode = this.reasonOfReceipt.find(r => r.categoryCode === 'TTA');
      this.createReceiptForm.controls['reasonControl'].setValue(reasonCode);
      this.receipter = 'TTA';
      this.changeReasonPay(this.reasonControl.value);

    }

    //Set giá trị mặc định cho Tỷ giá:
    this.createReceiptForm.controls['exchangeRate'].setValue(1);
    this.createReceiptForm.controls['exchangeRate'].setValidators(null);
    this.createReceiptForm.controls['exchangeRate'].updateValueAndValidity();

    //Nơi chi
    const org = this.organizationList.find(o => o.parentId === null);
    this.cashReceiptModel.OrganizationId = org.organizationId;
    this.createReceiptForm.controls['organizationName'].setValidators(null);
    this.createReceiptForm.controls['organizationName'].setValue(org.organizationName);
    this.createReceiptForm.controls['organizationName'].updateValueAndValidity();

    //Loại sổ
    this.createReceiptForm.controls['registerTypeControl'].setValue("");
    this.createReceiptForm.controls['registerTypeControl'].updateValueAndValidity();

  }



  tinhSoTien() {
    this.unitPrice.setValue(0);
    this.totalAmountReceivable = 0;

    //Nếu là KH thanh toán tiền
    if (this.receipter == 'THA') {
      if (this.listSelectedCustomerOrder != null && this.listSelectedCustomerOrder.length > 0) {
        let sum = this.listSelectedCustomerOrder.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.amount
        }, 0);
        this.unitPrice.setValue(sum);
        this.totalAmountReceivable = sum;
        this.cashReceiptModel.Amount = sum;
      }
    }
    //Nếu Ncc thanh toán
    else if (this.receipter == 'TTA') {
      if (this.listOrder != null && this.listOrder.length > 0) {
        let sum = this.listOrder.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.tongTienHoaHong
        }, 0);
        this.unitPrice.setValue(sum);
        this.totalAmountReceivable = sum;
        this.cashReceiptModel.Amount = sum;
      }
    }
  }

  // tslint:disable-next-line:member-ordering
  price: number;
  // convenience getter for easy access to form fields
  get f() { return this.createReceiptForm.controls; }

  createReceipt() {
    if (!this.createReceiptForm.valid) {
      Object.keys(this.createReceiptForm.controls).forEach(key => {
        if (this.createReceiptForm.controls[key].valid == false) {
          this.createReceiptForm.controls[key].markAsTouched();
        }
      });

      let mgs = { severity: 'error', summary: 'Thông báo:', detail: 'Vui lòng nhập đầy đủ thông tin!' };
      this.showMessage(mgs);
      return;
    }

    this.cashReceiptModel.ReceiptInvoiceReason = this.reasonControl.value.categoryId;

    this.cashReceiptModel.RegisterType = this.registerTypeControl.value.categoryId;

    this.cashReceiptModel.DoiTuong = this.receipter;



    let receipter = this.receipters.value;
    if (this.receipter === 'THA') {
      this.cashReceiptMappingModel.ObjectId = receipter ? receipter.customerId : null;
    } else if (this.receipter === 'TTA') {
      this.cashReceiptMappingModel.ObjectId = receipter ? receipter.vendorId : null;
    } else {
      this.cashReceiptMappingModel.ObjectId = receipter ? receipter.employeeId : null;
    }

    //Trạng thái
    let status = this.status.value;
    this.cashReceiptModel.StatusId = status ? status.categoryId : null;

    //Ngày hạch toán
    let paidDate = this.receiptDate.value;
    paidDate = convertToUTCTime(paidDate);
    this.cashReceiptModel.ReceiptDate = paidDate;

    // Ngày chứng từ
    let vouchersDate = this.voucherDate.value;
    vouchersDate = convertToUTCTime(vouchersDate);
    this.cashReceiptModel.VouchersDate = vouchersDate;

    //Nội dung
    this.cashReceiptModel.ReceiptInvoiceDetail = this.content.value.trim();

    this.cashReceiptModel.RecipientName = this.receiptName.value.trim();

    this.cashReceiptModel.RecipientAddress = this.recipientAddressControl.value ? this.recipientAddressControl.value.trim() : '';

    this.cashReceiptModel.ReceiptInvoiceNote = this.noteControl.value ? this.noteControl.value.trim() : '';

    this.cashReceiptModel.IsSendMail = this.isSendMail;
    //Loại tiền (VND, USD,...)
    let toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === this.currencyLabel);
    this.cashReceiptModel.CurrencyUnit = toSelectMoneyUnit.categoryId;

    //Tiền (chưa tính tỷ giá)
    this.cashReceiptModel.UnitPrice = this.unitPrice.value;

    //Tỷ giá
    this.cashReceiptModel.ExchangeRate = this.exchangeRate.value;

    this.cashReceiptModel.Amount = this.unitPrice.value * (this.exchangeRate.value ?? 1);


    //Từ NCC thanh toán (thu tiền từ Ncc)
    if (this.receipter == 'TTA') {
      if (this.listOrder.find(x => x.error == true)) {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: 'Số tiền thu không được lớn hơn số tiền phải thu, vui lòng kiểm tra danh sách đơn hàng!' };
        this.showMessage(mgs);
        return;
      }
    }

    var listMapping: PhieuThuBaoCoMappingCustomerOrderModel[] = [];

    //nẾU không phải là thu tiền Ncc
    if (this.receipter != 'TTA') {
      this.listSelectedCustomerOrder.forEach(item => {
        var data = new PhieuThuBaoCoMappingCustomerOrderModel();
        data.orderId = item.orderId;
        data.orderCode = item.orderCode;
        data.amount = item.amount;
        data.objectType == 2;//Phiếu thu
        data.listPacketServiceName = item.listPacketServiceName;
        data.orderTypeName = item.orderTypeName;
        data.createdDate = item.createdDate;
        listMapping.push(data);
      });
    } else {
      this.listOrder.forEach(item => {
        if (item.amountCollected <= item.tongTienHoaHong) {
          var data = new PhieuThuBaoCoMappingCustomerOrderModel();
          data.vendorOrderId = item.vendorOrderId;
          data.orderCode = item.vendorOrderCode;
          data.amount = item.amountCollected;
          data.objectType == 2;//Phiếu thu
          data.listPacketServiceName = item.listPacketServiceName;
          data.orderTypeName = item.orderTypeName;
          data.createdDate = item.createdDate;
          listMapping.push(data);
        }
      });
    }

    if (listMapping.length == 0) {
      let mgs = { severity: 'error', summary: 'Thông báo:', detail: 'Vui lòng nhập thông tin thu ít nhất 1 đơn hàng!' };
      this.showMessage(mgs);
      return;
    }


    this.saveReceipt(listMapping);

  }

  saveReceipt(listMapping: Array<PhieuThuBaoCoMappingCustomerOrderModel>) {
    this.awaitResult = true;
    this.loading = true;
    this.accountingService.createReceiptInvoice(this.cashReceiptModel, this.cashReceiptMappingModel,
      this.auth.UserId, listMapping).subscribe(response => {
        const result = <any>response;
        this.loading = false;
        if (result.statusCode == 202 || result.statusCode == 200) {
          let mgs = { severity: 'success', summary: 'Thông báo:', detail: 'Tạo phiếu thu tiền mặt thành công' };
          this.showMessage(mgs);
          this.router.navigate(['/accounting/cash-receipts-view', { receiptInvoiceId: result.receiptInvoiceId }]);
        } else {
          let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(mgs);
          this.awaitResult = false;
        }
      }, error => { });
  }

  selectPaidDate() {
    let receiptDate: Date = this.receiptDate.value;
    this.maxVouchersDate = receiptDate;
    if (receiptDate < this.voucherDate.value) {
      this.voucherDate.setValue(receiptDate);
    }
  }

  resetFormAndModel() {
    this.setDefaultValue();
    this.createReceiptForm.reset();



    this.isShowExchangeRate = false;
    this.isShowPriceForeign = false;

    /*Reset model*/
    this.cashReceiptModel.RegisterType = null;  //Loại sổ
    this.cashReceiptMappingModel.ObjectId = null; //Đối tượng chi
    this.cashReceiptModel.RecipientName = null; //Người nhận
    this.cashReceiptModel.RecipientAddress = null; //Địa chỉ
    this.cashReceiptModel.ReceiptInvoiceDetail = null;  //Nội dung chi
    this.cashReceiptModel.UnitPrice = null; //Số tiền
    const toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === 'VND');
    this.cashReceiptModel.CurrencyUnit = toSelectMoneyUnit.categoryId; //Đơn vị tiền
    this.priceForeign = null; //Số tiền quy ra VND nếu đơn vị tiền không phải VND
    this.cashReceiptModel.ReceiptInvoiceNote = '';
    this.cashReceiptMappingModel.ObjectId = null;
    this.cashReceiptModel.Amount = null;
    this.listOrder = [];
    /*End*/
  }

  // Check Reason Pay Code
  changeReasonPay(value: Category) {
    this.receipterList = [];
    this.unitPrice.setValue(0);
    this.exchangeRate.setValue(1);
    this.cashReceiptModel.Amount = 0;
    // this.bankPaymentModel.OrganizationId = null;

    this.receipter = value.categoryCode;
    if (this.receipter == 'TVI') {
      this.receipters.setValue('');
      this.createReceiptForm.controls['receipters'].setValidators(Validators.required);
      this.createReceiptForm.controls['receipters'].updateValueAndValidity();
      this.loading = true;
      this.employeeService.searchEmployee('', '', '', '', [], '').subscribe(response1 => {
        const result1 = <any>response1;
        this.loading = false;
        this.receipterList = result1.employeeList;
        this.receipterList.forEach(item => {
          item.employeeName = item.employeeCode + ' - ' + item.employeeName;
        });
      }, error => { });
    } 
    else if (this.receipter == 'TTA') {
      this.receipters.setValue('');
      this.createReceiptForm.controls['receipters'].setValidators(Validators.required);
      this.createReceiptForm.controls['receipters'].updateValueAndValidity();

      this.loading = true;
      this.vendorService.getAllVendorToPay().subscribe(response2 => {
        const result2 = <any>response2;
        this.loading = false;
        this.receipterList = result2.vendorList;
        this.receipterList.forEach(item => {
          item.vendorName = item.vendorCode + ' - ' + item.vendorName;
        });

        if (this.vendorId && this.type == 2) {
          let vendor = this.receipterList.find(c => c.vendorId == this.vendorId);
          this.createReceiptForm.controls['receipters'].setValue(vendor);
          this.createReceiptForm.controls['receipters'].updateValueAndValidity();
          this.changeVendor(vendor);

          // Tính lại tiền khi thay đổi loại tiền tệ
          this.calculatorMoney();
        }
      }, error => { });
    } else if (this.receipter == 'THA') {
      this.receipters.setValue('');
      this.createReceiptForm.controls['receipters'].setValidators(Validators.required);
      this.createReceiptForm.controls['receipters'].updateValueAndValidity();

      this.loading = true;
      this.customerService.getAllCustomer().subscribe(response3 => {
        const result3 = <any>response3;
        this.loading = false;
        this.receipterList = result3.customerList;
        this.receipterList.forEach(item => {
          item.customerName = item.customerCode + ' - ' + item.customerName;
        });

        if (this.customerId && this.type == 1) {
          let customer: Customer = this.receipterList.find(c => c.customerId == this.customerId);
          this.createReceiptForm.controls['receipters'].setValue(customer);
          this.createReceiptForm.controls['receipters'].updateValueAndValidity();
          this.changeCustomer(customer);
        }
      }, error => { });
    } else {
      this.createReceiptForm.controls['receipters'].setValidators(null);
      this.createReceiptForm.controls['receipters'].updateValueAndValidity();
    }


  }

  displayCustomer(value: any) {
    return typeof value === 'string' ? value : (value == null ? '' : value.customerName);
  }

  private _filterCustomer(value: string, array: any) {
    return array.filter(state =>
      (state.customerName != null && state.customerName.toLowerCase().indexOf(value.toLowerCase()) >= 0) ||
      (state.customerCode != null && state.customerCode.toLowerCase().indexOf(value.toLowerCase()) >= 0)
    );
  }

  // Choose first item when press enter key
  chooseFirstOption(): void {
    //this.matAutocomplete.options.first.select();
  }

  async changeCustomer(value: Customer) {
    this.listOrder = [];
    if (value) {
      this.loading = true;
      var type = 2;
      let result: any = await this.accountingService.getOrderByCustomerIdAsync(this.auth.UserId, value.customerId, type);
      this.loading = false;
      if (result.statusCode == 200) {
        this.listOrder = result.listOrder;
        this.listSelectedCustomerOrder = this.listOrder.filter(x => x.orderId == this.orderId);
        this.tinhSoTien();
      } else {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    }

    this.handleMoney();
  }

  async changeVendor(value) {
    this.listOrder = [];
    if (value) {
      this.loading = true;
      var type = 2;
      let result: any = await this.accountingService.getOrderByVendorIdAsync(this.auth.UserId, value.vendorId, type);
      this.loading = false;
      if (result.statusCode == 200) {
        console.log("result", result)
        this.listOrder = result.listOrder;
        this.tinhSoTien();
      } else {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    }
    this.handleMoney();
  }



  //Tính lại ô Số tiền
  handleMoney() {
    let totalAmountCollected = 0;
    //Tính tổng tiền nhận của tất cả đơn hàng
    this.listOrder.forEach(item => {
      if (item.amountCollected > item.amountReceivable || item.amountCollected > item.tongTienHoaHong) {
        item.error = true;
      } else {
        item.error = false;
      }
      totalAmountCollected += item.amountCollected;
    });

    //Gán lại cho ô Số tiền
    if (this.currencyLabel == 'VND') {
      this.unitPrice.setValue(totalAmountCollected);
      this.cashReceiptModel.Amount = totalAmountCollected;
    } else {
      let unitPrice = this.roundNumber((totalAmountCollected / this.exchangeRate.value), parseInt(this.defaultNumberType, 10));
      this.unitPrice.setValue(unitPrice);
      this.cashReceiptModel.Amount = totalAmountCollected;
    }
  }

  roundNumber(number: number, unit: number): number {
    let result: number = number;
    switch (unit) {
      case 0: {
        result = result;
        break;
      }
      case 1: {
        result = Math.round(number * 10) / 10;
        break;
      }
      case 2: {
        result = Math.round(number * 100) / 100;
        break;
      }
      case 3: {
        result = Math.round(number * 1000) / 1000;
        break;
      }
      case 4: {
        result = Math.round(number * 10000) / 10000;
        break;
      }
      default: {
        result = result;
        break;
      }
    }
    return result;
  }


  // Back to receipt list
  cancel() {
    this.router.navigate(['/accounting/cash-receipts-list']);
  }

  openOrgPopup() {
    let ref = this.dialogService.open(OrganizationDialogComponent, {
      data: {
        chooseFinancialIndependence: true //Nếu chỉ chọn đơn vị độc lập tài chính
      },
      header: 'Chọn đơn vị',
      width: '65%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "350px",
        "max-height": "500px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.cashReceiptModel.OrganizationId = result.selectedOrgId;
          this.createReceiptForm.controls['organizationName'].setValue(result.selectedOrgName);
        }
      }
    });
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
  }

  clearDataReceipter() {
    this.receipters.reset();
    this.cashReceiptMappingModel.ObjectId = null;
    this.listOrder = [];
    this.unitPrice.reset();
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  ngOnDestroy() {
    $("body").removeClass("sidebar-collapse");
  }

  setExchangeRate() {
    //Set value
    this.exchangeRate.setValue('1');
    if (this.currencyLabel == 'VND') {
      //Remove validators for FormControl
      this.exchangeRate.setValidators(null);
      this.exchangeRate.updateValueAndValidity();
    } else {
      //Add validators for FormControl
      this.exchangeRate.setValidators([Validators.required]);
      this.exchangeRate.updateValueAndValidity();
    }

    //Tính lại tiền khi thay đổi loại tiền tệ
    this.calculatorMoney();
  }

  calculatorMoney() {
    let exchangeRate = 1;
    if (this.exchangeRate.value.toString().trim() == '') {
      exchangeRate = 1;
      this.exchangeRate.setValue('1');
    } else {
      exchangeRate = parseFloat(this.exchangeRate.value.toString().replace(/,/g, ''));
    }

    if (this.currencyLabel == 'VND') {
      this.cashReceiptModel.Amount = this.unitPrice.value;
    } else {
      this.cashReceiptModel.Amount = this.unitPrice.value * exchangeRate;
    }

    //Tính lại số tiền nhận của các đơn hàng
    let total = this.cashReceiptModel.Amount;
    //Nếu là KH
    if (this.receipter == 'THA' && this.listOrder.length > 0) {
      this.listSelectedCustomerOrder.forEach(item => {
        item.error = false;
        item.amountCollected = '0';
        if (total >= item.amountReceivable) {
          item.amountCollected = this.decimalPipe.transform((item.amountReceivable).toString());
          total = total - item.amountReceivable;
        } else if (total != 0 && total < item.amountReceivable) {
          item.amountCollected = this.decimalPipe.transform(total.toString());
          total = 0;
        }
      });
    }
    //Nếu là Ncc
    else if (this.receipter == 'TTA' && this.listOrder.length > 0) {
      this.listOrder.forEach(item => {
        item.error = false;
        item.amountCollected = 0;
        if (total >= item.tongTienHoaHong) {
          item.amountCollected = item.tongTienHoaHong;
          total = total - item.tongTienHoaHong;
        } else if (total != 0 && total < item.tongTienHoaHong) {
          item.amountCollected = total;
          total = 0;
        }
      });
    }
  }

  showTotal() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 9 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }
}

function forbiddenSpaceText(control: FormControl) {
  let text = control.value;
  if (text && text.trim() == "") {
    return {
      forbiddenSpaceText: {
        parsedDomain: text
      }
    }
  }
  return null;
}
function convertToUTCTime(time: any) {
  return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
};

