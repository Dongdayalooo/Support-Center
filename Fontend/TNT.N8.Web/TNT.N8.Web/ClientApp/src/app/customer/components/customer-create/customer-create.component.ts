import { Component, OnInit, ChangeDetectorRef, Injector } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { CustomerService } from '../../services/customer.service';

import { CustomerModel, OrderProcessMappingEmployeeEntityModel } from "../../models/customer.model";
import { ContactModel } from "../../../shared/models/contact.model";
import { NoteService } from '../../../../../src/app/shared/services/note.service';
import { tap } from 'rxjs/operators';
import { ContactService } from '../../../../../src/app/shared/services/contact.service';
import { CustomerOrderService } from '../../../../../src/app/order/services/customer-order.service';
import { RegexConst } from '../../../../../src/app/shared/regex-const';
import { CategoryModel } from '../../../../../src/app/shared/models/category.model';
import { AbstractBase } from '../../../../../src/app/shared/abstract-base.component';
import { ProvinceModel } from '../../../../../src/app/shared/models/commonModel';

@Component({
  selector: 'app-customer-create',
  templateUrl: './customer-create.component.html',
  styleUrls: ['./customer-create.component.css'],
})

export class CustomerCreateComponent extends AbstractBase implements OnInit {
  emailPattern = RegexConst.emailPattern;
  applicationName = this.systemParameterList.find(x => x.systemKey == 'ApplicationName').systemValueString;

  customerId: string = "";

  //list action in page
  actionAdd: boolean = true;
  awaitResult: boolean = false;
  /*End*/

  /* master data */
  listCustomerGroup: Array<CategoryModel> = []; //nhom khach hang

  listProvince: Array<ProvinceModel> = []; //master data
  /* end */

  listGenders = [
    { code: 'NAM', name: 'Nam' },
    { code: 'NU', name: 'Nữ' }
  ];

  //Danh sách đơn hàng
  columnsCustomerOrder: Array<any> = [
    { field: 'orderCode', header: 'Đơn hàng', width: '150px', textAlign: 'center', color: '#f44336' },
    { field: 'createdDate', header: 'Ngày tạo đơn', width: '150px', textAlign: 'center', color: '#f44336' },
    { field: 'listPacketServiceName', header: 'Gói dịch vụ', width: '150px', textAlign: 'left', color: '#f44336' },
    { field: 'amount', header: 'Tổng tiền', width: '150px', textAlign: 'right', color: '#f44336' },
    { field: 'orderStatusName', header: 'Trạng thái', width: '150px', textAlign: 'center', color: '#f44336' }
  ];

  listCustomerOrder: Array<any> = [];

  //Danh sách đánh giá
  columnsRating: Array<any> = [
    { field: 'orderActionCode', header: 'Đơn đặt dịch vụ', textAlign: 'center', width: '180px' },
    { field: 'objectTypeName', header: 'Đối tượng đánh giá', textAlign: 'center', width: '180px' },
    { field: 'objectName', header: 'Họ tên', textAlign: 'center', width: '180px' },
    { field: 'rateContent', header: 'Nội dung đánh giá', textAlign: 'left', width: '180px' },
    { field: 'rateStar', header: 'Rating', textAlign: 'center', width: '180px' },
    { field: 'createdDate', header: 'Thời gian', textAlign: 'center', width: '180px' },
  ];

  listRating: Array<any> = [];

  /* contact table */
  columnsContact: Array<any> = [
    { field: 'contactName', header: 'Người liên hệ', width: '150px', textAlign: 'left', color: '#f44336' },
    { field: 'genderName', header: 'Giới tính', width: '80px', textAlign: 'left', color: '#f44336' },
    { field: 'phone', header: 'Số điện thoại', width: '150px', textAlign: 'left', color: '#f44336' },
    { field: 'email', header: 'Email', width: '150px', textAlign: 'left', color: '#f44336' },
    { field: 'action', header: 'Thao tác', width: '70px', textAlign: 'center', color: '#f44336' }
  ];

  listContact: Array<ContactModel> = [];
  rows: number = 10;

  userId = this.auth.UserId;

  filteredCustomer: Array<any> = [];

  listStaffCharge: any[] = [];
  listStaffChargeModel: any[] = [];

  customerGroupId: string;
  customerGroupModel: CategoryModel;

  //Thông tin KH cá nhân/ doanh nghiệp
  customerInforForm: FormGroup;
  customerTypeControl: FormControl = new FormControl(2, [Validators.required]);
  customerReviewControl: FormControl = new FormControl(null);
  customerCodeControl: FormControl = new FormControl(null);
  genderControl: FormControl = new FormControl(null);
  emailControl: FormControl = new FormControl(null);
  dateOfBirthControl: FormControl = new FormControl(null);
  phoneControl: FormControl = new FormControl(null);
  firstNameControl: FormControl = new FormControl(null);
  lastNameControl: FormControl = new FormControl(null);
  customerGroupControl: FormControl = new FormControl(null);
  nhanVienPhuTrachControl: FormControl = new FormControl(null);
  tinhThanhPhoControl: FormControl = new FormControl(null);
  diaChiCuTheControl: FormControl = new FormControl(null);
  khachHangReviewControl: FormControl = new FormControl(null);

  maSoThueControl: FormControl = new FormControl(null);
  websiteControl: FormControl = new FormControl(null);
  nganhNgheKinhDoanhControl: FormControl = new FormControl(null);

  contactForm: FormGroup;
  contactIdControl: FormControl = new FormControl(null);
  contactNameControl: FormControl = new FormControl("", [Validators.required]);
  contactGenderControl: FormControl = new FormControl({ code: 'NAM', name: 'Nam' }, [Validators.required]);
  contactEmailControl: FormControl = new FormControl("", [Validators.required, Validators.pattern('[a-z0-9]+@[a-z]+\.[a-z]{2,3}')]);
  contactPhoneControl: FormControl = new FormControl("", [Validators.required]);

  tongDonDatDichVu: number = 0;
  tongDoanhThu: number = 0;
  tongDoanhThuNcc: number = 0;
  tongDoanhThuChoThanhToan: number = 0;


  AvatarUrl = '/assets/images/no-avatar.png';
  refreshNote: number = 0;

  phanHang: string = "";

  constructor(
    private injector: Injector,
    private translate: TranslateService,
    private customerService: CustomerService,
    public builder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    public noteService: NoteService,
    public contactService: ContactService,
    public customerOrderService: CustomerOrderService,
  ) {
    super(injector)
    translate.setDefaultLang('vi');
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  async ngOnInit() {
    this.initForm();
    this.setValidation();
    // debugger
    this.route.params.subscribe(params => {
      this.customerId = params['customerId'];
    });

    //Check permission
    let resource = "";
    //Nếu là chi tiết
    if (this.customerId) {
      resource = "crm/customer/detail";
    }
    //Nếu là tạo mới
    else {
      resource = "crm/customer/create";
    }

    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.showToast('warn', 'Thông báo', 'Bạn không có quyền truy cập vào đường dẫn này vui lòng quay lại trang chủ');
      setTimeout(() => { this.router.navigate(['/home']); }, 1000);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1 && resource == "crm/customer/create") {
        this.actionAdd = false;
      } else if (listCurrentActionResource.indexOf("view") == -1 && resource == "crm/customer/detail") {
        setTimeout(() => { this.router.navigate(['/home']); }, 1000);
      } else {
        //Nếu là chi tiết
        if (this.customerId) {
          this.getCustomerById();
        }
        //Nếu là tạo mới
        else {
          this.getMasterData();
        }
      }
    }
  }

  initForm() {
    this.customerInforForm = new FormGroup({
      customerTypeControl: this.customerTypeControl,
      customerReviewControl: this.customerReviewControl,
      customerCodeControl: this.customerCodeControl,
      genderControl: this.genderControl,
      emailControl: this.emailControl,
      dateOfBirthControl: this.dateOfBirthControl,
      phoneControl: this.phoneControl,
      firstNameControl: this.firstNameControl,
      lastNameControl: this.lastNameControl,
      customerGroupControl: this.customerGroupControl,
      nhanVienPhuTrachControl: this.nhanVienPhuTrachControl,
      tinhThanhPhoControl: this.tinhThanhPhoControl,
      diaChiCuTheControl: this.diaChiCuTheControl,

      maSoThueControl: this.maSoThueControl,
      websiteControl: this.websiteControl,
      nganhNgheKinhDoanhControl: this.nganhNgheKinhDoanhControl,
    });

    this.contactForm = new FormGroup({
      contactIdControl: this.contactIdControl,
      contactNameControl: this.contactNameControl,
      contactGenderControl: this.contactGenderControl,
      contactEmailControl: this.contactEmailControl,
      contactPhoneControl: this.contactPhoneControl,
    });

  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.customerService.createCustomerMasterDataAsync(this.employeeId);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listCustomerGroup = result.listCustomerGroup;
      this.listProvince = result.listProvinceModel;
      this.listStaffCharge = result.listStaffCharge;
    } else {
      this.showToast('error', 'Thông báo', 'Lấy dữ liệu thất bại')
    }
  }

  viewOrder(id: string) {
    this.router.navigate(['order/create', { OrderId: id }]);
  }

  getCustomerById() {
    this.loading = true;
    this.customerService.getCustomerById(this.customerId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listCustomerGroup = result.listCategoryByCareAndGroup;
        this.listProvince = result.listProvince;
        this.listStaffCharge = result.listEmployeeEntityModel;
        this.customerTypeControl.setValue(result.customer.customerType);

        this.phanHang = result.customer.phanHang;
        //  console.log("Giá trị của phanHang:", this.phanHang); // In giá trị phanHang ra console
        this.tongDonDatDichVu = result.customer.tongDonDatDichVu;
        this.tongDoanhThu = result.customer.tongDoanhThu;
        this.tongDoanhThuNcc = result.customer.tongDoanhThuNcc;
        this.tongDoanhThuChoThanhToan = result.customer.tongDoanhThuChoThanhToan;

        this.AvatarUrl = result.contact.avatarUrl ? result.contact.avatarUrl : '/assets/images/no-avatar.png';
        this.mapToFormGroup(result.customer, result.contact);
        this.listContact = result.listContact;

        this.listRating = result.listDanhGia;

        this.getListCustomerOrder();
      } else {
        this.showToast('error', 'Thông báo', result.messageCode)
      }
    });
  }



  onCancel() {
    this.router.navigate(['/customer/list']);
  }

  setValidation() {
    Object.keys(this.customerInforForm.controls).forEach(key => {
      this.customerInforForm.controls[key].markAsUntouched();
      this.customerInforForm.controls[key].setValidators([]);
      this.customerInforForm.controls[key].updateValueAndValidity();
    });

    //Nếu là khách hàng doanh nghiệp
    if (this.customerTypeControl.value == 1) {
      this.firstNameControl.setValidators([Validators.required]);
      this.firstNameControl.updateValueAndValidity();

      this.maSoThueControl.setValidators([Validators.required]);
      this.maSoThueControl.updateValueAndValidity();

      this.phoneControl.setValidators([Validators.required]);
      this.phoneControl.updateValueAndValidity();

      this.emailControl.setValidators([Validators.required, Validators.pattern('[a-z0-9]+@[a-z]+\.[a-z]{2,3}')]);
      this.emailControl.updateValueAndValidity();

      this.websiteControl.setValidators([Validators.required]);
      this.websiteControl.updateValueAndValidity();

      this.nganhNgheKinhDoanhControl.setValidators([Validators.required]);
      this.nganhNgheKinhDoanhControl.updateValueAndValidity();

      this.diaChiCuTheControl.setValidators([Validators.required]);
      this.diaChiCuTheControl.updateValueAndValidity();


    }
    //Nếu là khách hàng cá nhân
    else {
      this.firstNameControl.setValidators([Validators.required]);
      this.firstNameControl.updateValueAndValidity();

      this.lastNameControl.setValidators([Validators.required]);
      this.lastNameControl.updateValueAndValidity();

      this.phoneControl.setValidators([Validators.required]);
      this.phoneControl.updateValueAndValidity();

      this.emailControl.setValidators([Validators.required, Validators.pattern('[a-z0-9]+@[a-z]+\.[a-z]{2,3}')]);
      this.emailControl.updateValueAndValidity();

      this.tinhThanhPhoControl.setValidators([Validators.required]);
      this.tinhThanhPhoControl.updateValueAndValidity();
    }
  }

  async onSaveCustomer() {
    // Check if the customer information form is valid.
    if (!this.customerInforForm.valid) {
      // Mark all fields as touched and show a warning message.
      this.customerInforForm.markAllAsTouched();
      this.showToast('warn', 'Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    // Get the customer type.
    let cusType = this.customerTypeControl.value;
    // Create new instances of CustomerModel and ContactModel.
    let customer: CustomerModel = new CustomerModel();
    let contact: ContactModel = new ContactModel();

    // Assign values from the form fields to properties of the customer and contact objects.
    customer.CustomerId = this.customerId;
    customer.CustomerName = this.firstNameControl.value + this.lastNameControl.value;
    customer.CustomerGroupId = this.customerGroupControl.value?.categoryId;
    customer.CustomerType = this.customerTypeControl.value;
    customer.SubjectsApplication = this.khachHangReviewControl.value ?? false;

    contact.FirstName = this.firstNameControl.value ?? "";
    contact.LastName = cusType == 1 ? "" : this.lastNameControl.value;
    contact.Address = this.diaChiCuTheControl.value;
    contact.Email = this.emailControl.value;
    contact.Phone = this.phoneControl.value;

    //Nếu là khách hàng doanh nghiệp
    if (cusType == 1) {
      contact.TaxCode = this.maSoThueControl.value;
      contact.WebsiteUrl = this.websiteControl.value;
      contact.Note = this.nganhNgheKinhDoanhControl.value;
    }
    //Nếu là khách hàng cá nhân
    else {
      customer.StaffChargeIds = this.nhanVienPhuTrachControl.value ? this.nhanVienPhuTrachControl.value.map(x => x.employeeId) : [];
      contact.Gender = this.genderControl.value?.code;
      contact.DateOfBirth = this.dateOfBirthControl.value ? this.convertToUTCTime(this.dateOfBirthControl.value) : null;
      contact.ProvinceId = this.tinhThanhPhoControl.value?.provinceId;
    }
    // Call the createCustomerAsAccountAsync() method to create a new customer.
    let result: any = await this.customerService.createCustomerAsAccountAsync(customer, contact, [], this.auth.userId, false, false, null);
    if (result.statusCode != 200) {
      // If the status code is not 200, show a warning message.
      this.showToast('warn', 'Thông báo', result.messageCode);
      return;
    }

    // If the customer is successfully created, show a success message.
    this.showToast('success', 'Thông báo', result.messageCode);
    // If creating a new customer (not editing an existing one), navigate to the new customer detail page.
    if (!this.customerId) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/customer/create', { customerId: result.customerId, contactId: result.contactId }]);
      });

    } else {
      // If editing an existing customer, reload the customer information.
      this.getCustomerById();
    }
  }

  changeCustomerGroup(event): void {
    this.customerGroupId = event.categoryId;
  }

  customerName: string = "";
  mapToFormGroup(customer, contact) {
    this.customerName = customer.customerName;
    this.customerCodeControl.setValue(customer.customerCode);
    this.genderControl.setValue(contact.gender);
    this.emailControl.setValue(contact.email);
    this.dateOfBirthControl.setValue(contact.dateOfBirth ? new Date(contact.dateOfBirth) : null);
    this.phoneControl.setValue(contact.phone);
    this.firstNameControl.setValue(contact.firstName);
    this.lastNameControl.setValue(contact.lastName);

    let cusGroup = this.listCustomerGroup.find(x => x.categoryId == customer.customerGroupId);
    this.customerGroupControl.setValue(cusGroup);

    let personInCharge = this.listStaffChargeModel.find(x => x.employeeId == customer.personInChargeId);
    this.nhanVienPhuTrachControl.setValue(personInCharge);

    let tinhThanhPho = this.listProvince.find(x => x.provinceId == contact.provinceId);
    this.tinhThanhPhoControl.setValue(tinhThanhPho);

    this.diaChiCuTheControl.setValue(contact.address);
    this.khachHangReviewControl.setValue(customer.subjectsApplication);

    this.maSoThueControl.setValue(contact.taxCode);
    this.websiteControl.setValue(contact.websiteUrl);
    this.nganhNgheKinhDoanhControl.setValue(contact.note);
  }

  //Liên quan đến người liên hệ
  addContactCus() {
    if (!this.contactForm.valid) {
      this.contactForm.markAllAsTouched();
      this.showToast('warn', 'Thông báo', 'Vui lòng nhập đầy đủ thông tin người liên hệ!');
      return;
    }

    this.loading = true;
    let contact = new ContactModel();
    contact.ObjectId = this.customerId;
    contact.ObjectType = "CUS_CON"
    contact.FirstName = this.contactNameControl.value;
    contact.Gender = this.contactGenderControl.value.code;
    contact.Email = this.contactEmailControl.value;
    contact.Phone = this.contactPhoneControl.value;

    this.contactService.createContact(contact).subscribe(response => {
      this.loading = false;
      let result: any = response;
      if (result.statusCode != 200) {
        return this.showToast('error', 'Thông báo', result.messageCode);
      }
      this.listContact = result.listContact;
      this.showToast('success', 'Thông báo', result.messageCode);

      this.contactForm.reset();
    });
  }

  deleteCustomerContact(contactId) {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn người liên hệ này?`,
      accept: async () => {
        this.contactService.deleteContactById(contactId, this.customerId, "CUS_CON").subscribe(response => {
          this.loading = false;
          let result: any = response;
          if (result.statusCode != 200) {
            return this.showToast('error', 'Thông báo', result.messageCode);
          }
          this.listContact = result.listContact;
          this.showToast('success', 'Thông báo', result.messageCode);
          this.contactForm.reset();
        });
      }
    });
  }

  getListCustomerOrder() {
    this.loading = true;
    this.customerOrderService.searchOrder(null, null, null, null, null, [this.customerId], false).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode != 200) {
        return this.showToast('error', 'Thông báo', result.messageCode);
      }

      this.listCustomerOrder = result.listOrder;
    });
  }

  //Liên quan đến đơn hàng
  goToDetailCustomerOrder(rowData) {
    this.router.navigate(['order/create', { OrderId: rowData.orderId }]);
  }

}

