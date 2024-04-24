import { Component, OnInit, ElementRef, Injector } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { VendorService } from "../../services/vendor.service";
import { VendorModel } from "../../models/vendor.model";
import { ContactModel } from "../../../shared/models/contact.model";
import { VendorGroupModel } from '../../../../../src/app/product/components/product-options/model/list-vendor';
import { ContactVendorDialogModel, DistrictModel, ProvinceModel, WardModel } from '../../../../../src/app/shared/models/commonModel';
import { AbstractBase } from '../../../../../src/app/shared/abstract-base.component';
import { RegexConst } from '../../../../../src/app/shared/regex-const';

@Component({
  selector: 'app-create-vendor',
  templateUrl: './create-vendor.component.html',
  styleUrls: ['./create-vendor.component.css'],
})

export class CreateVendorComponent extends AbstractBase implements OnInit {
  emailPattern = RegexConst.emailPattern;
  vendorCodePattern = '[a-zA-Z0-9]+$';

  genders = [
    { code: 'NAM', name: 'Ông' },
    { code: 'NU', name: 'Bà' }
  ];

  listPermissionResource: string = localStorage.getItem("ListPermissionResource");
  actionAdd: boolean = true;
  createVendorForm: FormGroup;

  //master data
  listVendorGroup: Array<VendorGroupModel> = [];
  listProvince: Array<ProvinceModel> = [];
  listDistrict: Array<DistrictModel> = [];
  listCurrentDistrict: Array<DistrictModel> = [];
  listWard: Array<WardModel> = [];
  listCurrentWard: Array<WardModel> = [];
  listVendorCode: Array<string> = [];

  //table
  columns: Array<any> = [
    { field: 'FullName', header: 'Họ tên', width: '150px', textAlign: 'left', color: '#f44336' },
    { field: 'GenderName', header: 'Giới tính', width: '150px', textAlign: 'center', color: '#f44336' },
    { field: 'Role', header: 'Chức vụ', width: '50px', textAlign: 'center', color: '#f44336' },
    { field: 'Phone', header: 'Số điện thoại', width: '50px', textAlign: 'left', color: '#f44336' },
    { field: 'Email', header: 'Email', width: '50px', textAlign: 'left', color: '#f44336' }
  ];

  selectedColumns: Array<any> = this.columns;

  listContact: Array<ContactVendorDialogModel> = [];
  rows: number = 10;
  selectedContact: ContactModel;
  isInVietNam: boolean = true;

  constructor(
    injector: Injector,
    private translate: TranslateService,
    private vendorService: VendorService,
    public builder: FormBuilder,
  ) {
    super(injector);
    translate.setDefaultLang('vi');
  }

  async ngOnInit() {
    this.initForm();
    let resource = "buy/vendor/create/";
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

  initForm() {
    this.createVendorForm = new FormGroup({
      'VendorGroup': new FormControl(null, [Validators.required]),
      'VendorName': new FormControl('', [Validators.required, this.checkBlankString()]),
      'Email': new FormControl('', [Validators.pattern(this.emailPattern)]),
      'Phone': new FormControl('', [Validators.required]),
      'Location': new FormControl("1"),
      'Province': new FormControl(null),
      'District': new FormControl(null),
      'Ward': new FormControl(null),
      'Address': new FormControl('')
    });
  }

  resetForm() {
    this.createVendorForm.reset();
    this.createVendorForm.get('VendorGroup').patchValue(null);
    this.createVendorForm.get('VendorName').patchValue('');
    this.createVendorForm.get('Email').patchValue('');
    this.createVendorForm.get('Phone').patchValue('');
    this.createVendorForm.get('Location').patchValue('1');
    this.createVendorForm.get('Province').patchValue(null);
    this.createVendorForm.get('District').patchValue(null);
    this.createVendorForm.get('Ward').patchValue(null);
    this.createVendorForm.get('Address').patchValue('');
  }

  resetTable() {
    this.listContact = [];
  }

  changeProvince(event: any): boolean {
    //reset list district and ward
    this.listCurrentDistrict = [];
    this.listCurrentWard = [];
    this.createVendorForm.get('District').setValue(null);
    this.createVendorForm.get('Ward').setValue(null);
    if (event.value === null) return false;
    let currentProvince: ProvinceModel = event.value;
    this.listCurrentDistrict = this.listDistrict.filter(e => e.provinceId === currentProvince.provinceId);
    return false;
  }

  changeDistrict(event: any): boolean {
    //reset ward
    this.listCurrentWard = [];
    this.createVendorForm.get('Ward').setValue(null);
    if (event.value === null) return false;
    let currentDistrict: DistrictModel = event.value;
    this.listCurrentWard = this.listWard.filter(e => e.districtId === currentDistrict.districtId);
    return false
  }

  changeLocation() {
    let value = this.createVendorForm.get('Location').value;
    switch (value) {
      case "1":
        //trong nuoc
        this.isInVietNam = true;
        break;
      case "2":
        //nuoc ngoai: clear province, district, ward
        this.createVendorForm.get('Province').reset();
        this.createVendorForm.get('District').reset();
        this.createVendorForm.get('Ward').reset();
        this.createVendorForm.get('Province').patchValue(null);
        this.createVendorForm.get('District').patchValue(null);
        this.createVendorForm.get('Ward').patchValue(null);
        this.isInVietNam = false;
        break;
      default:
        break;
    }
  }

  deleteContact(rowData: ContactVendorDialogModel) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: () => {
        this.listContact = this.listContact.filter(e => e != rowData);
      }
    });
  }

  goBackToList() {
    if (this.createVendorForm.pristine && this.listContact.length == 0) {
      this.router.navigate(['/vendor/list']);
    } else {
      //confirm dialog
      this.confirmationService.confirm({
        message: 'Các thay đổi sẽ không được lưu lại.Hành động này không thể được hoàn tác, bạn có chắc chắn muốn hủy?',
        accept: () => {
          this.router.navigate(['/vendor/list']);
        }
      });
    }
  }

  async getMasterData() {
    this.loading = true;
    let result: any = await this.vendorService.getDataCreateVendor(this.auth.UserId);
    this.loading = false;
    if (result.statusCode === 200) {
      this.listProvince = result.listProvince;
      this.listDistrict = result.listDistrict;
      this.listWard = result.listWard;
      this.listVendorGroup = result.listVendorGroup;
      this.listVendorCode = result.listVendorCode;
      this.createVendorForm.updateValueAndValidity();
    } else {
      this.showToast('error', 'Thông báo', result.messageCode);
    }
  }

  async createVendor(type: boolean) {
    if (!this.createVendorForm.valid) {
      Object.keys(this.createVendorForm.controls).forEach(key => {
        if (!this.createVendorForm.controls[key].valid) {
          this.createVendorForm.controls[key].markAsTouched();
        }
      });
      this.showToast('error', 'Thông báo', "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    let vendorModel: VendorModel = this.mapFormToVendorModel();
    let contactModel: ContactModel = this.mapFormToVendorContact();
    let listVendorContactList: Array<ContactModel> = this.mapListContact();
    this.loading = true;
    this.vendorService.createVendor(vendorModel, contactModel, listVendorContactList, this.auth.UserId).subscribe(response => {
      this.loading = false;
      let result = <any>response;
      if (result.statusCode === 202 || result.statusCode === 200) {
        switch (type) {
          case true:
            //lưu và tạo mới
            this.resetForm();
            this.resetTable();
            this.showToast('success', 'Thông báo', 'Tạo nhà cung cấp thành công');
            break;
          case false:
            //lưu
            this.router.navigate(['/vendor/detail', { vendorId: result.vendorId, contactId: result.contactId }]);
            break;
          default:
            break;
        }
      } else {
        this.showToast('error', 'Thông báo', result.messageCode);
      }
    }, error => { this.loading = false; });

  }

  mapFormToVendorModel(): VendorModel {
    let vendorModel = new VendorModel();
    vendorModel.vendorId = this.emptyGuid;
    vendorModel.vendorName = this.createVendorForm.get('VendorName').value;
    let vendorGroup = this.createVendorForm.get('VendorGroup').value
    vendorModel.vendorGroupId = vendorGroup !== null ? vendorGroup.categoryId : this.emptyGuid;
    vendorModel.paymentId = this.emptyGuid;
    vendorModel.totalPurchaseValue = 0;
    vendorModel.totalPayableValue = 0;

    vendorModel.active = true;
    vendorModel.createdById = this.auth.UserId;
    vendorModel.createdDate = new Date();
    vendorModel.updatedById = null;
    vendorModel.updatedDate = null;

    return vendorModel;
  }

  mapFormToVendorContact(): ContactModel {
    let contactModel = new ContactModel();
    contactModel.ContactId = this.emptyGuid;
    contactModel.ObjectId = this.emptyGuid;
    contactModel.ObjectType = "VEN";
    contactModel.Email = this.createVendorForm.get('Email').value;
    contactModel.Phone = this.createVendorForm.get('Phone').value;
    let _province = this.createVendorForm.get('Province').value;
    let _district = this.createVendorForm.get('District').value;
    let _ward = this.createVendorForm.get('Ward').value;
    contactModel.ProvinceId = _province !== null ? _province.provinceId : null;
    contactModel.DistrictId = _district !== null ? _district.districtId : null;
    contactModel.WardId = _ward !== null ? _ward.wardId : null;
    contactModel.Address = this.createVendorForm.get('Address').value;

    contactModel.Active = true;
    contactModel.CreatedById = this.auth.UserId;
    contactModel.CreatedDate = new Date();
    contactModel.UpdatedById = null;
    contactModel.UpdatedDate = null;
    return contactModel;
  };

  mapListContact(): Array<ContactModel> {
    let listContact: Array<ContactModel> = [];
    this.listContact.forEach(_contact => {
      let newContact: ContactModel = new ContactModel();
      newContact.ContactId = this.emptyGuid;
      newContact.ObjectId = this.emptyGuid;
      newContact.ObjectType = "VEN_CON";
      newContact.FirstName = _contact.FullName;
      newContact.LastName = "";
      newContact.Gender = _contact.GenderDisplay;
      newContact.Phone = _contact.Phone;
      newContact.Email = _contact.Email;
      newContact.Role = _contact.Role;
      newContact.Active = true;
      newContact.CreatedDate = new Date();
      newContact.CreatedById = this.auth.UserId;
      listContact.push(newContact);
    });
    return listContact;
  }

}