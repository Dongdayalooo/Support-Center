import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerCreateComponent } from './components/customer-create/customer-create.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerComponent } from './customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { AuthGuard } from '../shared/guards/auth.guard';

@NgModule({
  imports: [RouterModule.forChild([
    {
      path: '',
      component: CustomerComponent,
      children: [
        {
          path: 'create',
          component: CustomerCreateComponent,
          canActivate: [AuthGuard]
        },
        {
          path: 'list',
          component: CustomerListComponent,
          canActivate: [AuthGuard]
        },
        {
          path: 'dashboard',
          component: CustomerDashboardComponent,
          canActivate: [AuthGuard]
        },
      ]
    }
  ])],
  exports: [RouterModule]
})
export class CustomerRouting { }
