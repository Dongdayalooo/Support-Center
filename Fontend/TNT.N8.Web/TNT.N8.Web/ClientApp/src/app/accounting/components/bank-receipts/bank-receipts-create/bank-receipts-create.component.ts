import {
  Component, OnInit, ElementRef,
  ViewChild, AfterContentChecked,
  ChangeDetectorRef, Renderer2
} from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from '../../../../shared/services/category.service';
import { OrganizationService } from '../../../../shared/services/organization.service';
import { BankReceiptModel } from '../../../models/bankReceipt.model';
import { BankReceiptMappingModel } from '../../../models/bankReceiptMapping.model';
import { BankService } from '../../../../shared/services/bank.service';

import { AccountingService } from '../../../services/accounting.service';
import { EmployeeService } from '../../../../employee/services/employee.service';
import { CustomerService } from '../../../../customer/services/customer.service';
import { VendorService } from '../../../../vendor/services/vendor.service';
import { GetPermission } from '../../../../shared/permission/get-permission';
import { CustomerOrderService } from '../../../../order/services/customer-order.service';

import { OrganizationDialogComponent } from '../../../../shared/components/organization-dialog/organization-dialog.component';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DecimalPipe } from '@angular/common';
import { PhieuThuBaoCoMappingCustomerOrderModel } from '../../../../../../src/app/shared/models/bankReceiptInvoiceMappingCustomerOrder.model';



interface Category {
  categoryId: string,
  categoryName: string,
  categoryCode: string
}

interface Bank {
  bankAccountId: string,
  bankName: string
}

interface Customer {
  customerId: string
}

interface Order {
  orderId: string,
  orderCode: string,
  amountCollected: number,  //Số tiền nhận
  amountReceivable: number, //Số phải tiền phải thu
  total: number,
  orderDate: Date,
  error: boolean
}

@Component({
  selector: 'app-bank-receipts-create',
  templateUrl: './bank-receipts-create.component.html',
  styleUrls: ['./bank-receipts-create.component.css'],
  providers: [
    DecimalPipe
  ]
})

export class BankReceiptsCreateComponent implements OnInit, AfterContentChecked {


  /*Check user permission*/
  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  //get system parameter
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  defaultNumberType = this.getDefaultNumberType();

  loading: boolean = false;
  awaitResult: boolean = false; //Khóa nút lưu, lưu và thêm mới

  //parameter of master data
  reasonCode: string = 'LTH';
  registerTypeCode: string = 'LSO';
  receiptStatusCode: string = 'TCH';
  unitMoneyCode: string = 'DTI';

  //hash infor
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  auth: any = JSON.parse(localStorage.getItem('auth'));
  currentUserName: string = localStorage.getItem('UserFullName');
  currentDate: Date = new Date();

  //Declare result
  reasonOfReceipt: Array<Category> = [];
  typesOfReceipt: Array<Bank> = [];
  reperList = <any>[];
  organizationList: Array<any> = [];
  statusOfReceipt: Array<Category> = [];
  maxPaidDate: Date = new Date();
  maxVouchersDate: Date = new Date();
  listCurrency: Array<MenuItem> = [];
  currencyLabel: string = 'VND';
  unitMoney: Array<Category> = [];
  listOrder: Array<any> = [];
  selectedColumns: any[];
  listOrderHistory: Array<any> = [];
  bankReceiptModel = new BankReceiptModel();
  bankReceiptMappingModel = new BankReceiptMappingModel();
  reper = '';
  customerId: string = null;  //Nhận param CustomerId từ màn hình khác đến nếu có
  orderId: string;
  //End

  //Declare Form
  createReceiptForm: FormGroup;
  reasonControl: FormControl;
  bankAccountControl: FormControl;
  repper: FormControl;
  organizationName: FormControl;
  status: FormControl;
  paidDate: FormControl;
  vouchersDate: FormControl;
  content: FormControl;
  unitPrice: FormControl;
  exchangeRate: FormControl;
  noteControl: FormControl;
  isSendMailControl: FormControl;

  selectedCustomerOrder = [];

  colLeft: number = 9;
  isShow: boolean = true;
  isSendMail: boolean = true;

  //1: phiếu yêu cầu, 2: Đơn hàng
  type: number = 1;
  vendorOrderId: string = null;
  vendorId: string = null;

  cols = [
    { field: 'check', header: '', width: '50px', textAlign: 'left', color: '#f44336' },
    { field: 'orderCode', header: 'Mã đơn hàng', width: '15%', textAlign: 'left', color: '#f44336' },
    { field: 'orderTypeName', header: 'Loại phiếu', width: '10%', textAlign: 'right', color: '#f44336' },
    { field: 'listPacketServiceName', header: 'Gói dịch vụ yêu cầu', width: '35%', textAlign: 'right', color: '#f44336' },
    { field: 'amount', header: 'Số phải thu', width: '25%', textAlign: 'right', color: '#f44336' },
    { field: 'createdDate', header: 'Ngày đặt dịch vụ', width: '15%', textAlign: 'center', color: '#f44336' }
  ];


  cols1: any[] = [
    { field: 'vendorOrderCode', header: 'Mã đơn hàng', width: '35%', textAlign: 'left', color: '#f44336' },
    { field: 'amountCollected', header: 'Thanh toán', width: '20%', textAlign: 'right', color: '#f44336' },
    { field: 'tongTienHoaHong', header: 'Số phải thu', width: '20%', textAlign: 'right', color: '#f44336' },
    { field: 'createdDate', header: 'Ngày mua', width: '20%', textAlign: 'center', color: '#f44336' }
  ];

  constructor(
    private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private getPermission: GetPermission,
    private categoryService: CategoryService,
    private orgService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router,
    private bankService: BankService,
    private accountingService: AccountingService,
    private employeeService: EmployeeService,
    private customerService: CustomerService,
    private vendorService: VendorService,
    private formBuilder: FormBuilder,
    private decimalPipe: DecimalPipe,
    private renderer: Renderer2,
    private messageService: MessageService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private customerOrderService: CustomerOrderService,
  ) { }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

  clear() {
    this.messageService.clear();
  }

  async ngOnInit() {
    this.setForm();

    let resource = "acc/accounting/bank-receipts-create/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Thông báo:', detail: 'Bạn không có quyền truy cập vào đường dẫn này vui lòng quay lại trang chủ' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    }
    else {
      //this.setForm();

      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }

      //Tạo báo có từ Customer:
      this.route.params.subscribe(params => {
        this.customerId = params['customerId'];
        this.orderId = params['orderId'];
        this.type = params['type']; // 1:Phiếu yêu cầu, 2: Đơn hàng


        this.vendorOrderId = params['vendorOrderId'];
        this.vendorId = params['vendorId'];
      });

      this.loading = true;
      await this.getMasterData();
      this.loading = false;



      this.selectedColumns = this.cols;
    }
  }

  setForm() {
    this.reasonControl = new FormControl('');
    this.bankAccountControl = new FormControl('');
    this.repper = new FormControl('', [Validators.required]);
    this.organizationName = new FormControl('', [Validators.required]);
    this.status = new FormControl('', [Validators.required]);
    this.paidDate = new FormControl(new Date(), [Validators.required]);
    this.vouchersDate = new FormControl(new Date(), [Validators.required]);
    this.content = new FormControl('', [Validators.required, Validators.maxLength(250), forbiddenSpaceText]);
    this.unitPrice = new FormControl('0', [Validators.required]);
    this.exchangeRate = new FormControl('1', [Validators.required]);
    this.noteControl = new FormControl('');
    this.isSendMailControl = new FormControl(true);

    this.createReceiptForm = this.formBuilder.group({
      reasonControl: this.reasonControl,
      bankAccountControl: this.bankAccountControl,
      repper: this.repper,
      organizationName: this.organizationName,
      status: this.status,
      paidDate: this.paidDate,
      vouchersDate: this.vouchersDate,
      content: this.content,
      unitPrice: this.unitPrice,
      exchangeRate: this.exchangeRate,
      noteControl: this.noteControl,
      isSendMailControl: this.isSendMailControl,
    });

    this.unitPrice.disable();
  }

  tinhSoTien() {
    debugger
    //Nếu là KH thanh toán tiền
    if (this.reper == 'THA') {
      if (this.selectedCustomerOrder != null && this.selectedCustomerOrder.length > 0) {
        let sum = this.selectedCustomerOrder.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.amount
        }, 0);
        this.unitPrice.setValue(sum);
        this.bankReceiptModel.BankReceiptInvoiceAmount = sum;
      }
    }
    //Nếu Ncc thanh toán
    else if (this.reper == 'TTA') {
      if (this.listOrder != null && this.listOrder.length > 0) {
        let sum = this.listOrder.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.tongTienHoaHong
        }, 0);
        this.unitPrice.setValue(sum);
        this.bankReceiptModel.BankReceiptInvoiceAmount = sum;
      }
    }
  }

  async getMasterData() {
    //Lý do thu và Đối tượng thu
    let listReasonResult: any = await this.categoryService.getAllCategoryByCategoryTypeCodeAsyc(this.reasonCode);
    this.reasonOfReceipt = listReasonResult.category;

    //Đơn vị tiền
    let listUnitMoneyResult: any = await this.categoryService.getAllCategoryByCategoryTypeCodeAsyc(this.unitMoneyCode);
    this.unitMoney = listUnitMoneyResult.category;

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

    await this.setDefaultValue();
  }

  ngAfterContentChecked(): void {
    this.ref.detectChanges();
  }

  async setDefaultValue() {
    //Set giá trị mặc định cho Đơn vị tiền:
    const toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === 'VND');
    this.currencyLabel = toSelectMoneyUnit.categoryCode;

    //Set giá trị mặc định cho Tỷ giá:
    this.createReceiptForm.controls['exchangeRate'].setValue(1);
    this.createReceiptForm.controls['exchangeRate'].setValidators(null);
    this.createReceiptForm.controls['exchangeRate'].updateValueAndValidity();

    //Lý do thu và Đối tượng thu
    if (this.customerId) {
      const reasonCode = this.reasonOfReceipt.find(r => r.categoryCode === 'THA');
      this.createReceiptForm.controls['reasonControl'].setValue(reasonCode);
      this.reper = 'THA';
      this.changeReasonPay(this.reasonControl.value);

    } else if (this.vendorId) {
      const reasonCode = this.reasonOfReceipt.find(r => r.categoryCode === 'TTA');
      this.createReceiptForm.controls['reasonControl'].setValue(reasonCode);
      this.reper = 'TTA';
      this.changeReasonPay(this.reasonControl.value);

    }


    //Tài khoản thu
    let listBankAccountResult: any = await this.bankService.getCompanyBankAccountAsync(this.auth.UserId);
    this.typesOfReceipt = listBankAccountResult.bankList;

    //Nơi thu
    let listOrganizationResult: any = await this.orgService.getFinancialindependenceOrgAsync();
    this.organizationList = listOrganizationResult.listOrg;
    const org = this.organizationList.find(o => o.parentId === null);
    this.bankReceiptModel.OrganizationId = org.organizationId;
    this.createReceiptForm.controls['organizationName'].setValidators(null);
    this.createReceiptForm.controls['organizationName'].setValue(org.organizationName);
    this.createReceiptForm.controls['organizationName'].updateValueAndValidity();

    //Trạng thái
    let listStatusResult: any = await this.categoryService.getAllCategoryByCategoryTypeCodeAsyc(this.receiptStatusCode);
    this.statusOfReceipt = listStatusResult.category;

    const toSelectOrderStatus = this.statusOfReceipt.find(stt => stt.categoryCode === "DSO");
    this.createReceiptForm.controls['status'].setValue(toSelectOrderStatus);
  }

  // Check Reason Pay Code
  changeReasonPay(value: Category) {
    this.listOrder = [];
    this.reperList = [];
    this.unitPrice.setValue(0);
    this.exchangeRate.setValue(1);
    this.bankReceiptModel.BankReceiptInvoiceAmount = 0;

    this.reper = value.categoryCode;

    if (this.reper == 'TVI') {
      this.repper.setValue('');
      this.createReceiptForm.controls['repper'].setValidators(Validators.required);
      this.createReceiptForm.controls['repper'].updateValueAndValidity;
      this.loading = true;
      this.employeeService.searchEmployee('', '', '', '', [], '').subscribe(response1 => {
        const result1 = <any>response1;
        this.loading = false;
        this.reperList = result1.employeeList;
        this.reperList.forEach(item => {
          item.employeeName = item.employeeCode + ' - ' + item.employeeName;
        });
      }, error => { });
    } else if (this.reper == 'TTA') {
      this.repper.setValue('');
      this.createReceiptForm.controls['repper'].setValidators(Validators.required);
      this.createReceiptForm.controls['repper'].updateValueAndValidity;
      this.loading = true;
      this.vendorService.getAllVendorToPay().subscribe(response2 => {
        const result2 = <any>response2;
        this.loading = false;
        this.reperList = result2.vendorList;
        this.reperList.forEach(item => {
          item.vendorName = item.vendorCode + ' - ' + item.vendorName;
        });

        if (this.vendorId && this.type == 2) {
          let vendor = this.reperList.find(c => c.vendorId == this.vendorId);
          this.createReceiptForm.controls['repper'].setValue(vendor);
          this.createReceiptForm.controls['repper'].updateValueAndValidity();
          this.changeVendor(vendor);

          // Tính lại tiền khi thay đổi loại tiền tệ
          this.calculatorMoney();
        }


      }, error => { });
    } else if (this.reper === 'THA') {
      this.repper.setValue('');
      this.createReceiptForm.controls['repper'].setValidators(Validators.required);
      this.createReceiptForm.controls['repper'].updateValueAndValidity;
      this.loading = true;
      this.customerService.getAllCustomer().subscribe(response3 => {
        const result3 = <any>response3;
        this.loading = false;
        this.reperList = result3.customerList;
        this.reperList.forEach(item => {
          item.customerName = item.customerCode + ' - ' + item.customerName;
        });

        if (this.customerId && this.type == 1) {
          let customer: Customer = this.reperList.find(c => c.customerId == this.customerId);
          this.createReceiptForm.controls['repper'].setValue(customer);
          this.createReceiptForm.controls['repper'].updateValueAndValidity();
          this.changeCustomer(customer);
        }

      }, error => { });
    } else {
      this.createReceiptForm.controls['repper'].setValidators(null);
      this.createReceiptForm.controls['repper'].updateValueAndValidity();
    }
  }


  async changeVendor(value) {
    this.listOrder = [];
    if (value) {
      this.loading = true;
      var type = 1;
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



  async changeCustomer(value: Customer) {
    this.listOrder = [];
    if (value) {
      this.loading = true;
      var type = 1;
      let result: any = await this.accountingService.getOrderByCustomerIdAsync(this.auth.UserId, value.customerId, type);
      this.loading = false;
      if (result.statusCode == 200) {
        this.listOrder = result.listOrder;
        if (this.orderId) {
          this.selectedCustomerOrder = this.listOrder.filter(x => x.orderId == this.orderId);
          this.tinhSoTien();
        }
      } else {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    }

    // chỉ tính số tiền của đơn hàng cần thanh toán
    // this.handleMoney();
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
          this.bankReceiptModel.OrganizationId = result.selectedOrgId;
          this.createReceiptForm.controls['organizationName'].setValue(result.selectedOrgName);
        }
      }
    });
  }

  selectPaidDate() {
    let paidDate: Date = this.paidDate.value;
    this.maxVouchersDate = paidDate;
    if (paidDate < this.vouchersDate.value) {
      this.vouchersDate.setValue(paidDate);
    }
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
    this.exchangeRate.setValue(1);
    if (this.currencyLabel == 'VND') {
      this.bankReceiptModel.BankReceiptInvoiceAmount = this.unitPrice.value;
    } else {
      this.bankReceiptModel.BankReceiptInvoiceAmount = this.unitPrice.value * this.exchangeRate.value;
    }

    let total = this.bankReceiptModel.BankReceiptInvoiceAmount;
    //Nếu là KH
    if (this.reper == 'THA' && this.listOrder.length > 0) {
      this.selectedCustomerOrder.forEach(item => {
        item.error = false;
        item.amountCollected = 0;
        if (total >= item.amountReceivable) {
          item.amountCollected = item.amountReceivable;
          total = total - item.amountReceivable;
        } else if (total != 0 && total < item.amountReceivable) {
          item.amountCollected = total;
          total = 0;
        }
      });
    }
    //Nếu là Ncc
    else if (this.reper == 'TTA' && this.listOrder.length > 0) {
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



  //Tính lại ô Số tiền
  handleMoney() {
    let totalAmountCollected = 0;
    //Tính tổng tiền nhận của tất cả đơn hàng
    this.listOrder.forEach(item => {
      if (item.amountCollected > item.amountReceivable) {
        item.error = true;
      } else {
        item.error = false;
      }
      totalAmountCollected += item.amountCollected;
    });

    //Gán lại cho ô Số tiền
    if (this.currencyLabel == 'VND') {
      this.unitPrice.setValue(totalAmountCollected.toString());
      this.bankReceiptModel.BankReceiptInvoiceAmount = totalAmountCollected;
    } else {
      let unitPrice = this.roundNumber((totalAmountCollected / this.exchangeRate.value ?? 1), parseInt(this.defaultNumberType, 10));
      this.unitPrice.setValue(unitPrice.toString());
      this.bankReceiptModel.BankReceiptInvoiceAmount = totalAmountCollected;
    }
  }

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
    //Lý do thu
    this.bankReceiptModel.BankReceiptInvoiceReason = this.reasonControl.value.categoryId;

    //Tài khoản thu
    let bankAccount: Bank = this.bankAccountControl.value;
    this.bankReceiptModel.BankReceiptInvoiceBankAccountId = bankAccount ? bankAccount.bankAccountId : null;

    //Đối tượng thu
    let repper = this.repper.value;
    if (this.reper == 'THA') {
      this.bankReceiptMappingModel.ObjectId = repper ? repper.customerId : null;
    } else if (this.reper == 'TTA') {
      this.bankReceiptMappingModel.ObjectId = repper ? repper.vendorId : null;
    } else {
      this.bankReceiptMappingModel.ObjectId = repper ? repper.employeeId : null;
    }

    this.bankReceiptModel.DoiTuong = this.reper;

    //Trạng thái
    let status = this.status.value;
    this.bankReceiptModel.StatusId = status ? status.categoryId : null;

    //Ngày hạch toán
    let paidDate = this.paidDate.value;
    paidDate = convertToUTCTime(paidDate);
    this.bankReceiptModel.BankReceiptInvoicePaidDate = paidDate;

    //Ngày chứng từ
    let vouchersDate = this.vouchersDate.value;
    vouchersDate = convertToUTCTime(vouchersDate);
    this.bankReceiptModel.VouchersDate = vouchersDate;

    //Nội dung
    this.bankReceiptModel.BankReceiptInvoiceDetail = this.content.value.trim();

    //Ghi chú
    this.bankReceiptModel.BankReceiptInvoiceNote = this.noteControl.value == null ? '' : this.noteControl.value.trim();

    // Thông báo cho khách hàng
    this.bankReceiptModel.IsSendMail = this.isSendMail;

    //Loại tiền (VND, USD,...)
    let toSelectMoneyUnit = this.unitMoney.find(c => c.categoryCode === this.currencyLabel);
    this.bankReceiptModel.BankReceiptInvoicePriceCurrency = toSelectMoneyUnit.categoryId;

    //Tiền (chưa tính tỷ giá)
    this.bankReceiptModel.BankReceiptInvoicePrice = this.unitPrice.value

    //Tỷ giá
    this.bankReceiptModel.BankReceiptInvoiceExchangeRate = this.exchangeRate.value

    //Thành tiền (Đã tính tỷ giá)
    this.bankReceiptModel.BankReceiptInvoiceAmount = this.unitPrice.value * (this.exchangeRate.value ?? 1);


    //Từ NCC thanh toán (thu tiền từ Ncc)
    if (this.reper == 'TTA') {
      if (this.listOrder.find(x => x.error == true)) {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: 'Số tiền thu không được lớn hơn số tiền phải thu, vui lòng kiểm tra danh sách đơn hàng!' };
        this.showMessage(mgs);
        return;
      }
    }

    var listMapping: PhieuThuBaoCoMappingCustomerOrderModel[] = [];

    //nẾU không phải là thu tiền Ncc
    if (this.reper != 'TTA') {
      this.selectedCustomerOrder.forEach(item => {
        var data = new PhieuThuBaoCoMappingCustomerOrderModel();
        data.orderId = item.orderId;
        data.orderCode = item.orderCode;
        data.amount = item.amount;
        data.objectType == 1;//Báo có
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
          data.objectType == 1;//Báo có
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

    this.saveBankReceipt(listMapping);
  }



  saveBankReceipt(listMapping: Array<PhieuThuBaoCoMappingCustomerOrderModel>) {
    this.awaitResult = true;
    this.loading = true;
    this.accountingService.createBankReceiptInvoice(this.bankReceiptModel, this.bankReceiptMappingModel,
      this.auth.UserId, listMapping).subscribe(response => {
        const result = <any>response;
        this.loading = false;
        if (result.statusCode === 202 || result.statusCode === 200) {
          let mgs = { severity: 'success', summary: 'Thông báo:', detail: 'Tạo báo có thành công' };
          this.showMessage(mgs);
          this.router.navigate(['/accounting/bank-receipts-detail', { id: result.bankReceiptInvoiceId }]);
        } else {
          let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(mgs);
          this.awaitResult = false;
        }
      }, error => { });
  }

  resetFieldValue() {

    this.repper.reset(); //Đối tượng thu
    this.bankAccountControl.reset(); //Tài khoản thu

    this.paidDate.setValue(new Date()); //Ngày hạch toán
    this.vouchersDate.setValue(new Date()); //Ngày chứng từ
    this.content.reset(); //Nội dung thu
    this.unitPrice.setValue('0'); //Số tiền
    this.noteControl.reset(); //Ghi chú
    this.listOrder = [];
    this.listOrderHistory = [];
    this.bankReceiptModel.BankReceiptInvoiceAmount = 0; //Thành tiền (Số tiền đã nhân với tỷ giá)
    this.setDefaultValue();
  }

  cancel() {
    this.router.navigate(['/accounting/bank-receipts-list']);
  }

  getDefaultNumberType() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
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



  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }



  showTotal() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 9 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
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
