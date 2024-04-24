import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { EmployeeComponent } from "./employee.component";
import { AuthGuard } from "../shared/guards/auth.guard";

import { ListComponent } from "./components/list/list.component";
import { EmployeeCreateComponent } from "./components/employee-profile/employee-create/employee-create.component";
import { CreateEmployeeRequestComponent } from "./components/employee-request/create-employee-request/create-employee-request.component";
import { ListEmployeeRequestComponent } from "./components/employee-request/list-employee-request/list-employee-request.component";
import { DetailEmployeeRequestComponent } from "./components/employee-request/detail-employee-request/detail-employee-request.component";
import { EmployeeDashboardComponent } from "./components/employee-dashboard/employee-dashboard.component";
import { TongQuanNvComponent } from "./components/employee-profile/employee-details/tong-quan-nv/tong-quan-nv.component";
import { OrganizationComponent } from "./components/organization/organization.component";
import { BaoCaoNhanVienComponent } from "../accounting/components/bao-cao-nhan-vien/bao-cao-nhan-vien.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "",
        component: EmployeeComponent,
        children: [
          {
            path: "dashboard",
            component: EmployeeDashboardComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "list",
            component: ListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "create",
            component: EmployeeCreateComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "detail",
            component: TongQuanNvComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "request/list",
            component: ListEmployeeRequestComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "request/create",
            component: CreateEmployeeRequestComponent,
            canActivate: [AuthGuard],
          },
          {
            path: "request/detail",
            component: DetailEmployeeRequestComponent,
            canActivate: [AuthGuard],
          },
          {
            path: 'organization',
            component: OrganizationComponent,
            canActivate: [AuthGuard]
          },
        ]
      }
    ])
  ],
  exports: [RouterModule],
})
export class EmployeeRouting { }
