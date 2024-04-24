import { Component, OnInit, ViewChild, Injector } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { VendorService } from "../../services/vendor.service";
import { CategoryService } from "../../../shared/services/category.service";

import { DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { AbstractBase } from '../../../shared/abstract-base.component';
import { vendorModel } from '../../../../../src/app/product/models/product.model';
import { AddVendorToOptionDialogComponent } from '../../../../../src/app/product/components/product-options/addVendorToOption-dialog/addVendorToOption-dialog.component';


@Component({
  selector: 'app-list-vendor-price',
  templateUrl: './list-vendor-price.component.html',
  styleUrls: ['./list-vendor-price.component.css'],
  providers: [ConfirmationService, MessageService, DialogService]
})

export class ListVendorPriceComponent extends AbstractBase implements OnInit {
  //master data
  listVendor: Array<vendorModel> = [];
  listOption = [];
  //form
  searchVendorForm: FormGroup;
  //responsive
  innerWidth: number = 0; //number window size first
  isShowFilterTop: boolean = false;
  isShowFilterLeft: boolean = false;
  leftColNumber: number = 12;
  rightColNumber: number = 2;
  @ViewChild('myTable') myTable: Table;
  filterGlobal: string = '';
  first: number = 0;
  colsListProduct: any;
  selectedColumns: any[];
  rows: number = 10;

  actionAdd: boolean = true;
  actionDelete: boolean = true;

  listDieuKienHoaHong = [];
  listDonViTien = [];
  listKieuThanhToan = [];


  constructor(
    injector: Injector,
    private translate: TranslateService,
    private vendorService: VendorService,
    private categoryService: CategoryService
  ) {
    super(injector);
    translate.setDefaultLang('vi');
    this.innerWidth = window.innerWidth;
  }

  async ngOnInit() {
    debugger
    let resource = "buy/vendor/list/";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
      if (listCurrentActionResource.indexOf("delete") == -1) {
        this.actionDelete = false;
      }
      this.initForm();
      this.initTable();
      this.getMasterData();
    }
  }

  initForm() {
    this.searchVendorForm = new FormGroup({
      "ListOption": new FormControl(null),
      "ListVendor": new FormControl(null),
    });
  }

  patchValueForm() {
    this.searchVendorForm.reset();
    this.searchVendorForm.patchValue({
      "VendorName": '',
      "VendorCode": '',
      "VendorGroup": []
    });
  }

  initTable() {
    this.colsListProduct = [
      { field: 'vendorName', header: 'Tên nhà cung cấp', textAlign: "left", width: '200px' },
      // { field: 'optionCode', header: 'Mã DV', textAlign: "left", width: '200px' },
      { field: 'optionName', header: 'Tên DV', textAlign: "left", width: '200px' },
      { field: 'soLuongToiThieu', header: 'Số lượng tối thiểu', textAlign: "right", width: '120px' },
      { field: 'donViTien', header: 'Đơn vị tiền', textAlign: "right", width: '120px' },
      { field: 'price', header: 'Đơn giá', textAlign: "right", width: '150px' },
      { field: 'thueGtgt', header: 'Thuế GTGT (%)', textAlign: "right", width: '150px' },
      { field: 'giaTriChietKhau', header: 'Chiết khấu', textAlign: "right", width: '150px' },
      { field: 'prepaymentValue', header: 'Thanh toán trước ', textAlign: "right", width: '150px' },
      { field: 'mucHoaHong', header: 'Mức hoa hồng', textAlign: "center", width: '190px' },
      { field: 'efftiveDate', header: 'Thời gian hiệu lực', textAlign: "center", width: '190px' },
    ];

    this.selectedColumns = this.colsListProduct;
  }

  refreshFilter() {
    this.searchVendorForm.reset();
    this.patchValueForm();
    this.resetTable();
    this.getMasterData();
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

  resetTable() {
    this.listVendor = [];
    this.filterGlobal = '';
    this.first = 0;
    // this.myTable.reset();
  }

  listVendorMappingOption = [];

  isFirstLoad: boolean = true;
  async getMasterData() {
    let listDvId = this.searchVendorForm.get('ListOption').value ? this.searchVendorForm.get('ListOption').value.map(x => x.id) : [];
    let listVendorId = this.searchVendorForm.get('ListVendor').value ? this.searchVendorForm.get('ListVendor').value.map(x => x.id) : [];

    this.loading = true;
    let result: any = await this.vendorService.getListVendorOption(this.isFirstLoad, listDvId, listVendorId, null, null);
    this.loading = false;
    debugger
    if (result.statusCode !== 200) {
      this.clearToast();
      return this.showToast('error', 'Thông báo', result.messageCode);
    }

    this.listVendorMappingOption = result.listOptionVendor;

    if (this.isFirstLoad) {
      this.listOption = result.listOption;
      this.listVendor = result.listVendor;
      this.listDieuKienHoaHong = result.listDieuKienHoaHong;
      this.listDonViTien = result.listDonViTien;
      this.listKieuThanhToan = result.listKieuThanhToan;



    }
    this.isFirstLoad = false;
  }

  viewDetail(data) {
    let ref = this.dialogService.open(AddVendorToOptionDialogComponent, {
      header: 'Thông tin giá nhà cung cấp',
      width: '750px',
      contentStyle: {
        "z-index": "1000!important",
        "min-height": "190px",
        "max-height": "600px",
        "overflow": "hidden"
      },
      data: {
        listKieuThanhToan: this.listKieuThanhToan,
        vendorList: this.listVendor,
        data: data,
        isEdit: data ? true : false,
        optionId: data?.optionId,
        thanhToanTruoc: data?.thanhToanTruoc,
        listDonViTien: this.listDonViTien,
        listCauHinhHoaHong: data.listCauHinhHoaHong,
        listDieuKienHoaHong: this.listDieuKienHoaHong,
        isView: true,
      }
    });

    ref.onClose.subscribe(result => { });
  }

  goToDetail(rowData) {
    this.router.navigate(['/product/product-option-detail', { optionId: rowData.optionId }]);
  }

}
