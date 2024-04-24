import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductComponent } from './product.component';
import { ListProductComponent } from './components/list-product/list-product.component';
import { ProductRouting } from './product.routing';
import { ProductService } from './services/product.service';
import { VendorService } from "../vendor/services/vendor.service";
import { ProductCategoryService } from "../admin/components/product-category/services/product-category.service";
import { CategoryService } from '../shared/services/category.service';
import { QuickCreateVendorComponent } from './components/quick-create-vendor/quick-create-vendor.component';
import { GetPermission } from '../shared/permission/get-permission';
import { VendorDetailDialogComponent } from './components/vendor-detail-dialog/vendor-detail-dialog.component';
import { PriceListComponent } from './components/price-list/price-list.component';
import { CreateOrEditProductComponent } from './components/create-or-edit-product/create-or-edit-product.component';
import { ProductOptionsListComponent } from './components/product-options/product-options-list/product-options-list.component';
import { ProductOptionsDetailComponent } from './components/product-options/product-options-detail/product-options-detail.component';
import { TabViewModule } from 'primeng/tabview';
import { TabMenuModule } from 'primeng/tabmenu';
import { InfoComponent } from './components/product-options/product-options-detail/info/info.component';
import { PropertiesComponent } from './components/product-options/product-options-detail/properties/properties.component';
import { ListVendorComponent } from './components/product-options/product-options-detail/list-vendor/list-vendor.component';
import { ListMissionComponent } from './components/product-options/product-options-detail/list-mission/list-mission.component';
import { CreateOrEditProductPacketComponent } from './components/create-or-edit-product-packet/create-or-edit-product-packet.component';
import { ListProductPacketComponent } from './components/list-product-packet/list-product-packet.component';
import { DialogCommonComponent } from './components/product-options/product-options-detail/dialog-common/dialog-common.component';
import { DialogModule } from 'primeng/dialog';
import { TreeTableModule } from 'primeng';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { AddVendorToOptionDialogComponent } from './components/product-options/addVendorToOption-dialog/addVendorToOption-dialog.component';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ProductRouting,
    FormsModule,
    ReactiveFormsModule,
    TabMenuModule, TabViewModule,
    DialogModule,
    TreeTableModule,
    DragDropModule,
  ],
  declarations: [
    ProductComponent,
    ListProductComponent,
    QuickCreateVendorComponent,
    VendorDetailDialogComponent,
    PriceListComponent,
    CreateOrEditProductComponent,
    ProductOptionsListComponent,
    ProductOptionsDetailComponent,
    InfoComponent,
    PropertiesComponent,
    ListVendorComponent,
    CreateOrEditProductComponent,
    ProductOptionsListComponent,
    ProductOptionsDetailComponent,
    InfoComponent,
    PropertiesComponent,
    ListVendorComponent,
    ListMissionComponent,
    CreateOrEditProductPacketComponent,
    ListProductPacketComponent,
    DialogCommonComponent,
    AddVendorToOptionDialogComponent
  ],
  bootstrap: [
    QuickCreateVendorComponent,
    VendorDetailDialogComponent
  ],
  entryComponents: [
    QuickCreateVendorComponent,
    VendorDetailDialogComponent,
    PriceListComponent,
  ],
  exports: [
    AddVendorToOptionDialogComponent,
  ],
  providers: [
    ProductComponent,
    ListProductComponent,
    ProductService,
    VendorService,
    ProductCategoryService,
    CategoryService,
    GetPermission,
  ]
})
export class ProductModule { }
