import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2, HostListener, Injector } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CustomerOrder } from '../../models/customer-order.model';
import { OrderProductDetailProductAttributeValue } from '../../models/order-product-detail-product-attribute-value.model';
import { ContactModel } from '../../../shared/models/contact.model';
import { CustomerOrderService } from '../../services/customer-order.service';
import { ContactService } from '../../../shared/services/contact.service';
import { FileUpload } from 'primeng/fileupload';
import { NewTreeNode, OrderDetailDialogComponent } from '../order-detail-dialog/order-detail-dialog.component';
import { CustomerOrderDetail, CustomerOrderExtension, CustomerOrderDetailExten } from '../../models/customer-order-detail.model';
import * as $ from 'jquery';
import { ServicePacket } from '../../../../../src/app/product/models/productPacket.model';
import { EmployeeEntityModel, TrangThaiGeneral } from '../../../../../src/app/product/models/product.model';
import { AbstractBase } from '../../../shared/abstract-base.component';
import { NotificationFireBase } from '../../../shared/models/fire-base.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { QuyTrinhService } from '../../../../../src/app/admin/services/quy-trinh.service';
import { PaymentMethodConfigure } from '../../../../../src/app/admin/models/mobile-app-configuraton.models';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";

interface Order {
  orderId: string,
  orderCode: string,
  createdDate: Date,
  customerName: string,
  supporterName: string,
  orderStatusName: string,

  statusOrder: number,
  orderDate: string,
  customerId: string,
  orderTypeName: string,
  orderType: number,
  backgroundColorForStatus: string,
}

class ResultDialog {
  status: boolean;
  //Lưu lại tất cả các thuộc tính của từng option đã điền
  listAtrrOption: CustomerOrderExtension[];
  //Thuộc tính gói dịch vụ
  listAttrPacket: Array<CustomerOrderExtension>;
  //Infor gói dịch vụ
  packetService: ServicePacket;
  //Các tùy chọn dịch vụ đã chọn ở level cuối cùng
  listOptionSave: any;
}

class rowDataAddedOption {
  serviceName: string;
  optionName: string;
  optionId: string;
  number: number;
  cost: number;
  vat: number;
  //Lưu lại tất cả các thuộc tính của từng option đã điền
  listAtrrOption: CustomerOrderExtension[];
  //Thuộc tính gói dịch vụ
  listAttrPacket: Array<CustomerOrderExtension>;
  //Infor gói dịch vụ
  packetService: ServicePacket;
  //Các tùy chọn dịch vụ đã chọn ở level cuối cùng
  listOptionSave: any;
}

interface CustomerType {
  typeValue: number;
  typeName: string;
}

export class CustomList {
  value: number;
  name: string;
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})

export class CreateComponent extends AbstractBase implements OnInit {
  /*Khai báo biến*/
  actionAdd: boolean = true;
  awaitResult: boolean = false;

  toDay: Date = new Date();
  empLoginName: string = "Tên người tạo";

  fixed: boolean = false;
  withFiexd: string = "";
  withFiexdCol: string = "";
  withColCN: number = 0;
  withCol: number = 0;
  @HostListener('document:scroll', [])
  onScroll(): void {
    let num = window.pageYOffset;
    if (num > 100) {
      this.fixed = true;
      var width: number = $('#parent').width();
      this.withFiexd = width + 'px';
      var colT = 0;
      if (this.withColCN != width) {
        colT = this.withColCN - width;
        this.withColCN = width;
        this.withCol = $('#parentTH').width();
      }
      this.withFiexdCol = (this.withCol) + 'px';
    } else {
      this.fixed = false;
      this.withFiexd = "";
      this.withCol = $('#parentTH').width();
      this.withColCN = $('#parent').width();
      this.withFiexdCol = "";
    }
  }

  /* Form */
  colLeft: number = 8;
  isShow: boolean = true;
  createOrderForm: FormGroup;
  customerControl: FormControl = new FormControl(null, [Validators.required]);
  customerEmailControl: FormControl = new FormControl(null);
  customerPhoneControl: FormControl = new FormControl(null);
  fullAddressControl: FormControl = new FormControl(null);
  orderTypeControl: FormControl = new FormControl(null, [Validators.required]);
  objectControl: FormControl = new FormControl(null); //Bổ sung từ phiếu nào ( order )

  provinceControl: FormControl = new FormControl(null, [Validators.required]);
  districtControl: FormControl = new FormControl(null);
  wardControl: FormControl = new FormControl(null);
  /* End */

  /* Valid Form */
  isInvalidForm: boolean = false;
  emitStatusChangeForm: any;
  @ViewChild('toggleButton') toggleButton: ElementRef;
  isOpenNotifiError: boolean = false;
  @ViewChild('notifi') notifi: ElementRef;
  @ViewChild('saveAndCreate') saveAndCreate: ElementRef;
  @ViewChild('save') save: ElementRef;
  @ViewChild('fileUpload') fileUpload: FileUpload;
  /* End */

  editing: boolean = false;
  isCurrentStep: boolean = true;


  isShowAddOptionIncurred: boolean = false; //show dialog thêm dịch vụ phát sinh

  listProduct: Array<any> = [];
  listCustomer: Array<any> = [];

  listCustomerCode: Array<string> = [];

  orderCode: string = "Hệ thống tự động tạo"
  selectedColumns: any[];
  selectedColumns2: any[];
  selectedColumns3: any[];
  selectedColumns4: any[];


  selectedItem: any;
  //Dịch vụ đã có
  listCustomerOrderDetailModel: Array<rowDataAddedOption> = [];
  //Dịch vụ phát sinh
  listCustomerOrderDetailModel2: Array<CustomerOrderDetailExten> = [];
  //list phiếu hỗ trợ
  listCustomerOrderAction: Array<Order> = [];
  //list yêu cầu bổ sung
  listCustomerOrderExten: Array<Order> = [];

  orderId: string = this.emptyGuid;
  cusId: string = this.emptyGuid;
  packId: string = this.emptyGuid;
  orderProcessId: string = this.emptyGuid;

  //disable trường chọn KH và gói dịch vụ 
  disableCusAndPack: boolean = true;

  statusOrder: number = 1; //Mới

  listFormatStatusSupport: Array<any> = []; // Thanh trạng thái

  listPaymentMethod: Array<PaymentMethodConfigure> = [];
  selectedPayMentMethod: any;
  payContent: string = '';

  typeAccount: number = 2;

  contactModel = new ContactModel();

  arrayCustomerOrderDetailModel: Array<CustomerOrderDetail> = [];
  arrayOrderProductDetailProductAttributeValueModel: Array<OrderProductDetailProductAttributeValue> = [];

  listAllCustomerOrder: Array<Order> = [];

  //Tổng tiền trước thuế
  totalCostBeforeTax: number = 0;
  //Chiết khấu Type
  discountType = { value: 1, name: "Theo %", giaTri: 0 };
  //Số chiết khấu: % or money
  discountNumber: number = 0;
  //Tổng tiền thuế
  totalCostTax: number = 0;
  //Tổng tiền chiết khấu
  totalDiscountCost: number = 0;
  // Tổng tiền phải trả
  totalCostPay: number = 0;
  messageConfirm: string = '';

  //Detail
  empNameCreator: string = "";
  customerOrder = null;

  isShowTuChoiXacNhanPDDVBS: boolean = false;
  isShowTuChoiXacNhanPDBS: boolean = false;

  listOrderType: Array<TrangThaiGeneral> = [];

  orderExtenId: string;
  orderActionId: string = null;
  //Note
  isManagerOfHR: boolean = false;
  isGD: boolean = false;
  isNguoiPhuTrach: boolean = false;
  viewNote: boolean = true;
  viewTimeline: boolean = true;
  pageSize = 20;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  isReportPoint: boolean = false; // là điểm báo cáo ?

  isShowXacNhan: boolean = false;
  isShowTuChoi: boolean = false;
  isShowButtonDelete: boolean = false;

  listStatusOrderExtenDetail = [
    { value: 3, name: "Chờ phê duyệt" },
    { value: 1, name: "Từ chối" },
  ];
  isShowNote = false;
  paymentMethodNote = "";

  listProvince = []

  constructor(
    injector: Injector,
    private customerOrderService: CustomerOrderService,
    private contactService: ContactService,
    public cdRef: ChangeDetectorRef,
    private renderer: Renderer2,
    public datepipe: DatePipe,
    private quyTrinhService: QuyTrinhService,
    private decimalPipe: DecimalPipe
  ) {
    super(injector)
    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (this.toggleButton && this.notifi) {
        if (this.saveAndCreate) {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target) &&
            !this.saveAndCreate.nativeElement.contains(e.target)) {
            this.isOpenNotifiError = false;
          }
        } else {
          if (!this.toggleButton.nativeElement.contains(e.target) &&
            !this.notifi.nativeElement.contains(e.target) &&
            !this.save.nativeElement.contains(e.target)) {
            this.isOpenNotifiError = false;
          }
        }
      }
    });
  }

  async ngOnInit() {
    this.setForm();
    this.setTable();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    let resource = "cusOrder/order/create";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      this.getMasterData();
    }

  }

  getParam() {
    this.route.params.subscribe(params => {
      this.orderId = params['OrderId'];
      this.orderExtenId = params['OrderExtenId'];
      this.cusId = params['CusId'];
      this.packId = params['PackId'];
      this.orderProcessId = params['OrderProcessId'];

      if (this.cusId == null || this.packId == null) {
        this.disableCusAndPack = false;
      }
    });
  }


  setForm() {
    this.createOrderForm = new FormGroup({
      customerControl: this.customerControl,
      customerEmailControl: this.customerEmailControl,
      customerPhoneControl: this.customerPhoneControl,
      fullAddressControl: this.fullAddressControl,
      orderTypeControl: this.orderTypeControl,
      objectControl: this.objectControl,
      provinceControl: this.provinceControl,
      districtControl: this.districtControl,
      wardControl: this.wardControl,
    });
  }

  setTable() {

    this.selectedColumns = [
      { field: 'Move', header: '#', width: '40px', textAlign: 'center', color: '#f44336' },
      { field: 'serviceName', header: 'Tên gói dịch vụ', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'optionName', header: 'Tên dịch vụ', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'number', header: 'Số lượng', width: '80px', textAlign: 'center', color: '#f44336' },
      { field: 'vat', header: 'VAT (%)', width: '80px', textAlign: 'center', color: '#f44336' },
      { field: 'cost', header: 'Giá tiền', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'delete', header: 'Thao tác', width: '170px', textAlign: 'center', color: '#f44336' },
    ];

    this.selectedColumns2 = [
      { field: 'Move', header: '#', width: '40px', textAlign: 'center', color: '#f44336' },
      { field: 'name', header: 'Tên dịch vụ', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'quantity', header: 'Số lượng', width: '120px', textAlign: 'left', color: '#f44336' },
      { field: 'price', header: 'Đơn giá', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'statusName', header: 'Phê duyệt', width: '200px', textAlign: 'left', color: '#f44336' },
      { field: 'action', header: 'Thao tác', width: '170px', textAlign: 'center', color: '#f44336' },
    ];


    this.selectedColumns3 = [
      { field: 'Move', header: '#', width: '40px', textAlign: 'center', color: '#f44336' },
      { field: 'orderCode', header: 'Mã phiếu', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'createdDate', header: 'Ngày yêu cầu', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'customerName', header: 'Tên khách hàng', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'orderStatusName', header: 'Trạng thái', width: '170px', textAlign: 'center', color: '#f44336' },
    ];

    this.selectedColumns4 = [
      { field: 'Move', header: '#', width: '40px', textAlign: 'center', color: '#f44336' },
      { field: 'orderCode', header: 'Mã phiếu', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'createdDate', header: 'Ngày yêu cầu', width: '120px', textAlign: 'left', color: '#f44336' },
      { field: 'customerName', header: 'Tên khách hàng', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'supporterName', header: 'Nhân viên hỗ trợ', width: '170px', textAlign: 'left', color: '#f44336' },
      { field: 'orderStatusName', header: 'Trạng thái', width: '170px', textAlign: 'center', color: '#f44336' },
    ];
  }

  getMasterData() {
    this.getParam();
    this.loading = true;
    this.customerOrderService.getMasterDataOrderCreate(this.cusId, this.packId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      console.log("result", result)
      if (result.statusCode == 200) {
        this.listCustomer = result.listCustomer;
        this.listCustomerCode = result.listCustomerCode;
        this.empLoginName = result.empLoginName;
        this.listOrderType = result.listOrderType;
        this.listPaymentMethod = result.listPaymentMethod;
        this.listAllCustomerOrder = result.listAllCustomerOrder;
        this.listEmp = result.listEmpPheDuyet;
        this.listProvince = result.listProvince;
        //Nếu đã có thông tin KH và gói => phiếu yêu cầu
        if (this.disableCusAndPack) {
          //Thông tin KH
          let customer = this.listCustomer.find(x => x.customerId == this.cusId);
          this.customerControl.setValue(customer);
          this.changeCustomer(customer);

          //Loại phiếu: yêu cầu (1) hoặc bổ sung (2)
          let orderType = this.listOrderType.find(x => x.value == 1);
          this.orderTypeControl.setValue(orderType);
          this.changeOrderType(orderType)

        }
        //Phiếu bổ sung
        else {
          //Loại phiếu: yêu cầu (1) hoặc bổ sung (2)
          let orderType = this.listOrderType.find(x => x.value == 2);
          this.orderTypeControl.setValue(orderType);
          this.changeOrderType(orderType);

          if (this.orderExtenId) {
            let orderExten = this.listAllCustomerOrder.find(x => x.orderId == this.orderExtenId);
            this.objectControl.setValue(orderExten);
            this.choseRootOrder(orderExten);
          }
        }

        if (this.orderId != null) this.setDefaultValue();
      } else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  changeOrderType(data) {
    //Phiếu thường
    if (data.value == 1) {
      this.objectControl.setValidators(null);
      this.objectControl.updateValueAndValidity();
    }
    //Phiếu bổ sung
    else {
      this.objectControl.setValidators([Validators.required]);
      this.objectControl.updateValueAndValidity();
    }
  }

  receiptInvoiceId: string;
  setDefaultValue() {
    this.customerOrderService.getMasterDataOrderDetail(this.orderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listAllCustomerOrder = this.listAllCustomerOrder.filter(item => item.orderId != this.orderId);
        let customer = this.listCustomer.find(x => x.customerId == result.customerOrder.customerId);
        this.cusId = result.customerOrder.customerId;
        this.customerControl.setValue(customer);
        this.changeCustomer(customer);

        this.receiptInvoiceId = result.receiptInvoiceId;

        this.customerOrder = result.customerOrder;
        this.listEmpSelected = result.listEmpPD;
        this.orderActionId = result.orderActionId;

        this.isCurrentStep = result.isCurrentStep; //Kiểm tra xem có phải xác nhận thanh toán là bước hiện tại trong orderProcess hay k
        this.isShowTuChoi = result.isShowTuChoi; //Hiển thị nút từ chối
        this.isShowXacNhan = result.isShowXacNhan; //Hiển thị nút xác nhận
        this.isShowButtonDelete = result.isShowButtonDelete //Hiển thị nút xóa


        this.isShowTuChoiXacNhanPDDVBS = result.isShowTuChoiXacNhanPDDVBS
        this.isShowTuChoiXacNhanPDBS = result.isShowTuChoiXacNhanPDBS
        this.listProvince = result.listProvince;


        this.packId = result.customerOrder.servicePacketId; //Gói dịch vụ gán với phiếu

        this.payContent = result.customerOrder.paymentContent;
        this.selectedPayMentMethod = this.listPaymentMethod.find(x => x.id == result.customerOrder.paymentMethod);
        if (this.selectedPayMentMethod && this.selectedPayMentMethod.categoryCode == "TM") {
          this.isShowNote = true;
          this.paymentMethodNote = this.customerOrder.paymentMethodNote;
        }
        console.log("result.customerOrder", result.customerOrder)

        this.provinceControl.setValue(this.listProvince.find(x => x.provinceId == result.customerOrder.provinceId));
        let listDistrict = this.provinceControl.value?.listDistrict;
        if (listDistrict?.length > 0) {
          this.districtControl.setValue(listDistrict.find(x => x.districtId == result.customerOrder.districtId));

          let listWard = this.districtControl.value?.listWard;
          if (listWard?.length > 0) {
            this.wardControl.setValue(listWard.find(x => x.wardId == result.customerOrder.wardId));
          }
        }

        this.discountType.value = result.customerOrder.discountType;
        this.discountType.name = result.customerOrder.discountType == 1 ? "Theo %" : (result.customerOrder.discountType == 2 ? "Theo số tiền" : "");
        this.discountType.giaTri = result.customerOrder.discountValue;

        this.empLoginName = result.empNameCreator;
        this.toDay = new Date(result.customerOrder.createdDate);
        this.orderCode = result.customerOrder.orderCode;
        this.statusOrder = result.customerOrder.statusOrder;
        this.orderProcessId = result.customerOrder.orderProcessId;
        let orderType = this.listOrderType.find(x => x.value == result.customerOrder.orderType);
        this.orderTypeControl.setValue(orderType);
        this.changeOrderType(orderType)
        let listDetail: Array<CustomerOrderDetail> = result.listDetail;

        let object = this.listAllCustomerOrder.find(x => x.orderId == result.customerOrder.objectId);
        this.objectControl.setValue(object);
        //set lại số cột theo trạng thái
        this.setTable();
        if (this.statusOrder != 1 && this.statusOrder != 3) this.selectedColumns = this.selectedColumns.filter(x => x.field != 'delete');
        if (this.statusOrder != 1 && this.statusOrder != 2 && this.statusOrder != 10 && this.statusOrder != 11 && this.statusOrder != 12 && this.statusOrder != 3) this.selectedColumns2 = this.selectedColumns2.filter(x => x.field != 'action');

        this.listCustomerOrderDetailModel2 = result.listOptionExten;
        this.listCustomerOrderDetailModel2.forEach(x => {
          x.statusObject = this.listStatusOrderExtenDetail.find(item => item.value == x.status);
        });

        this.listCustomerOrderDetailModel = [];
        listDetail.forEach(item => {
          let newRow = new rowDataAddedOption();
          newRow.serviceName = result.listServicePacket.find(x => x.id == item.servicePacketId).name;
          newRow.number = item.quantity;
          newRow.optionName = item.optionName ?? "Tên dịch vụ";
          newRow.optionId = item.optionId;
          newRow.cost = item.priceInitial;
          newRow.vat = item.vat;
          //Lưu lại tất cả các thuộc tính của từng option đã điền
          newRow.listAtrrOption = result.listAtrrOption.filter(x => x.objectType == "1");
          //Thuộc tính gói dịch vụ
          newRow.listAttrPacket = result.listAtrrPacket.filter(x => x.objectType == "2");
          //Infor gói dịch vụ
          newRow.packetService = result.listServicePacket.find(x => x.id == item.servicePacketId);
          //Các tùy chọn dịch vụ đã chọn ở level cuối cùng
          newRow.listOptionSave = []
          let selectedOption = listDetail.filter(x => x.servicePacketId == item.servicePacketId);
          selectedOption.forEach(selectedOp => {
            let newSelected: NewTreeNode = {
              number: selectedOp.quantity.toString(),
              data: { id: selectedOp.optionId, price: selectedOp.priceInitial, vat: selectedOp.vat },
              listAttr: newRow.listAtrrOption,
              path: "",
              margin: "",
            };
            newRow.listOptionSave.push(newSelected);
          });
          this.listCustomerOrderDetailModel.push(newRow);
        });

        //list phiếu hỗ trợ
        this.listCustomerOrderAction = result.listCustomerOrderAction;
        //list yêu cầu bổ sung
        this.listCustomerOrderExten = result.listAllOrderExten;
        this.handleBackGroundColorForStatus(this.listCustomerOrderAction);
        this.handleBackGroundColorForStatus(this.listCustomerOrderExten);

        this.getDuLieuQuyTrinh();
        this.calculatorAll();
      } else {
        this.loading = false;
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  handleBackGroundColorForStatus(list: Array<any>) {
    list.forEach(item => {
      switch (item.statusOrder) {
        case 1://bi tra lai
          item.backgroundColorForStatus = "#BB0000";
          break;
        case 2://da dong
          item.backgroundColorForStatus = "#6D98E7";
          break;
        case 3://da giao hang
          item.backgroundColorForStatus = "#66CC00";
          break;
        case 4://da thanh toan
          item.backgroundColorForStatus = "#9C00FF";
          break;
        case 5://dang xu ly
          item.backgroundColorForStatus = "#34c759";
          break;
        case 6://hoan
          item.backgroundColorForStatus = "#666666";
          break;
        default:
          item.backgroundColorForStatus = "#ffcc00";
          break;
      }
    });
  }

  goToDetail(orderId: string, isOrderAction: boolean) {
    if (isOrderAction) {
      this.router.navigate(['order/orderAction', { OrderActionId: orderId }]);
    } else {
      this.router.navigate(['order/create', { OrderId: orderId }]);
    }
  }

  changeCustomer(customer: any, clear?: string) {
    //Nếu thay đổi khách hàng trên giao diện thì clear hết sản phẩm dịch vụ
    if (clear) {
      this.listCustomerOrderDetailModel = [];
      this.calculatorAll();
    }

    console.log("customer", customer)
    this.customerControl.setValue("");
    this.customerEmailControl.setValue("");
    this.customerPhoneControl.setValue("");
    this.fullAddressControl.setValue("");

    if (customer) {
      this.customerControl.setValue(customer);
      this.customerEmailControl.setValue(customer.customerEmail);
      this.customerPhoneControl.setValue(customer.customerPhone);
      this.fullAddressControl.setValue("");

      //Lấy địa chỉ của khách hàng
      this.contactService.getAddressByObject(customer.customerId, "CUS").subscribe(response => {
        let result: any = response;

        if (result.statusCode == 200) {
          this.fullAddressControl.setValue(result.address);
        } else {
          let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  /*Thêm sản phẩm dịch vụ*/
  openServiceOrderDetail(isAdd: boolean): void {
    let ref = this.dialogService.open(OrderDetailDialogComponent, {
      data: {
        isCreate: isAdd,
        statusOrder: this.statusOrder,
        packId: this.packId,
      },
      header: 'Thêm dịch vụ',
      width: '90%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "700px",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          //Chỉ được thêm 1 gói dịch vụ trong 1 phiếu.
          let listPack = this.listCustomerOrderDetailModel.map(x => x.packetService);
          if (listPack.filter(x => x.id == result.packetService.id).length != listPack.length) {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: "Mỗi phiếu chỉ được thêm 1 gói dịch vụ!" };
            this.showMessage(msg);
            return;
          }
          //Các tùy chọn dịch vụ đã chọn ở level cuối cùng
          let listOptionSave = result.listOptionSave;
          //Thêm vào bảng
          this.listCustomerOrderDetailModel = [];
          listOptionSave.forEach(item => {
            let newRow = new rowDataAddedOption();
            newRow.serviceName = result.packetService.name;
            newRow.optionName = item.path;
            newRow.optionId = item.optionId;
            newRow.number = item.number;
            newRow.cost = item.data.price;
            newRow.vat = item.data.vat;
            //Lưu lại tất cả các thuộc tính của từng option đã điền
            newRow.listAtrrOption = result.listAtrrOption;
            //Thuộc tính gói dịch vụ
            newRow.listAttrPacket = result.listAttrPacket;
            //Infor gói dịch vụ
            newRow.packetService = result.packetService;
            //Các tùy chọn dịch vụ đã chọn ở level cuối cùng
            newRow.listOptionSave = listOptionSave;
            this.listCustomerOrderDetailModel.push(newRow);
          });
          this.calculatorAll();
        }
      }
    });
  }

  /*Sửa một sản phẩm dịch vụ*/
  onRowSelect(dataRow) {
    let ref = this.dialogService.open(OrderDetailDialogComponent, {
      data: {
        isCreate: false,
        dataRow: dataRow,
        statusOrder: this.statusOrder,
        packId: this.packId,
      },
      header: 'Sửa dịch vụ',
      width: '70%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "600px",
        "overflow": "auto"
      }
    });
    ref.onClose.subscribe((result: ResultDialog) => {
      if (result) {
        if (result.status) {
          //Chỉ được thêm 1 gói dịch vụ trong 1 phiếu.
          let listPack = this.listCustomerOrderDetailModel.map(x => x.packetService);
          if (listPack.filter(x => x.id == result.packetService.id).length != listPack.length) {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: "Mỗi phiếu chỉ được thêm 1 gói dịch vụ!" };
            this.showMessage(msg);
            return;
          }
          this.listCustomerOrderDetailModel = [];
          //Các tùy chọn dịch vụ đã chọn ở level cuối cùng
          let listOptionSave = result.listOptionSave;
          //Thêm vào bảng
          listOptionSave.forEach(item => {
            let newRow = new rowDataAddedOption();
            newRow.serviceName = result.packetService.name;
            newRow.optionName = item.path;
            newRow.optionId = item.optionId;
            newRow.number = item.number;
            newRow.cost = item.data.price;
            newRow.vat = item.data.vat;
            //Lưu lại tất cả các thuộc tính của từng option đã điền
            newRow.listAtrrOption = result.listAtrrOption;
            //Thuộc tính gói dịch vụ
            newRow.listAttrPacket = result.listAttrPacket;
            //Infor gói dịch vụ
            newRow.packetService = result.packetService;
            //Các tùy chọn dịch vụ đã chọn ở level cuối cùng
            newRow.listOptionSave = listOptionSave;
            this.listCustomerOrderDetailModel.push(newRow);
          });
          this.calculatorAll();
        }
      }
    });
  }

  /*Xóa một sản phẩm dịch vụ*/
  deleteItem(dataRow, event: Event) {
    //this.translate.get('order.messages_confirm.delete_confirm').subscribe(value => { this.messageConfirm = value; });
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa?',
      accept: () => {
        this.listCustomerOrderDetailModel = this.listCustomerOrderDetailModel.filter(x => x != dataRow);
        this.listCustomerOrderDetailModel.forEach(item => {
          item.listOptionSave = item.listOptionSave.filter(x => x.data.id != dataRow.optionId);
          item.listAtrrOption = item.listAtrrOption.filter(x => x.objectId != dataRow.optionId && x.objectType == "1");
        });
        this.calculatorAll();
      }
    });
  }

  /*Tính lại tất cả các số phần tổng hợp đơn hàng*/
  calculatorAll() {
    //Tổng tiền trước thuế
    this.totalCostBeforeTax = 0;
    //Tổng tiền thuế
    this.totalCostTax = 0;
    //Tổng tiền chiết khấu
    this.totalDiscountCost = 0;
    // Tổng tiền phải trả
    this.totalCostPay = 0;

    this.listCustomerOrderDetailModel.forEach(item => {
      this.totalCostBeforeTax += (ParseStringToFloat(item.number.toString()) * item.cost);
      this.totalCostTax += (ParseStringToFloat(item.number.toString()) * item.cost) / 100 * ((item.vat == -1 || item.vat == 0) ? 0 : item.vat);
    });

    //Nếu có phát sinh
    if (this.listCustomerOrderDetailModel2.length > 0 && this.statusOrder != 1) {
      this.listCustomerOrderDetailModel2.forEach(item => {
        if (item.price && (item.status == 2 || item.status == 3)) {//Nếu là phê duyệt hoặc chờ phê duyệt và có nhập tiền
          this.totalCostBeforeTax += (ParseStringToFloat(item.quantity.toString()) * (item.price != null ? ParseStringToFloat(item.price.toString()) : 0));
        }
      });
    }
    this.totalCostPay = this.totalCostBeforeTax + this.totalCostTax;

    if (this.totalCostPay > 0) {
      //Nếu ở trạng thái mới hoặc quản lý phê duyệt dịch vụ, chờ phê duyệt dịch vụ bổ sung thì gọi api lấy chiết khấu
      if ([1, 2, 3, 11].includes(this.statusOrder)) {
        //Tính chiết khấu theo điều kiện cấu hình
        this.customerOrderService.tinhTienChietKhau(this.orderId, this.totalCostPay, this.cusId).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            this.discountType.value = result.loaiChietKhau;
            this.discountType.name = result.loaiChietKhau == 1 ? "Theo %" : (result.loaiChietKhau == 2 ? "Theo số tiền" : "");
            this.discountType.giaTri = result.giaTriChietKhau;
            //Chiết khấu theo %
            if (this.discountType.value == 1) this.totalDiscountCost = this.totalCostPay * this.discountType.giaTri / 100;
            //Chiết khấu theo số tiền
            else if (this.discountType.value == 2) this.totalDiscountCost = this.discountType.giaTri;
            this.totalCostPay = this.totalCostPay - this.totalDiscountCost;
          } else {
            this.loading = false;
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      } else {
        //Chiết khấu theo %
        if (this.discountType.value == 1) this.totalDiscountCost = this.totalCostPay * this.discountType.giaTri / 100;
        //Chiết khấu theo số tiền
        else if (this.discountType.value == 2) this.totalDiscountCost = this.discountType.giaTri;
        this.totalCostPay = this.totalCostPay - this.totalDiscountCost;
      }
    }
  }

  createOrder(statusOrder: number) {
    if (!this.createOrderForm.valid) {
      Object.keys(this.createOrderForm.controls).forEach(key => {
        if (this.createOrderForm.controls[key].valid == false) {
          this.createOrderForm.controls[key].markAsTouched();
        }
      });
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng nhập đầy đủ thông tin!" };
      this.showMessage(msg);
      return;
    }

    let listOrderExten: Array<CustomerOrderDetailExten> = this.listCustomerOrderDetailModel2;
    if (listOrderExten.find(x => x.edit == true || (x.price == null && this.statusOrder != 1))) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng nhập đầy đủ thông tin dịch vụ phát sinh!" };
      this.showMessage(msg);
      return;
    }

    listOrderExten.forEach(item => {
      item.id = '00000000-0000-0000-0000-000000000000';
      item.quantity = ParseStringToFloat(item.quantity.toString());
      if (this.statusOrder == 2) item.price = ParseStringToFloat(item.price.toString());

    });

    //phương thức thanh toán
    if (!this.selectedPayMentMethod) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng chọn phương thức thanh toán!" };
      this.showMessage(msg);
      return;
    }

    let discountType: number = this.discountType.value;
    let discountValue: number = this.discountType.giaTri ?? 0;
    let cusOrder = new CustomerOrder();
    cusOrder.OrderId = this.orderId;
    cusOrder.CustomerId = this.customerControl.value.customerId;
    cusOrder.StatusOrder = this.statusOrder;
    cusOrder.OrderType = this.orderTypeControl.value.value;
    cusOrder.PaymentMethod = this.selectedPayMentMethod.id;
    cusOrder.PaymentContent = this.selectedPayMentMethod.content;
    cusOrder.PaymentMethodNote = this.paymentMethodNote;

    if (this.statusOrder == 1) {
      cusOrder.provinceId = this.provinceControl.value?.provinceId;
      cusOrder.wardId = this.wardControl.value?.wardId;
      cusOrder.districtId = this.districtControl.value?.districtId;
    }

    if (cusOrder.OrderType == 2) cusOrder.ObjectId = this.objectControl.value.orderId;

    //Các gói dịch vụ được thêm 
    let listPackAdded: Array<ServicePacket> = [];
    //Lưu thông tin các tùy chọn được chọn;
    let listCustomerDetail: Array<CustomerOrderDetail> = [];
    //Lưu thuộc tính của gói và tùy chọn dịch vụ
    let listAttrPackAndOption: Array<CustomerOrderExtension> = [];

    this.listCustomerOrderDetailModel.forEach(rowData => {
      if (listPackAdded.indexOf(rowData.packetService) == -1) {
        listPackAdded.push(rowData.packetService);

        //Lưu các tùy chọn được thêm
        rowData.listOptionSave.forEach(item => {
          let newDetail = new CustomerOrderDetail();
          newDetail.servicePacketId = rowData.packetService.id;
          newDetail.optionId = item.data.id;
          newDetail.vat = item.data.vat;
          newDetail.priceInitial = item.data.price != null ? ParseStringToFloat(item.data.price.toString()) : null;
          newDetail.quantity = ParseStringToFloat(item.number.toString());
          listCustomerDetail.push(newDetail);
        });

        //Thuộc tính của tùy chọn
        rowData.listAtrrOption.forEach(item => {
          let newAttr = this.genNewAttr(item, 1);
          listAttrPackAndOption.push(newAttr);
        });

        //Thuộc tính của gói
        rowData.listAttrPacket.forEach(item => {
          let newAttr = this.genNewAttr(item, 2);
          listAttrPackAndOption.push(newAttr);
        });

      }
    });

    //Nếu là phiếu yêu cầu thì cần ít nhất 1 gói
    if (listCustomerDetail.length == 0 && this.orderTypeControl.value.value == 1) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng chọn ít nhất 1 gói dịch vụ!" };
      this.showMessage(msg);
      return;
    }
    this.loading = true;
    //Lấy địa chỉ của khách hàng
    this.customerOrderService.CreateCustomerOrder(this.orderId, discountType, discountValue,
      cusOrder, listCustomerDetail, listAttrPackAndOption, listOrderExten, this.orderProcessId, this.packId).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(msg);
          if (this.orderId == null) {
            this.router.navigate(['order/create', { OrderId: result.customerOrderID }]);
          }
          if (statusOrder == null) {
            this.getMasterData();
          } else {
            this.changeStatusCustomerOrder(statusOrder);
          }
        } else {
          let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
  }

  taoPhieuBaoCo() {
    //Nếu là chuyển khoản
    if (this.selectedPayMentMethod?.categoryCode == "CK") {
      if (this.receiptInvoiceId) {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['/accounting/bank-receipts-detail', { id: this.receiptInvoiceId }])
        );
        window.open(url, '_blank');
      } else {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['/accounting/bank-receipts-create', { orderId: this.orderId, customerId: this.cusId, type: 1 }])
        );
        window.open(url, '_blank');
      }
    }
    //Nếu là tiền mặt
    else if (this.selectedPayMentMethod?.categoryCode == "TM") {
      if (this.receiptInvoiceId) {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['/accounting/cash-receipts-view', { receiptInvoiceId: this.receiptInvoiceId }])
        );
        window.open(url, '_blank');
      } else {
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['/accounting/cash-receipts-create', { orderId: this.orderId, customerId: this.cusId, type: 1 }])
        );
        window.open(url, '_blank');
      }
    }
  }

  changeStatusCustomerOrder(statusOrder) {

    //Các gói dịch vụ được thêm 
    let listPackAdded: Array<ServicePacket> = [];
    //Lưu thông tin các tùy chọn được chọn;
    let listCustomerDetail: Array<CustomerOrderDetail> = [];

    this.listCustomerOrderDetailModel.forEach(rowData => {
      if (listPackAdded.indexOf(rowData.packetService) == -1) {
        listPackAdded.push(rowData.packetService);
        //Lưu các tùy chọn được thêm
        rowData.listOptionSave.forEach(item => {
          let newDetail = new CustomerOrderDetail();
          newDetail.servicePacketId = rowData.packetService.id;
          newDetail.optionId = item.data.id;
          newDetail.vat = item.data.vat;
          newDetail.priceInitial = item.data.price != null ? ParseStringToFloat(item.data.price.toString()) : null;
          newDetail.quantity = ParseStringToFloat(item.number.toString());
          listCustomerDetail.push(newDetail);
        });
      }
    });

    let listOrderExten: Array<CustomerOrderDetailExten> = this.listCustomerOrderDetailModel2;
    listOrderExten.forEach(item => {
      item.id = '00000000-0000-0000-0000-000000000000';
      item.quantity = ParseStringToFloat(item.quantity.toString());
      if (this.statusOrder == 2) item.price = ParseStringToFloat(item.price.toString());
    });

    var listParam = {
      OrderId: this.orderId,
      StatusOrder: statusOrder,
      LoaiChieuKhauId: this.discountType.value,
      GiaTriChietKhau: this.discountType.giaTri,
      GiaTriDonHang: this.totalCostPay,
      ListDetail: listCustomerDetail,
      ListDetailExtend: this.listCustomerOrderDetailModel2
    }

    this.customerOrderService.changeStatusCustomerOrder(listParam).subscribe(response => {
      let resultUpdate: any = response;
      this.loading = false;
      if (resultUpdate.statusCode == 200) {
        let msg = { severity: 'success', summary: 'Thông báo:', detail: resultUpdate.messageCode };
        this.showMessage(msg);

        if (statusOrder == 2) {
          this.guiXacNhan();
        }
        this.getMasterData();
      } else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: resultUpdate.messageCode };
        this.showMessage(msg);
      }
    });
  }


  genNewAttr(item: CustomerOrderExtension, type) {
    // type: 1 là tùy chọn, 2 là dịch vụ
    let newAttr = new CustomerOrderExtension();
    newAttr.attributeConfigurationId = item.attributeConfigurationId;
    newAttr.objectId = item.objectId;
    newAttr.objectType = type;
    newAttr.value = item.dataType == 3 ? new Date(item.value).toISOString() : item.value.replace(",", ""); // kiểu datatime thì chuyển thành chuỗi string
    newAttr.dataType = item.dataType;
    newAttr.servicePacketMappingOptionsId = item.servicePacketMappingOptionsId;
    return newAttr;
  }

  toggleNotifiError() {
    this.isOpenNotifiError = !this.isOpenNotifiError;
  }

  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }

  cancel() {
    this.router.navigate(['order/list']);
  }

  ngOnDestroy() {
    if (this.emitStatusChangeForm) {
      this.emitStatusChangeForm.unsubscribe();
    }
  }

  showTotalOrder() {
    this.isShow = !this.isShow;
    this.colLeft = this.isShow ? 8 : 12;
    if (this.isShow) {
      window.scrollTo(0, 0)
    }
  }

  getPhonePattern() {
    let phonePatternObj = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultPhoneType");
    return phonePatternObj.systemValueString;
  }


  //data: CustomerOrder
  choseRootOrder(data) {
    //Thông tin KH
    let customer = this.listCustomer.find(x => x.customerId == data.customerId);
    this.customerControl.setValue(customer);
    this.changeCustomer(customer);

    //Quy trình
    this.orderProcessId = data.orderProcessId;
  }

  addOrderDetailExten() {
    var newOrderExten = new CustomerOrderDetailExten();
    this.listCustomerOrderDetailModel2.push(newOrderExten);
    this.listCustomerOrderDetailModel2.forEach((item, index) => {
      item.id = index.toString();
    });
  }

  onRowEditInitChild(rowData: CustomerOrderDetailExten) {
    rowData.edit = !rowData.edit;
  }

  async onRowRemoveChild(rowData: CustomerOrderDetailExten) {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn xóa dòng này?`,
      accept: async () => {
        this.listCustomerOrderDetailModel2 = this.listCustomerOrderDetailModel2.filter(e => e != rowData);
      }
    });
  }

  /** Xử lý row con */
  onRowEditSaveChild(rowData: CustomerOrderDetailExten, event) {
    //Xác nhận phát sinh thì cần phải nhập giá
    if (this.statusOrder == 11 || this.statusOrder == 12 || this.statusOrder == 2 || this.statusOrder == 10) {
      if (!rowData.name || rowData.name == '' || !rowData.quantity || !rowData.price) {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Hãy nhập đầy đủ thông tin!' };
        this.showMessage(msg);
        return;
      }
    }
    this.calculatorAll();
    rowData.edit = !rowData.edit;
  }

  onRowEditCancelChild(rowData: any) {
    //Xác nhận phát sinh thì cần phải nhập giá
    if (this.statusOrder == 11 || this.statusOrder == 12 || this.statusOrder == 2 || this.statusOrder == 10) {
      if (!rowData.name || rowData.name == '' || !rowData.quantity || !rowData.price) {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Hãy nhập đầy đủ thông tin!' };
        this.showMessage(msg);
        return;
      }
    }
    rowData.edit = !rowData.edit;
  }

  choseStatusForDetailExten(data, rowData) {
    rowData.status = data.value;
    rowData.statusName = data.name;
    if (!rowData.price) rowData.price = 0;
  }

  viewOrderAction() {
    if (this.orderActionId == null) {
      this.router.navigate(['order/orderAction', { OrderId: this.orderId }]);
    } else {
      this.router.navigate(['order/orderAction', { OrderActionId: this.orderActionId }]);
    }
  }

  async getDuLieuQuyTrinh() {
    var doiTuongApDung = 31;
    this.quyTrinhService.getDuLieuQuyTrinh(this.orderId, doiTuongApDung, null, this.packId).subscribe(res => {
      let result: any = res;

      if (result.statusCode == 200) {
        this.listFormatStatusSupport = result.listDuLieuQuyTrinh;
      }
      else {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    });
  }


  async guiXacNhan() {
    let listOrderExten: Array<CustomerOrderDetailExten> = this.listCustomerOrderDetailModel2;
    if (listOrderExten.find(x => x.edit == true || (x.price == null && this.statusOrder != 1))) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng nhập đầy đủ thông tin dịch vụ phát sinh!" };
      this.showMessage(msg);
      return;
    }
    var doiTuongApDung = 31;
    this.loading = true;
    this.quyTrinhService.guiPheDuyet(this.orderId, doiTuongApDung, null, this.packId).subscribe(res => {
      let result: any = res;
      if (result.statusCode == 200) {
        let mgs = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);

        if (result.listEmpId.length > 0) {
          result.listEmpId.forEach(e => {
            let notification: NotificationFireBase = {
              content: "Phiếu " + this.customerOrder.orderCode + ": " + result.messageCode,
              status: false,
              url: '/order/create;OrderId=' + this.orderId,
              orderId: this.orderId,
              date: this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss'),
              employeeId: e
            }
            this.createNotificationFireBase(notification, e);
          });
        }

        this.getMasterData();
      }
      else {
        this.loading = false;
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    });
  }

  async updateCustomerOrderDetailExtend() {
    let listOrderExten: Array<CustomerOrderDetailExten> = this.listCustomerOrderDetailModel2;
    if (listOrderExten.find(x => x.edit == true || (x.price == null && this.statusOrder != 1))) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng nhập đầy đủ thông tin dịch vụ phát sinh!" };
      this.showMessage(msg);
      return;
    }

    this.loading = true;
    this.quyTrinhService.updateCustomerOrderDetailExtend(this.orderId, this.listCustomerOrderDetailModel2).subscribe(res => {
      let result: any = res;
      this.loading = false;
      if (result.statusCode == 200) {
        this.xacNhan(31);
      }
      else {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
        return;
      }
    });
  }

  async xacNhan(doiTuongApDung) {
    this.loading = true;
    this.quyTrinhService.pheDuyet(this.orderId, doiTuongApDung, '', null, this.packId).subscribe(res => {
      let result: any = res;
      if (result.statusCode == 200) {
        let mgs = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);

        let content = "Phiếu " + this.customerOrder.orderCode + ": Phê duyệt " + (this.customerOrder.objectType == 1 ? "đơn giá phát sinh" : "yêu cầu bổ sung") + " thành công!";
        if (result.listEmpId.length > 0) {
          result.listEmpId.forEach(e => {
            let notification: NotificationFireBase = {
              content: content,
              status: false,
              url: '/order/create;OrderId=' + this.orderId,
              orderId: this.orderId,
              date: this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss'),
              employeeId: e
            }
            this.createNotificationFireBase(notification, e);
          });
        };

        this.getMasterData();
      }
      else {
        this.loading = false;
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    });
  }


  async tuChoi(doiTuongApDung) {
    this.loading = true;
    this.quyTrinhService.tuChoi(this.orderId, doiTuongApDung, "Từ chối", null, this.packId).subscribe(res => {
      let result: any = res;

      if (result.statusCode == 200) {
        let mgs = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
        let content = "Phiếu " + this.customerOrder.orderCode + ": Từ chối " + (this.customerOrder.objectType == 1 ? "đơn giá phát sinh" : "yêu cầu bổ sung") + " thành công!";
        if (result.listEmpId.length > 0) {
          result.listEmpId.forEach(e => {
            let notification: NotificationFireBase = {
              content: content,
              status: false,
              url: '/order/create;OrderId=' + this.orderId,
              orderId: this.orderId,
              date: this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss'),
              employeeId: e
            }
            this.createNotificationFireBase(notification, e);
          });
        };
        this.getMasterData();
      }
      else {
        this.loading = false;
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
      }
    });
  }

  deleteCustomerOrder() {
    this.confirmationService.confirm({
      message: 'Bạn chắc chắn muốn xóa?',
      accept: () => {
        this.loading = true;
        this.customerOrderService.deleteCustomerOrder(this.orderId).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            this.router.navigate(['order/list']);
          } else {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }

  changePaymentMethod(event: PaymentMethodConfigure): void {
    this.isShowNote = this.selectedPayMentMethod?.categoryCode == "TM" ? true : false;
    if (this.orderId) {
      this.loading = true;
      this.customerOrderService.capNhatHinhThucThanhToanCustomerOrder(this.orderId, this.selectedPayMentMethod.id, this.paymentMethodNote, this.selectedPayMentMethod.content).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(msg);
        } else {
          let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(msg);
        }
      });
    }
  }

  exportExcel(): void {
    let title = "Phiếu xác nhận dịch vụ";
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);

    let line = ['Công ty CP Kiến Tạo Tài Năng - HÃY ĐỂ TÔI LO                             Cộng hoà xã hội chủ nghĩa Việt Nam'];
    let lineRow = worksheet.addRow(line);
    lineRow.font = { name: 'Calibri', size: 10, bold: true };
    worksheet.mergeCells(`A${lineRow.number}:J${lineRow.number}`);
    lineRow.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow.height = 22;


    let line1 = ['Dịch vụ: ' + this.listCustomerOrderDetailModel[0].serviceName + '                                                                  ' + 'Độc Lập - Tự do - Hạnh phúc'];
    let lineRow1 = worksheet.addRow(line1);
    worksheet.mergeCells(`A${lineRow1.number}:J${lineRow1.number}`);
    lineRow1.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow1.font = { name: 'Calibri', size: 10, bold: true };
    lineRow1.height = 22;

    let line2 = ['                                                                                                                                   -----------------'];
    let lineRow2 = worksheet.addRow(line2);
    worksheet.mergeCells(`A${lineRow2.number}:J${lineRow2.number}`);
    lineRow2.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow2.font = { name: 'Calibri', size: 10, bold: true };
    lineRow2.height = 22;

    let line3 = ['                                                                                                                                      ------------'];
    let lineRow3 = worksheet.addRow(line3);
    worksheet.mergeCells(`A${lineRow3.number}:J${lineRow3.number}`);
    lineRow3.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow3.font = { name: 'Calibri', size: 10, bold: true };
    lineRow3.height = 22;

    let line4 = ['                                        PHIẾU XÁC NHẬN DỊCH VỤ'];
    let lineRow4 = worksheet.addRow(line4);
    worksheet.mergeCells(`A${lineRow4.number}:J${lineRow4.number}`);
    lineRow4.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow4.font = { name: 'Calibri', size: 12, bold: true };
    lineRow4.height = 22;

    let line5 = ['Xác nhận thông tin khách hàng đã lựu chọn dịch vụ: ' + this.listCustomerOrderDetailModel[0].serviceName];
    let lineRow5 = worksheet.addRow(line5);
    worksheet.mergeCells(`A${lineRow5.number}:J${lineRow5.number}`);
    lineRow5.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow5.font = { name: 'Calibri', size: 10 };
    lineRow5.height = 22;

    let line6 = ['Khách hàng: ' + this.customerControl.value?.customerName];
    let lineRow6 = worksheet.addRow(line6);
    worksheet.mergeCells(`A${lineRow6.number}:J${lineRow6.number}`);
    lineRow6.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow6.font = { name: 'Calibri', size: 10 };
    lineRow6.height = 22;

    let line7 = ['Địa chỉ: ' + this.fullAddressControl.value];
    let lineRow7 = worksheet.addRow(line7);
    worksheet.mergeCells(`A${lineRow7.number}:J${lineRow7.number}`);
    lineRow7.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow7.font = { name: 'Calibri', size: 10 };
    lineRow7.height = 22;

    let line8 = ['Số điện thoại: ' + this.customerControl.value?.customerPhone];
    let lineRow8 = worksheet.addRow(line8);
    worksheet.mergeCells(`A${lineRow8.number}:J${lineRow8.number}`);
    lineRow8.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow8.font = { name: 'Calibri', size: 10 };
    lineRow8.height = 22;

    let line9 = ['Dịch vụ hỗ trợ'];
    let lineRow9 = worksheet.addRow(line9);
    worksheet.mergeCells(`A${lineRow9.number}:J${lineRow9.number}`);
    lineRow9.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow9.font = { name: 'Calibri', size: 10 };
    lineRow9.height = 22;

    let dataHeaderRow = ['#', 'Tên gói dịch vụ', '', '	Tên dịch vụ', '', '', 'Số lượng', 'VAT (%)', 'Giá tiền', ''];
    let headerRow = worksheet.addRow(dataHeaderRow);
    worksheet.mergeCells(`B${headerRow.number}:C${headerRow.number}`);
    worksheet.mergeCells(`D${headerRow.number}:F${headerRow.number}`);
    worksheet.mergeCells(`I${headerRow.number}:J${headerRow.number}`);
    headerRow.font = { name: 'Calibri', size: 10, bold: true };
    dataHeaderRow.forEach((item, index) => {
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      if (item == "#" || item == "Số lượng" || item == "VAT (%)" || item == "Giá tiền" || index == dataHeaderRow.length - 1) {
        headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
      } else {
        headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
      headerRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
    });
    headerRow.height = 25;

    if (this.listCustomerOrderDetailModel != null && this.listCustomerOrderDetailModel != undefined) {
      this.listCustomerOrderDetailModel.forEach((item, index) => {
        let dataItem = [index + 1, item.serviceName, '', item.optionName, '', '', item.number, item.vat, this.decimalPipe.transform(item.cost), ''];
        let itemRow = worksheet.addRow(dataItem);
        worksheet.mergeCells(`B${itemRow.number}:C${itemRow.number}`);
        worksheet.mergeCells(`D${itemRow.number}:F${itemRow.number}`);
        worksheet.mergeCells(`I${itemRow.number}:J${itemRow.number}`);

        itemRow.font = { name: 'Calibri', size: 10 };
        dataItem.forEach((item, index) => {
          itemRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          if (!Number.isNaN(Number(item)) && item != "") {
            itemRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
          } else if (index == dataHeaderRow.length - 1) {
            itemRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
          } else {
            itemRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          }
          itemRow.getCell(index + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' }
          };
          itemRow.height = 30;
        });
      });
    }

    if (this.listCustomerOrderDetailModel.length < 22) {
      for (let index = 0; index <= (22 - this.listCustomerOrderDetailModel.length); index++) {
        let emptyRow = ['', '', '', '', '', '', '', '', '', ''];
        let itemRow = worksheet.addRow(emptyRow);
        worksheet.mergeCells(`A${itemRow.number}:J${itemRow.number}`);
      }
    }

    let date = "                                                                                                                    Ngày: " + this.formatDate(new Date(), '-', false);
    let line10 = [date];
    let lineRow10 = worksheet.addRow(line10);
    worksheet.mergeCells(`A${lineRow10.number}:J${lineRow10.number}`);
    lineRow10.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow10.font = { name: 'Calibri', size: 10, bold: true };
    lineRow10.height = 22;

    let line11 = ['                                                                                                                    Kế toán'];
    let lineRow11 = worksheet.addRow(line11);
    worksheet.mergeCells(`A${lineRow11.number}:J${lineRow11.number}`);
    lineRow11.getCell(1).alignment = { vertical: 'middle', wrapText: true, };
    lineRow11.font = { name: 'Calibri', size: 10, bold: true };
    lineRow11.height = 22;

    /* fix with for column */
    worksheet.getColumn(1).width = 8;
    worksheet.getColumn(2).width = 8;
    worksheet.getColumn(3).width = 9;
    worksheet.getColumn(4).width = 9;
    worksheet.getColumn(6).width = 8;
    worksheet.getColumn(5).width = 8;
    worksheet.getColumn(7).width = 8;
    worksheet.getColumn(8).width = 8;

    this.exportToExel(workBook, title);
  }


  dialogChuyenPheDuyet: boolean = false;
  listEmpSelected: Array<EmployeeEntityModel> = [];
  listEmp: Array<string> = [];
  chuyenPheDuyet() {
    this.dialogChuyenPheDuyet = true;
    this.listEmpSelected = [];

  }

  closeDialogChuyenPheDuyet() {
    this.dialogChuyenPheDuyet = false;
    this.listEmpSelected = [];
  }

  luuChuyenTiepPheDuyet() {
    if (this.listEmpSelected == null || this.listEmpSelected.length == 0) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Vui lòng chọn ít nhất 1 nhân viên!" };
      this.showMessage(msg);
      return;
    }

    var listEmpId = this.listEmpSelected.map(x => x.employeeId);
    this.loading = true;
    this.customerOrderService.luuNhanVienPheDuyetChuyenTiep(this.orderId, listEmpId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
        this.closeDialogChuyenPheDuyet();
        this.getMasterData();
      } else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  chonKhuvuc() {
    this.districtControl.setValue(null);
    this.wardControl.setValue(null);
  }

  chonQuanHuyen() {
    this.wardControl.setValue(null);
  }


  xacNhanDichVuPhatSinhChuyenTiepPD() {
    this.loading = true;
    this.quyTrinhService.updateCustomerOrderDetailExtend(this.orderId, this.listCustomerOrderDetailModel2).subscribe(res => {
      let result: any = res;
      this.loading = false;
      if (result.statusCode == 200) {

        this.loading = true;
        this.customerOrderService.xacNhanDichVuPhatSinhChuyenTiepPD(this.orderId).subscribe(response => {
          let result1: any = response;
          this.loading = false;
          if (result1.statusCode == 200) {
            let msg = { severity: 'success', summary: 'Thông báo:', detail: result1.messageCode };
            this.showMessage(msg);
            this.getMasterData();
          } else {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result1.messageCode };
            this.showMessage(msg);
          }
        });

      }
      else {
        let mgs = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(mgs);
        return;
      }
    });
  }

  xacNhanTuChoiChuyenTiepPDBS(type) {
    // type == 1: Xác nhận
    // type == 2: Từ chối

    this.loading = true;
    this.customerOrderService.xacNhanTuChoiChuyenTiepPDBS(type, this.orderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
        //Nếu là từ chối => gửi thông báo
        if (type == 2) {
          let content = "Phiếu " + this.customerOrder.orderCode + ": Từ chối " + (this.customerOrder.objectType == 1 ? "đơn giá phát sinh" : "yêu cầu bổ sung") + " thành công!";
          if (result.listEmpId.length > 0) {
            result.listEmpId.forEach(e => {
              let notification: NotificationFireBase = {
                content: content,
                status: false,
                url: '/order/create;OrderId=' + this.orderId,
                orderId: this.orderId,
                date: this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss'),
                employeeId: e
              }
              this.createNotificationFireBase(notification, e);
            });
          };
        }
        this.getMasterData();
      } else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }


  exportToExel(workbook: Workbook, fileName: string): void {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  formatDate(date: Date, txt: string, isMonth: boolean): string {
    var dateItem = new Date(date);
    const yyyy = dateItem.getFullYear();
    let mm = dateItem.getMonth() + 1; // Months start at 0!
    let dd = dateItem.getDate();

    let ddtxt = '' + dd;
    let mmtxt = '' + mm;

    if (dd < 10) ddtxt = '0' + dd;
    if (mm < 10) mmtxt = '0' + mm;

    let formattedToday = ddtxt + txt + mmtxt + txt + yyyy;

    if (isMonth) {
      formattedToday = mmtxt + txt + yyyy;
    }
    return formattedToday;
  }
}


function ParseStringToFloat(str: string) {
  if (str === "") return 0;
  str = str.replace(/,/g, '');
  return parseFloat(str);
}


