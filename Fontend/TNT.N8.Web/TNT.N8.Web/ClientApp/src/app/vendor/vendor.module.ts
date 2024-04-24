import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { VendorComponent } from './vendor.component';
import { CreateVendorComponent } from './components/create-vendor/create-vendor.component';
import { CommonService } from '../shared/services/common.service';
import { VendorService } from './services/vendor.service';
import { CategoryService } from '../shared/services/category.service';
import { WardService } from '../shared/services/ward.service';
import { ProvinceService } from '../shared/services/province.service';
import { DistrictService } from '../shared/services/district.service';
import { BankService } from '../shared/services/bank.service';
import { CustomerOrderService } from '../order/services/customer-order.service';
import { ContactService } from '../shared/services/contact.service';
import { VendorRouting } from './vendor.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ListVendorComponent } from './components/list-vendor/list-vendor.component';
import { DetailVendorComponent } from './components/detail-vendor/detail-vendor.component';
import { EmployeeService } from "../employee/services/employee.service";
import { BankpopupComponent } from "../shared/components/bankpopup/bankpopup.component";
import { ContactpopupComponent } from "../shared/components/contactpopup/contactpopup.component";
import { ProductService } from '../product/services/product.service';
import { OrderstatusService } from "../shared/services/orderstatus.service";
import { GetPermission } from '../shared/permission/get-permission';
import {RatingModule} from 'primeng/rating';


import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ProductModule } from '../product/product.module';
import { ButtonModule } from 'primeng/button';

import { NoteService } from '../shared/services/note.service';
import { ForderConfigurationService } from '../admin/components/folder-configuration/services/folder-configuration.service';
import { QuickCreateVendorComponent } from '../shared/components/quick-create-vendor/quick-create-vendor.component';
import { VendorDashboardComponent } from './components/dashboard/vendor-dashboard.component';
import { ListVendorPriceComponent } from './components/list-vendor-price/list-vendor-price.component';
import { AddVendorToOptionDialogComponent } from '../product/components/product-options/addVendorToOption-dialog/addVendorToOption-dialog.component';
import { DetailVendorOrderComponent } from './components/detail-vendor-order/detail-vendor-order.component';
import { ListVendorOrderComponent } from './components/list-vendor-order/list-vendor-order.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    VendorRouting,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    ProductModule,
    ButtonModule,
    RatingModule
  ],
  declarations: [
    VendorComponent,
    CreateVendorComponent,
    ListVendorComponent,
    DetailVendorComponent,
    ListVendorPriceComponent,
    VendorDashboardComponent,
    DetailVendorOrderComponent,
    ListVendorOrderComponent
  ],
  providers: [
    CommonService,
    VendorService,
    CategoryService,
    WardService,
    ProvinceService,
    DistrictService,
    GetPermission,
    MatSnackBarConfig,
    ContactService,
    EmployeeService,
    BankService,
    ProductService,
    OrderstatusService,
    CustomerOrderService,
    MessageService,
    ConfirmationService,
    DialogService,
    DecimalPipe,
    DatePipe,
    NoteService,
    ForderConfigurationService,
    AddVendorToOptionDialogComponent
  ],
  entryComponents: [
    BankpopupComponent,
    ContactpopupComponent,
    QuickCreateVendorComponent,
  ]
})
export class VendorModule { }
