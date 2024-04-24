import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, MessageService, TreeNode } from 'primeng';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { OptionCategory } from '../../model/option-category';
import { OptionsEntityModel } from '../../model/options';
import { ProductOptionService } from '../../service/product-option.service';
import { DialogCommonComponent } from '../dialog-common/dialog-common.component';
import { GetPermission } from '../../../../../../../src/app/shared/permission/get-permission';
import { DistrictModel, ProvinceModel, WardModel } from '../../../../../../../src/app/shared/models/commonModel';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})

export class InfoComponent implements OnInit {
  loading: boolean = false;
  /**Viewchild*/
  isDialog: boolean = false
  @ViewChild('child') childrent: DialogCommonComponent;


  id: string = null;
  listOptionCategory: OptionCategory[] = [];
  listOptionCategoryUnit: OptionCategory[] = [];

  listDistrictRoot: Array<DistrictModel> = [];
  listWardRoot: Array<WardModel> = [];
  listProvince: Array<ProvinceModel> = [];
  listDistrict: Array<DistrictModel> = [];
  listWard: Array<WardModel> = [];

  optionForm: FormGroup;
  typeControl: FormControl = new FormControl(null, [Validators.required]);
  nameControl: FormControl = new FormControl(null, [Validators.required]);
  unitControl: FormControl = new FormControl(null);
  provinceControl: FormControl = new FormControl(null, [Validators.required]);
  districtControl: FormControl = new FormControl(null);
  wardControl: FormControl = new FormControl(null);
  descriptionControl: FormControl = new FormControl(null);
  thanhToanTruocControl: FormControl = new FormControl(null);

  constructor(
    private _productService: ProductOptionService,
    private messageService: MessageService,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private getPermission: GetPermission,
  ) { }

  async ngOnInit() {
    this.initForm();
    let resource = "sal/product/product-option-detail";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }

    this._activatedRoute.params.subscribe(params => {
      this.id = params['optionId'];
      this.initData();
    });
  }

  initData(): void {
    forkJoin([this._productService.getOptionCategory(), this._productService.getOptionCategoryUnit()])
      .subscribe(result => {
        this.listOptionCategory = result[0].optionCategory;
        this.listOptionCategoryUnit = result[1].optionCategory;

        this.listProvince = result[1].listProvince;
        this.listDistrictRoot = result[1].listDistrict;
        this.listWardRoot = result[1].listWard;


        if (this.id != null) this.getOptionById(this.id);
      });
  }

  showToast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity: severity, summary: summary, detail: detail });
  }

  initForm() {
    this.optionForm = new FormGroup({
      typeControl: this.typeControl,
      nameControl: this.nameControl,
      unitControl: this.unitControl,
      provinceControl: this.provinceControl,
      districtControl: this.districtControl,
      wardControl: this.wardControl,
      descriptionControl: this.descriptionControl,
      thanhToanTruocControl: this.thanhToanTruocControl,
    });
  }

  getOptionById(id: string): void {
    this.loading = true;
    this._productService.getOptionById(id)
      .pipe(
        tap(() => {
          this.loading = false;
        })
      ).subscribe(res => {
        this.typeControl.setValue(this.listOptionCategory.find(x => x.categoryId == res.optionsEntityModel.categoryId));
        this.nameControl.setValue(res.optionsEntityModel.name);
        this.unitControl.setValue(this.listOptionCategoryUnit.find(x => x.categoryId == res.optionsEntityModel.categoryUnitId));
        this.provinceControl.setValue(this.listProvince.find(x => x.provinceId == res.optionsEntityModel.provinceId));
        this.changeProvince();

        this.districtControl.setValue(this.listDistrictRoot.find(x => x.districtId == res.optionsEntityModel.districtId));
        this.changeDistrict();

        this.wardControl.setValue(this.listWardRoot.find(x => x.wardId == res.optionsEntityModel.wardId));
        this.thanhToanTruocControl.setValue(res.optionsEntityModel.thanhToanTruoc);
        this.descriptionControl.setValue(res.optionsEntityModel.description);
      })
  }

  getOptionCategory(): void {
    this.loading = true;
    this._productService.getOptionCategory()
      .pipe(
        tap(() => {
          this.loading = false;
        })
      ).subscribe(res => {
        this.listOptionCategory = res.optionCategory;
      })
  }

  save() {
    if (!this.optionForm.valid) {
      this.optionForm.markAllAsTouched();
      this.showToast('warn', 'Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    var optionData = new OptionsEntityModel();
    optionData.id = this.id;
    optionData.categoryId = this.typeControl.value?.categoryId;
    optionData.name = this.nameControl.value;
    optionData.categoryUnitId = this.unitControl.value?.categoryId;
    optionData.provinceId = this.provinceControl.value?.provinceId;
    optionData.districtId = this.districtControl.value?.districtId;
    optionData.wardId = this.wardControl.value?.wardId;
    optionData.thanhToanTruoc = this.thanhToanTruocControl.value;
    optionData.description = this.descriptionControl.value;

    this.loading = true;
    this._productService.createOrUpdateOptions(optionData).pipe(tap(() => { this.loading = false; }))
      .subscribe(result => {
        if (result.statusCode == 200) {
          if (this.id) {
            this.showToast('success', 'Thông báo', 'Sửa thành công');
          } else {
            this.showToast('success', 'Thông báo', 'Thêm thành công');
            this.router.navigate(['/product/product-option-list']);
          }
        } else {
          if (this.id) {
            this.showToast('error', 'Thông báo', 'Sửa thất bại');
          } else {
            this.showToast('error', 'Thông báo', 'Thêm thất bại');
          }
        }
      })
  }

  changeProvince() {
    this.listDistrict = this.listDistrictRoot.filter(x => x.provinceId == this.provinceControl.value?.provinceId);
    this.listWard = [];
  }

  changeDistrict() {
    this.listWard = this.listWardRoot.filter(x => x.districtId == this.districtControl.value?.districtId);
  }
}
