import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';

import { OrderRouting } from './order.routing';
import { OrderComponent } from './order.component';
import { ListOrderComponent } from '../order/components/list-order/list-order.component';
import { CreateComponent } from './components/create/create.component'
import { EmployeeService } from '../employee/services/employee.service';
import { CustomerService } from '../customer/services/customer.service';
import { VendorService } from "../vendor/services/vendor.service";
import { ProductService } from '../product/services/product.service';
import { CategoryService } from "../shared/services/category.service";
import { CustomerOrderService } from './services/customer-order.service';
import { BankService } from '../shared/services/bank.service';
import { OrderstatusService } from '../shared/services/orderstatus.service';
import { ContactService } from '../shared/services/contact.service';
import { GetPermission } from '../shared/permission/get-permission';
import { SystemParameterService } from '../admin/services/system-parameter.service';
import { CurrencyPipe } from '@angular/common';
import { EmailConfigService } from '../admin/services/email-config.service';
import { NoteService } from '../shared/services/note.service';
import { ImageUploadService } from '../shared/services/imageupload.service';
import { ProductCategoryService } from '../admin/components/product-category/services/product-category.service';


import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { OrderDetailDialogComponent } from './components/order-detail-dialog/order-detail-dialog.component';
// import { AddEditCostQuoteDialogComponent } from '../customer/components/add-edit-cost-quote/add-edit-cost-quote.component';
import { ForderConfigurationService } from '../admin/components/folder-configuration/services/folder-configuration.service';
import { OrderServiceCreateComponent } from './components/order-service-create/order-service-create.component';
import { ReSearchService } from '../services/re-search.service';
import { OrderActionComponent } from './components/orderAction/orderAction.component';
import { CustomerOrderTaskSettingComponent } from './components/customer-order-task-setting/customer-order-task-setting.component';
import { ListOrderActionComponent } from './components/list-order-action/list-order-action.component';
import { SettingReportPointComponent } from './components/setting-report-point/setting-report-point.component';
import { SettingReportPointDetailComponent } from './components/setting-report-point-detail/setting-report-point-detail.component';
import { OrderProcessComponent } from './components/orderProcess/orderProcess.component';
import { OrderProcessListComponent } from './components/orderProcessList/orderProcessList.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    OrderRouting,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
  ],
  declarations: [
    OrderComponent, 
    ListOrderComponent, 
    CreateComponent, 
    OrderDetailDialogComponent, 
    OrderServiceCreateComponent,
    OrderActionComponent,
    CustomerOrderTaskSettingComponent,
    ListOrderActionComponent,
    SettingReportPointComponent,
    SettingReportPointDetailComponent,
    OrderProcessComponent,
    OrderProcessListComponent
    // AddEditCostQuoteDialogComponent
  ],
  entryComponents: [
    OrderDetailDialogComponent,
  ],
  providers: [
    OrderComponent, 
    ListOrderComponent,
    CreateComponent, 
    EmployeeService, 
    CustomerService, 
    VendorService, 
    ProductService, 
    CategoryService,
    CustomerOrderService, 
    BankService, 
    OrderstatusService, 
    ContactService, 
    GetPermission, 
    SystemParameterService, 
    CurrencyPipe, 
    EmailConfigService,
    MessageService,
    ConfirmationService,
    DialogService,
    NoteService,
    ImageUploadService,
    ForderConfigurationService,
    ProductCategoryService,
    ReSearchService,
    DatePipe,
    DecimalPipe
  ],
})
export class OrderModule { }
