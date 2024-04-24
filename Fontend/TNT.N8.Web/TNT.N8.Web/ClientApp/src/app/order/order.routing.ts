import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';

import { OrderComponent } from './order.component';
import { ListOrderComponent } from '../order/components/list-order/list-order.component';
import { CreateComponent } from '../order/components/create/create.component';
import { OrderServiceCreateComponent } from './components/order-service-create/order-service-create.component';
import { OrderActionComponent } from './components/orderAction/orderAction.component';
import { ListOrderActionComponent } from './components/list-order-action/list-order-action.component';
import { SettingReportPointComponent } from './components/setting-report-point/setting-report-point.component';
import { OrderProcessComponent } from './components/orderProcess/orderProcess.component';
import { OrderProcessListComponent } from './components/orderProcessList/orderProcessList.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: OrderComponent,
        children: [
          {
            path: 'list',
            component: ListOrderComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'create',
            component: CreateComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'order-service-create',
            component: OrderServiceCreateComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'orderAction',
            component: OrderActionComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'orderActionList',
            component: ListOrderActionComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'orderProcess',
            component: OrderProcessComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'orderProcessList',
            component: OrderProcessListComponent,
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
export class OrderRouting { }
