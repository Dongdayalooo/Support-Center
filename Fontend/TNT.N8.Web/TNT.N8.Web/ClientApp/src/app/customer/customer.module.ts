import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { QueryBuilderModule } from 'angular2-query-builder';

import { CommonService } from '../shared/services/common.service';
import { CategoryService } from '../shared/services/category.service';
import { PermissionService } from '../shared/services/permission.service';
import { CustomerService } from './services/customer.service';
import { WardService } from '../shared/services/ward.service';
import { ProvinceService } from '../shared/services/province.service';
import { DistrictService } from '../shared/services/district.service';
import { ContactService } from '../shared/services/contact.service';
import { NoteService } from '../shared/services/note.service';
import { EmployeeService } from "../employee/services/employee.service";
import { BankService } from '../shared/services/bank.service';
import { EmailConfigService } from '../admin/services/email-config.service';
import { ProductCategoryService } from '../admin/components/product-category/services/product-category.service';
import { PromotionService } from '../promotion/services/promotion.service';

import { CustomerRouting } from './customer.routing';
import { CustomerComponent } from './customer.component';
import { CustomerCreateComponent } from './components/customer-create/customer-create.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { BankpopupComponent } from "../shared/components/bankpopup/bankpopup.component";
import { ContactpopupComponent } from "../shared/components/contactpopup/contactpopup.component";
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { AccountingService } from '../accounting/services/accounting.service';
import { ProductService } from '../product/services/product.service';
import { VendorService } from "../vendor/services/vendor.service";
import { FormatDataPipe } from './pipes/format-data.pipe';
import { MatIconModule } from '@angular/material/icon';
import { GetPermission } from '../shared/permission/get-permission';

import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ForderConfigurationService } from '../admin/components/folder-configuration/services/folder-configuration.service';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ReSearchService } from '../services/re-search.service';
import { CustomerOrderService } from '../order/services/customer-order.service';

@NgModule({
  imports: [
    CommonModule,
    CustomerRouting,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatIconModule,
    NgxLoadingModule.forRoot({}),
    NgMultiSelectDropDownModule.forRoot(),
    QueryBuilderModule,
  ],
  declarations: [
    CustomerComponent,
    CustomerCreateComponent,
    CustomerListComponent,
    CustomerDashboardComponent,
    FormatDataPipe,
  ],
  providers: [
    AccountingService,
    CommonService,
    CategoryService,
    PermissionService,
    MatSnackBarConfig,
    CustomerService,
    WardService,
    ProvinceService,
    DistrictService,
    ContactService,
    NoteService,
    EmployeeService,
    BankService,
    ProductService,
    VendorService,
    GetPermission,
    MessageService,
    ConfirmationService,
    DialogService,
    EmailConfigService,
    ForderConfigurationService,
    DynamicDialogRef,
    DynamicDialogConfig,
    ProductCategoryService,
    PromotionService,
    ReSearchService,
    CustomerOrderService
  ],
  entryComponents: [
    BankpopupComponent,
    ContactpopupComponent,
  ],
  exports: []
})
export class CustomerModule { }
