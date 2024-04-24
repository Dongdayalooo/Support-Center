import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { UserprofileComponent } from './userprofile/userprofile.component'

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'userprofile', component: UserprofileComponent, canActivate: [AuthGuard] },
      { path: 'forgot-pass', loadChildren: () => import('./forgot-pass/forgot-pass.module').then(m => m.ForgotPassModule) },
      { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
      { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard] },
      { path: 'employee', loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule), canActivate: [AuthGuard] },
      { path: 'vendor', loadChildren: () => import('./vendor/vendor.module').then(m => m.VendorModule), canActivate: [AuthGuard] },
      { path: 'product', loadChildren: () => import('./product/product.module').then(m => m.ProductModule), canActivate: [AuthGuard] },
      { path: 'order', loadChildren: () => import('./order/order.module').then(m => m.OrderModule), canActivate: [AuthGuard] },
      { path: 'customer', loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule), canActivate: [AuthGuard] },
      { path: 'accounting', loadChildren: () => import('./accounting/accounting.module').then(m => m.AccountingModule), canActivate: [AuthGuard] },
      { path: 'chat', loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule), canActivate: [AuthGuard] },
      // { path: 'bill-sale', loadChildren: () => import('./bill-sale/bill-sale.module').then(m => m.BillSaleModule), canActivate: [AuthGuard] },
      // { path: 'promotion', loadChildren: () => import('./promotion/promotion.module').then(m => m.PromotionModule), canActivate: [AuthGuard] },
    ])],
  exports: [
    RouterModule
  ],
  providers: [AuthGuard]
})
export class AppRouting {
}
