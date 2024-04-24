import { Component, OnInit, ElementRef, ViewChild, HostListener, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import * as $ from 'jquery';

import { TranslateService } from '@ngx-translate/core';
import { VendorService } from "../../services/vendor.service";
import { ContactService } from "../../../shared/services/contact.service";
import { BankService } from "../../../shared/services/bank.service";

import { VendorModel } from "../../models/vendor.model";
import { ContactModel, contactModel } from "../../../shared/models/contact.model";

import { AbstractBase } from '../../../../../src/app/shared/abstract-base.component';
import { VendorGroupModel } from '../../../../../src/app/product/components/product-options/model/list-vendor';
import { BankAccountModel, ContactVendorDialogModel, DistrictModel, ExchangeByVendorModel, Month, PaymentMethodModel, ProvinceModel, WardModel } from '../../../../../src/app/shared/models/commonModel';
import { RegexConst } from '../../../../../src/app/shared/regex-const';
import { VendorOrderModel } from '../../models/vendorOrder.model';
import { Table } from 'primeng';

class vendorOrderByMonthModel {
  month: number;
  amount: number;
  constructor() {
    this.month = 1;
    this.amount = 0;
  }
}

@Component({
  selector: 'app-detail-vendor',
  templateUrl: './detail-vendor.component.html',
  styleUrls: ['./detail-vendor.component.css']
})

export class DetailVendorComponent extends AbstractBase implements OnInit {
  data: any;
  options: any;
  emailPattern = RegexConst.emailPattern;

  editPermission: string = "vendor/edit";
  viewPermission: string = "vendor/view";

  orderCreatePermission: string = "vendor-order/create";
  orderListPermission: string = "vendor-order";
  orderViewPermission: string = "vendor-order/view";

  /*Check user permission*/
  actionEdit: boolean = true;
  actionDelete: boolean = true;

  vendorId: string = '';
  contactId: string = '';
  optionsLine: any = '';
  //master data
  listVendorGroup: Array<VendorGroupModel> = [];
  listPaymentMethod: Array<PaymentMethodModel> = [];
  listProvince: Array<ProvinceModel> = [];
  listDistrict: Array<DistrictModel> = [];
  listCurrentDistrict: Array<DistrictModel> = [];
  listWard: Array<WardModel> = [];
  listCurrentWard: Array<WardModel> = [];
  listVendorCode: Array<string> = [];
  listVendorOrderByMonth: Array<vendorOrderByMonthModel> = []; //tổng đặt sp/dv
  listVendorOrderInProcessByMonth: Array<vendorOrderByMonthModel> = []; //tổng đơn hàng đang xử lý
  listReceivableByMonth: Array<vendorOrderByMonthModel> = []; //nợ phải trả
  //data by vendor id
  vendorModel: VendorModel = new VendorModel();
  contactModel: contactModel = new contactModel();
  listBankAccount: Array<BankAccountModel> = [];
  listVendorContact: Array<contactModel> = [];
  listVendorOrder: Array<VendorOrderModel> = [];
  listExchange: Array<ExchangeByVendorModel> = [];

  listMonth: Array<Month> = [
    { label: 'Tháng 1', result: 1 },
    { label: 'Tháng 2', result: 2 },
    { label: 'Tháng 3', result: 3 },
    { label: 'Tháng 4', result: 4 },
    { label: 'Tháng 5', result: 5 },
    { label: 'Tháng 6', result: 6 },
    { label: 'Tháng 7', result: 7 },
    { label: 'Tháng 8', result: 8 },
    { label: 'Tháng 9', result: 9 },
    { label: 'Tháng 10', result: 10 },
    { label: 'Tháng 11', result: 11 },
    { label: 'Tháng 12', result: 12 }
  ];

  listTrangThai = [
    {
      id: 1, text: 'Đang hoạt động - Được phép truy cập'
    },
    {
      id: 2, text: 'Đang hoạt động - Không được phép truy cập'
    },
    {
      id: 3, text: 'Ngừng hoạt động'
    }
  ];

  //chart
  selectedMonth: Month = this.listMonth.find(e => e.result == new Date().getMonth() + 1);
  vendorOrderByMonth: vendorOrderByMonthModel = new vendorOrderByMonthModel(); //Tổng đặt sp/ dv
  preVendorOrderByMonth: vendorOrderByMonthModel = new vendorOrderByMonthModel();//Tổng đặt tháng trước
  receivableByMonth: vendorOrderByMonthModel = new vendorOrderByMonthModel(); //Nợ phải trả
  preReceivableByMonth: vendorOrderByMonthModel = new vendorOrderByMonthModel();//Nợ phải trả tháng trước
  vendorOrderInProcessByMonth: vendorOrderByMonthModel = new vendorOrderByMonthModel(); //Đang xử lý
  preVendorOrderInProcessByMonth: vendorOrderByMonthModel = new vendorOrderByMonthModel();//Đang xử lý tháng trước


  listContact: Array<ContactVendorDialogModel> = [];
  rows: number = 10;
  selectedContact: ContactModel;

  filterGlobar1: string = '';
  filterGlobar2: string = '';
  filterGlobar3: string = '';

  @ViewChild('myTable1') myTable1: Table;
  @ViewChild('myTable2') myTable2: Table;
  @ViewChild('myTable3') myTable3: Table;

  cols1: Array<any> = [
    { field: 'stt', header: 'Stt', textAlign: "center", width: '50px' },
    { field: 'loaiDichVu', header: 'Loại dịch vụ', textAlign: "left", width: '200px' },
    { field: 'optionName', header: 'Dịch vụ', textAlign: "left", width: '150px' },

    { field: 'donViTien', header: 'Đơn vị tiền', textAlign: "center", width: '120px' },
    { field: 'price', header: 'Đơn giá', textAlign: "right", width: '150px' },
    { field: 'thueGtgt', header: 'Thuế GTGT (%)', textAlign: "center", width: '150px' },
    { field: 'giaTriChietKhau', header: 'Chiết khấu', textAlign: "right", width: '150px' },
    { field: 'prepaymentValue', header: 'Giá trị thanh toán ', textAlign: "right", width: '150px' },
    { field: 'efftiveDate', header: 'Thời gian hiệu lực', textAlign: "center", width: '190px' },
    { field: 'mucHoaHong', header: 'Mức hoa hồng', textAlign: "center", width: '190px' },
  ];

  cols2: Array<any> = [
    { field: 'stt', header: 'STT', textAlign: 'left', width: '60px', },
    { field: 'vendorOrderCode', header: 'Đơn hàng', textAlign: 'center', width: '180px' },
    { field: 'vendorOrderDate', header: 'Ngày tạo đơn', textAlign: 'center', width: '180px' },
    { field: 'optionName', header: 'Tên dịch vụ', textAlign: 'left', width: '180px' },
    { field: 'vendorOrderType', header: 'Loại đơn hàng', textAlign: 'center', width: '180px' },
    { field: 'tongTienDonHang', header: 'Tổng tiền đơn hàng', textAlign: 'center', width: '180px' },
    { field: 'tongTienHoaHong', header: 'Hoa hồng', textAlign: 'center', width: '180px' },
    { field: 'statusName', header: 'Trạng thái', textAlign: 'center', width: '180px' },
  ];

  cols3: Array<any> = [
    { field: 'stt', header: 'STT', textAlign: 'left', width: '60px', },
    { field: 'orderActionCode', header: 'Đơn đặt dịch vụ', textAlign: 'left', width: '180px' },
    { field: 'tenDichVu', header: 'Tên dịch vụ', textAlign: 'left', width: '180px' },
    { field: 'rateContent', header: 'Nội dung đánh giá', textAlign: 'left', width: '180px' },
    { field: 'rateStar', header: 'Rating', textAlign: 'center', width: '180px' },
    { field: 'createdDate', header: 'Thời gian', textAlign: 'center', width: '180px' },
  ];

  listDv = []
  listDonHang = []
  listDanhGia = []

  selectedOrder: VendorOrderModel;


  selectedExchange: ExchangeByVendorModel;

  start: number = 4;

  //form
  editVendorForm: FormGroup;
  vendorPrice: number;

  tongBaiDanhGia: number = 0;
  oneStart: number = 0;
  twoStart: number = 0;
  threeStart: number = 0;
  fourtStart: number = 0;
  fiveStart: number = 0;
  trungBinh: number = 0;

  constructor(
    injector: Injector,
    private translate: TranslateService,
    private vendorService: VendorService,
    private bankService: BankService,
    private contactService: ContactService,
    public builder: FormBuilder,
    private el: ElementRef,
  ) {
    super(injector);
    translate.setDefaultLang('vi');
  }

  async ngOnInit() {
    this.initForm();

    let resource = "buy/vendor/detail/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("edit") == -1) {
        this.actionEdit = false;
      } if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }

      this.route.params.subscribe(params => { this.vendorId = params['vendorId']; this.contactId = params['contactId']; });

      this.getMasterData();

      this.options = {
        title: {
          display: true,
          text: 'My Title',
          fontSize: 16
        },
        legend: {
          position: 'bottom'
        }
      };

      this.listMonth = this.listMonth.filter(e => e.result <= new Date().getMonth() + 1);
    }
  }

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

  initForm() {
    this.editVendorForm = new FormGroup({
      'VendorGroup': new FormControl(null, [Validators.required]),
      'VendorCode': new FormControl('', [Validators.required, this.checkBlankString()]),
      'VendorName': new FormControl('', [Validators.required, this.checkBlankString()]),
      'Email': new FormControl('', [Validators.pattern(this.emailPattern)]),
      'Phone': new FormControl('', [Validators.required]),
      'Location': new FormControl("1"),
      'Province': new FormControl(null),
      'District': new FormControl(null),
      'Ward': new FormControl(null),
      'Address': new FormControl(''),
      'PaymentMethod': new FormControl(null, [Validators.required]),
      'Link': new FormControl(''),
      'TrangThai': new FormControl(null)
    });
  }

  showToast(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  goBackToList() {
    this.router.navigate(['/vendor/list']);
  }

  goToVenderOrderDetail(rowData: VendorOrderModel) {
    let url = this.router.serializeUrl(this.router.createUrlTree(['/vendor/detail-order', { vendorOrderId: rowData.vendorOrderId }]));
    window.open(url, '_blank');
  }

  viewOrderAction(id: string) {
    let url = this.router.serializeUrl(this.router.createUrlTree(['order/orderAction', { OrderActionId: id }]));
    window.open(url, '_blank');
  }

  changeProvince(event: any): boolean {
    //reset list district and ward
    this.listCurrentDistrict = [];
    this.listCurrentWard = [];
    this.editVendorForm.get('District').setValue(null);
    this.editVendorForm.get('Ward').setValue(null);
    if (event.value === null) return false;
    let currentProvince: ProvinceModel = event.value;
    this.listCurrentDistrict = this.listDistrict.filter(e => e.provinceId === currentProvince.provinceId);
    return false;
  }

  changeDistrict(event: any): boolean {
    //reset ward
    this.listCurrentWard = [];
    this.editVendorForm.get('Ward').setValue(null);
    if (event.value === null) return false;
    let currentDistrict: DistrictModel = event.value;
    this.listCurrentWard = this.listWard.filter(e => e.districtId === currentDistrict.districtId);
    return false
  }

  editContact(rowData: ContactVendorDialogModel) {
  }

  deleteContact(rowData: ContactVendorDialogModel) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: () => {
        this.loading = true;
        this.contactService.deleteContactById(rowData.ContactId, rowData.ObjectId, "VEN_CON").subscribe(response => {
          this.loading = false;
          const result = <any>response;
          if (result.statusCode === 202 || result.statusCode === 200) {
            this.listContact = this.listContact.filter(e => e != rowData);
            this.clearToast();
            this.showToast('success', 'Thông báo', 'Xóa người liên hệ thành công');
          } else {
            this.clearToast();
            this.showToast('error', 'Thông báo', result.messageCode);
          }
        });
      }
    });
  }

  deleteBankById(bank: BankAccountModel) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: () => {
        this.loading = true;
        this.bankService.deleteBankById(bank.bankAccountId, bank.objectId, bank.objectType).subscribe(response => {
          this.loading = false;
          const result = <any>response;
          if (result.statusCode === 202 || result.statusCode === 200) {
            this.listBankAccount = this.listBankAccount.filter(e => e != bank);
            this.clearToast();
            this.showToast('success', 'Thông báo', 'Xóa thành công');
          } else {
            this.clearToast();
            this.showToast('error', 'Thông báo', result.messageCode);
          }
        });
      }
    });
  }


  async getMasterData() {
    this.loading = true;
    let [masterdataResponse, vendorDataResponse, vendorOrderResponse]: any = await Promise.all([
      this.vendorService.getDataEditVendor(this.vendorId, this.auth.UserId),
      this.vendorService.getVendorByIdAsync(this.vendorId, this.contactId, this.auth.UserId),
      this.vendorService.searchVendorOrderAsync([this.vendorId], '', null, null, [], this.auth.UserId)
    ]);
    this.loading = false;
    if (masterdataResponse.statusCode === 200 && vendorDataResponse.statusCode === 200 && vendorOrderResponse.statusCode === 200) {
      //master data
      this.listProvince = masterdataResponse.listProvince;
      this.listDistrict = masterdataResponse.listDistrict;
      this.listWard = masterdataResponse.listWard;
      this.listVendorGroup = masterdataResponse.listVendorGroup;
      this.listVendorCode = masterdataResponse.listVendorCode;
      this.listPaymentMethod = masterdataResponse.listPaymentMethod;
      this.listVendorOrderByMonth = masterdataResponse.listVendorOrderByMonth;
      this.listVendorOrderInProcessByMonth = masterdataResponse.listVendorOrderInProcessByMonth;
      this.listReceivableByMonth = masterdataResponse.listReceivableByMonth;
      //data by vendor id
      this.vendorModel = vendorDataResponse.vendor;
      this.vendorPrice = vendorDataResponse.vendor.price;
      this.contactModel = vendorDataResponse.contact;
      this.listExchange = vendorDataResponse.listExchangeByVendor;

      this.listDv = vendorDataResponse.listDv;
      this.listDonHang = vendorDataResponse.listVendorOrder;
      this.listDanhGia = vendorDataResponse.listDanhGia;

      if (this.listDanhGia) {
        this.tongBaiDanhGia = this.listDanhGia.length;
        let listDiem = this.listDanhGia.map(x => x.rateStar);

        this.oneStart = listDiem.filter(x => x == 1).length / this.tongBaiDanhGia * 100;
        this.twoStart = listDiem.filter(x => x == 2).length / this.tongBaiDanhGia * 100;
        this.threeStart = listDiem.filter(x => x == 3).length / this.tongBaiDanhGia * 100;
        this.fourtStart = listDiem.filter(x => x == 4).length / this.tongBaiDanhGia * 100;
        this.fiveStart = listDiem.filter(x => x == 5).length / this.tongBaiDanhGia * 100;

        this.trungBinh = 0;
        for (let i = 1; i < 6; i++) {
          this.trungBinh += this.tinhDiemTheoStart(listDiem, i);
        }
        this.trungBinh = this.trungBinh / this.tongBaiDanhGia;
      }

      this.contactModel.fullAddress = this.fullAddressBuilder(this.contactModel.address, this.contactModel.provinceId, this.contactModel.districtId, this.contactModel.wardId);
      this.mapDataToForm(this.vendorModel, this.contactModel);

      this.listContact = this.getListContact(vendorDataResponse.vendorContactList);
      this.listBankAccount = vendorDataResponse.vendorBankAccountList;
      this.listVendorOrder = vendorOrderResponse.vendorOrderList;

    } else if (masterdataResponse.statusCode !== 200) {
      this.clearToast();
      this.showToast('error', 'Thông báo', masterdataResponse.messageCode);
    } else if (vendorDataResponse.statusCode !== 200) {
      this.clearToast();
      this.showToast('error', 'Thông báo', vendorDataResponse.messageCode);
    } else if (vendorOrderResponse.statusCode !== 200) {
      this.clearToast();
      this.showToast('error', 'Thông báo', vendorOrderResponse.messageCode);
    }
  }

  tinhDiemTheoStart(listDiem, star): number {
    const initialValue = 0;
    listDiem = listDiem.filter(x => x == star);
    return listDiem.reduce(
      (accumulator, currentValue) => (accumulator ?? 0) + currentValue,
      initialValue,
    );
  }

  mapDataToForm(vendorModel: VendorModel, contactModel: contactModel) {
    let _vendorGroup = this.listVendorGroup.find(e => e.categoryId == vendorModel.vendorGroupId);
    this.editVendorForm.get('VendorGroup').patchValue(_vendorGroup ? _vendorGroup : null);
    this.editVendorForm.get('VendorCode').patchValue(vendorModel.vendorCode ? vendorModel.vendorCode : '');
    this.editVendorForm.get('VendorName').patchValue(vendorModel.vendorName ? vendorModel.vendorName : '');
    this.editVendorForm.get('Email').patchValue(contactModel.email ? contactModel.email : '');
    this.editVendorForm.get('Phone').patchValue(contactModel.phone ? contactModel.phone : '');

    let trangThai = this.listTrangThai.find(x => x.id == vendorModel.trangThaiId);
    this.editVendorForm.get('TrangThai').patchValue(trangThai);



    let _paymentMethod = this.listPaymentMethod.find(e => e.categoryId == vendorModel.paymentId);
    this.editVendorForm.get('PaymentMethod').patchValue(_paymentMethod ? _paymentMethod : null);
    let _province = this.listProvince.find(e => e.provinceId == contactModel.provinceId);
    if (_province) {
      this.listCurrentDistrict = this.listDistrict.filter(e => e.provinceId === _province.provinceId);
    } else {
      this.listCurrentDistrict = [];
    }
    let _district = this.listCurrentDistrict.find(e => e.districtId == contactModel.districtId);
    if (_district) {
      this.listCurrentWard = this.listWard.filter(e => e.districtId === _district.districtId);
    } else {
      this.listCurrentWard = [];
    }
    let _ward = this.listCurrentWard.find(e => e.wardId == contactModel.wardId);
    this.editVendorForm.get('Province').patchValue(_province ? _province : null);
    this.editVendorForm.get('District').patchValue(_district ? _district : null);
    this.editVendorForm.get('Ward').patchValue(_ward ? _ward : null);
    this.editVendorForm.get('Address').patchValue(contactModel.address ? contactModel.address : '');
    this.editVendorForm.get('Link').patchValue(contactModel.socialUrl ? contactModel.socialUrl : '');


  }

  editVendorInfor() {
    if (!this.editVendorForm.valid) {
      Object.keys(this.editVendorForm.controls).forEach(key => {
        if (!this.editVendorForm.controls[key].valid) {
          this.editVendorForm.controls[key].markAsTouched();
        }
      });
      let target = this.el.nativeElement.querySelector('.form-control.ng-invalid');
      if (target) {
        $('html,body').animate({ scrollTop: $(target).offset().top }, 'slow');
        target.focus();
      }
    } else {
      let vendorModel: VendorModel = this.mapFormToVendorModel();
      let contactModel: ContactModel = this.mapFormToContactModel();
      this.loading = true;
      this.vendorService.updateVendorById(vendorModel, contactModel, this.auth.Userid).subscribe(response => {
        this.loading = false;
        const result = <any>response;
        if (result.statusCode === 202 || result.statusCode === 200) {
          this.editVendorViewModel(vendorModel, contactModel);
          this.clearToast();
          this.showToast('success', 'Thông báo', 'Chỉnh sửa nhà cung cấp thành công');
        } else {
          this.clearToast();
          this.showToast('error', 'Thông báo', result.messageCode);
        }
      }, error => { this.loading = false; });
    }
  }

  mapFormToVendorModel(): VendorModel {
    let vendorModel = new VendorModel();
    vendorModel.vendorId = this.vendorId;
    vendorModel.vendorName = this.editVendorForm.get('VendorName').value;
    vendorModel.vendorCode = this.editVendorForm.get('VendorCode').value;
    vendorModel.vendorGroupId = this.editVendorForm.get('VendorGroup').value.categoryId;
    vendorModel.paymentId = this.editVendorForm.get('PaymentMethod').value.categoryId;
    vendorModel.active = true;
    vendorModel.createdById = this.auth.UserId;
    vendorModel.createdDate = new Date();
    vendorModel.updatedById = null;
    vendorModel.updatedDate = null;
    vendorModel.price = this.vendorPrice;
    vendorModel.trangThaiId = this.editVendorForm.get('TrangThai').value?.id;

    return vendorModel;
  }

  mapFormToContactModel(): ContactModel {
    let contactModel = new ContactModel();
    contactModel.ContactId = this.contactId;
    contactModel.ObjectId = this.vendorId;
    contactModel.ObjectType = "VEN";
    contactModel.Email = this.editVendorForm.get('Email').value;
    contactModel.Phone = this.editVendorForm.get('Phone').value;
    let _province = this.editVendorForm.get('Province').value;
    let _district = this.editVendorForm.get('District').value;
    let _ward = this.editVendorForm.get('Ward').value;
    contactModel.ProvinceId = _province !== null ? _province.provinceId : null;
    contactModel.DistrictId = _district !== null ? _district.districtId : null;
    contactModel.WardId = _ward !== null ? _ward.wardId : null;
    contactModel.Address = this.editVendorForm.get('Address').value;
    contactModel.SocialUrl = this.editVendorForm.get('Link').value;

    contactModel.Active = true;
    contactModel.CreatedById = this.auth.UserId;
    contactModel.CreatedDate = new Date();
    contactModel.UpdatedById = null;
    contactModel.UpdatedDate = null;
    return contactModel;
  }

  fullAddressBuilder(address, provinceId, districtId, wardId): string {
    let arr: Array<string> = [];
    if (address) arr = [...arr, address];
    let _ward = this.listWard.find(e => e.wardId == wardId);
    if (_ward) arr = [...arr, `${_ward.wardType} ${_ward.wardName}`];
    let _district = this.listDistrict.find(e => e.districtId == districtId);
    if (_district) arr = [...arr, `${_district.districtType} ${_district.districtName}`];
    let _province = this.listProvince.find(e => e.provinceId == provinceId);
    if (_province) arr = [...arr, `${_province.provinceType} ${_province.provinceName}`];
    return arr.join(', ');
  }

  editVendorViewModel(vendorModel: VendorModel, contactModel: ContactModel) {
    this.vendorModel.vendorName = vendorModel.vendorName;
    this.vendorModel.vendorCode = vendorModel.vendorCode;
    this.contactModel.phone = contactModel.Phone;
    this.contactModel.email = contactModel.Email;
    this.contactModel.fullAddress = this.fullAddressBuilder(contactModel.Address, contactModel.ProvinceId, contactModel.DistrictId, contactModel.WardId);
    let _payment = this.listPaymentMethod.find(e => e.categoryId == vendorModel.paymentId);
    this.vendorModel.paymentName = _payment ? _payment.categoryName : '';
    this.vendorModel.price = Number(parseFloat(String(vendorModel.price).replace(/,/g, '')));
    this.contactModel.socialUrl = contactModel.SocialUrl;
  }

  getListContact(listContact: Array<contactModel>) {
    let listContactDialog: Array<ContactVendorDialogModel> = [];
    listContact.forEach(contact => {
      let newContact: ContactVendorDialogModel = new ContactVendorDialogModel();
      newContact.ContactId = contact.contactId;
      newContact.ObjectId = contact.objectId;
      newContact.ObjectType = contact.objectType;
      newContact.FullName = contact.firstName;
      newContact.GenderDisplay = contact.gender;

      newContact.Role = contact.role;
      newContact.Email = contact.email;
      newContact.Phone = contact.phone;
      newContact.CreatedDate = contact.createdDate;
      newContact.CreatedById = contact.createdById;
      newContact.UpdatedDate = contact.updatedDate;
      newContact.UpdatedById = contact.updatedById;

      if (contact.gender == "NU") {
        newContact.GenderName = "Bà";
      } else {
        newContact.GenderName = "Ông";
      }

      listContactDialog.push(newContact)
    });
    return listContactDialog;
  }

}
