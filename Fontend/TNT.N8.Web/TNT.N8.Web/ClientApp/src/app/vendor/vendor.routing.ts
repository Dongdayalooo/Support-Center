import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VendorComponent } from './vendor.component';
import { AuthGuard } from '../shared/guards/auth.guard';

import { CreateVendorComponent } from './components/create-vendor/create-vendor.component';
import { ListVendorComponent } from './components/list-vendor/list-vendor.component';
import { DetailVendorComponent } from './components/detail-vendor/detail-vendor.component';
import { VendorDashboardComponent } from './components/dashboard/vendor-dashboard.component';
import { ListVendorPriceComponent } from './components/list-vendor-price/list-vendor-price.component';
import { ListVendorOrderComponent } from './components/list-vendor-order/list-vendor-order.component';
import { DetailVendorOrderComponent } from './components/detail-vendor-order/detail-vendor-order.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: VendorComponent,
        children: [
          {
            path: 'create',
            component: CreateVendorComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'list',
            component: ListVendorComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'detail',
            component: DetailVendorComponent,
            canActivate: [AuthGuard]
          },
      
          {
            path: 'dashboard',
            component: VendorDashboardComponent,
            canActivate: [AuthGuard]
          },

          {
            path: 'price',
            component: ListVendorPriceComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'list-order',
            component: ListVendorOrderComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'detail-order',
            component: DetailVendorOrderComponent,
            canActivate: [AuthGuard]
          },

          
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class VendorRouting {
}
