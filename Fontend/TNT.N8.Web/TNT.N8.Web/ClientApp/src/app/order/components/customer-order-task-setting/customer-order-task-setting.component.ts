import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { MessageService, TreeNode } from 'primeng/api';

import { CustomerOrderService } from '../../services/customer-order.service';

import { ProductCategoryService } from '../../../admin/components/product-category/services/product-category.service';
import { ServicePacket } from '../../../product/models/productPacket.model';
import { CustomerOrderExtension, EmployeeEntityModel } from '../../../product/models/product.model';
import { VendorListModel, VendorModel } from '../../../../../src/app/product/components/product-options/model/list-vendor';
import { CustomerOrderTaskEntityModel } from '../../models/customer-order.model';

class ResultDialog {
  status: boolean;
  rowData: CustomerOrderTaskEntityModel;
}

class rowDataAddedOption {
  serviceName: string;
  optionName: string;
  optionId: string;
  number: number;
  cost: number;
  //Lưu lại tất cả các thuộc tính của từng option đã điền
  listAtrrOption: CustomerOrderExtension[];
  //Thuộc tính gói dịch vụ
  listAttrPacket: Array<CustomerOrderExtension>;
  //Infor gói dịch vụ
  packetService: ServicePacket;
  //Các tùy chọn dịch vụ đã chọn ở level cuối cùng
  listOptionSave: any;
}

export interface NewTreeNode extends TreeNode {
  listAttr?: any;
  path: string;
  number: string;
  margin: string;
}

@Component({
  selector: 'app-customer-order-task-setting',
  templateUrl: './customer-order-task-setting.component.html',
  styleUrls: ['./customer-order-task-setting.component.css'],
  providers: [DialogService]
})

export class CustomerOrderTaskSettingComponent implements OnInit {
  @ViewChild('priceInitial') priceInitialElement: ElementRef;
  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  emptyGuid: string = '00000000-0000-0000-0000-000000000000';
  loading: boolean = false;
  toDay: Date = new Date();
  currentYear: number = this.toDay.getFullYear();
  cols: any[];

  /*Các biến điều kiện*/
  isCreate: boolean = true; //true: Tạo mới sản phẩm dịch vụ(hoặc chi phí phát sinh), false: Sửa sản phẩm dịch vụ(hoặc chi phí phát sinh)
  selectedOrderDetailType: number = 0;  //0: Sản phẩm dịch vụ, 1: Chi phí phát sinh
  isShowRadioProduct: boolean = true;
  isShowRadioOC: boolean = true;
  /*End*/

  servicePacketId: string = "";

  //List nhà cung cấp
  listVendor: Array<VendorListModel> = [];

  //List nhân viên hỗ trợ
  listSupporter: Array<EmployeeEntityModel> = [];

  //Databinding
  optionName: string = "";
  settingFormGroup: FormGroup;
  nguoiThucHienTypeControl: FormControl;
  vendorControl: FormControl;
  supporterControl: FormControl;
  missionControl: FormControl;
  noteControl: FormControl;
  hanPheDuyetControl: FormControl;


  //List thuộc tính của tùy chọn dv
  listOptionAttr: Array<CustomerOrderExtension> = [];


  rowData: CustomerOrderTaskEntityModel = null;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    private customerOrderService: CustomerOrderService,
    public dialogService: DialogService,
  ) {
    this.isCreate = this.config.data.isCreate;
    this.listOptionAttr = this.config.data.listAttr;
    this.servicePacketId = this.config.data.servicePacketId;
    this.rowData = this.config.data.rowData;

    //Gán tên
    let splitPath = this.rowData.path.split("--->");
    this.optionName = splitPath[splitPath.length - 1];
    if (!this.isCreate) {
      //Nếu là sửa
    }
  }

  ngOnInit() {
    this.setForm();
    this.setTable();
    this.getMasterData();
  }

  setForm() {
    this.vendorControl = new FormControl(null, [Validators.required]);
    this.nguoiThucHienTypeControl = new FormControl(1, [Validators.required]);
    this.supporterControl = new FormControl(null);
    this.missionControl = new FormControl("");
    this.noteControl = new FormControl("");
    this.hanPheDuyetControl = new FormControl(null, [Validators.required]);

    this.settingFormGroup = new FormGroup({
      vendorControl: this.vendorControl,
      nguoiThucHienTypeControl: this.nguoiThucHienTypeControl,
      supporterControl: this.supporterControl,
      missionControl: this.missionControl,
      noteControl: this.noteControl,
      hanPheDuyetControl: this.hanPheDuyetControl
    });

    //Nếu là dịch vụ phát sinh => k cần chọn nhà cung cấp
    if (this.rowData.isExtend) {
      this.vendorControl.setValidators(null);
      this.vendorControl.updateValueAndValidity();
    }
  }

  setTable() {
    this.cols = [
      { field: 'AttrName', header: 'Tên thuộc tính', width: '50%', textAlign: 'left', color: '#f44336' },
      { field: 'AttrValue', header: 'Giá trị', width: '50%', textAlign: 'left', color: '#f44336' },
    ];
  }

  /*Event set giá trị mặc định cho các control*/
  getMasterData() {
    this.customerOrderService.getVendorAndEmployeeOfPacket(this.servicePacketId).subscribe(response => {
      debugger
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listSupporter = result.listEmp;
        this.listVendor = result.listVendor.filter(x => x.listoptionId.indexOf(this.rowData.optionId) != -1);
        this.setDefaultData();
      } else {
        this.loading = false;
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }
  /*End*/

  setDefaultData() {
    if (this.rowData.listEmpId) {
      let supporter = this.listSupporter.filter(x => this.rowData.listEmpId.indexOf(x.employeeId) != -1);
      if (supporter) {
        this.supporterControl.setValue(supporter);
      }
    }

    if (this.rowData.vendorId) {
      let vendor = this.listVendor.find(x => x.vendorId == this.rowData.vendorId);
      if (vendor) this.vendorControl.setValue(vendor);
    }

    console.log("this.rowData.", this.rowData)
    this.noteControl.setValue(this.rowData.note);
    if(this.rowData.hanPheDuyet) this.hanPheDuyetControl.setValue(new Date(this.rowData.hanPheDuyet));
    this.nguoiThucHienTypeControl.setValue(this.rowData.nguoiThucHienType);

    if (this.rowData.isExtend) this.nguoiThucHienTypeControl.setValue(2)
    this.doiNguoiThucHien();
  }

  doiNguoiThucHien() {
    //nếu là nhà cung cấp thực hiện
    if (this.nguoiThucHienTypeControl.value == 1) {
      this.vendorControl.setValidators([Validators.required]);
      this.supporterControl.setValidators([]);
    } else {
      this.supporterControl.setValidators([Validators.required]);
      this.vendorControl.setValidators([]);
    }
    this.supporterControl.updateValueAndValidity();
    this.vendorControl.updateValueAndValidity();
  }

  /*Event Hủy dialog*/
  cancel() {
    let result = new ResultDialog();
    result.status = false;
    //Lưu lại tất cả các thuộc tính của từng option đã điền
    result.rowData = null;
    this.ref.close(result);
  }
  /*End*/

  /*Event Lưu dialog*/
  save() {
    debugger
    if (!this.settingFormGroup.valid) {
      Object.keys(this.settingFormGroup.controls).forEach(key => {
        if (this.settingFormGroup.controls[key].valid == false) {
          this.settingFormGroup.controls[key].markAsTouched();
        }
      });
      let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Vui lòng nhập đầy đủ thông tin các trường dữ liệu.' };
      this.showMessage(msg);
      return;
    }

    let listEmpId = [];
    if (this.nguoiThucHienTypeControl.value == 2) {
      listEmpId = this.supporterControl.value.map(x => x.employeeId);
      if (listEmpId.length == 0) {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Số lượng nhân viên hỗ trợ phải lớn hơn 0!' };
        this.showMessage(msg);
        return;
      }
    }


    //Nếu sửa => check xem đã có điểm báo cáo nào gán với nó chưa. Chưa thì cho đổi, k thì thông báo
    if (this.rowData.orderActionId) {
      this.loading = true;
      this.customerOrderService.checkTaskWithReportPointExtend(this.rowData.id, listEmpId).subscribe(response => {
        let result: any = response;
        this.loading = false;
        if (result.statusCode == 200) {
          this.returnData(listEmpId);
        } else {
          let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(msg);
          return;
        }
      });
    } else {
      this.returnData(listEmpId);
    }
  }

  returnData(listEmpId) {
    this.rowData.listEmpId = listEmpId;
    this.rowData.listEmpName = '';

    //Nếu là nhân viên HĐTL thực hiện
    if (this.nguoiThucHienTypeControl.value == 2) {
      this.supporterControl.value.forEach(key => {
        this.rowData.listEmpName += ", " + key.employeeCodeName;
      });
    }

    //Nếu là dịch vụ phát sinh thì k có vendor
    this.rowData.vendorId = this.rowData.isExtend ? null : this.vendorControl.value?.vendorId;
    this.rowData.vendorName = this.rowData.isExtend ? "" : this.vendorControl.value?.vendorName;
    this.rowData.mission = this.supporterControl.value?.mission ?? "Nhiệm vụ";
    this.rowData.note = this.noteControl.value;
    this.rowData.hanPheDuyet = this.hanPheDuyetControl.value;
    this.rowData.nguoiThucHienType = this.nguoiThucHienTypeControl.value;

    //Nếu trạng thái là gán lại thì chuyển trạng thái lại về chờ duyệt
    if(this.rowData.statusId == 4) {
      this.rowData.statusId = 1;
      this.rowData.status = "Chờ phê duyệt";
    }
    this.ref.close();
  }

  showMessage(msg: any) {
    this.messageService.add(msg);
  }

}
