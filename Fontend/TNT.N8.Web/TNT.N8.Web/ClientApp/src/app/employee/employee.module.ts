import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { EmployeeRouting } from './employee.routing';
import { DatePipe } from '@angular/common';

import { EmployeeComponent } from './employee.component';
import { ListComponent } from './components/list/list.component';
import { CommonService } from '../shared/services/common.service';
import { OrganizationService } from '../shared/services/organization.service';
import { EmployeeService } from './services/employee.service';
import { EmployeeRequestService } from './services/employee-request/employee-request.service';
import { CategoryService } from '../shared/services/category.service';
import { PositionService } from '../shared/services/position.service';
import { PermissionService } from '../shared/services/permission.service';
import { EmployeeTimesheetService } from './services/employee-salary/employee-timesheet.service';
import { EmployeeSalaryHandmadeImportService } from './services/employee-salary/employee-salary-handmade-import.service';
import { TeacherSalaryHandmadeImportService } from './services/teacher-salary/teacher-salary-handmade-import.service';
import { AssistantExportListService } from './services/assistant-salary/assistant-export-list.service';
import { AssistantSalaryHandmadeImportService } from './services/assistant-salary/assistant-salary-handmade-import.service';
import { AssistantSalaryFindService } from './services/assistant-salary/assistant-salary-find.service';
import { EmployeeListService } from './services/employee-list/employee-list.service';
import { EmailConfigService } from '../admin/services/email-config.service';
import { ForderConfigurationService } from '../admin/components/folder-configuration/services/folder-configuration.service';

import { OrgSelectDialogComponent } from './components/org-select-dialog/org-select-dialog.component';
import { CreateEmployeeRequestComponent } from './components/employee-request/create-employee-request/create-employee-request.component';
import { EmployeeCreateComponent } from './components/employee-profile/employee-create/employee-create.component';
import { ListEmployeeRequestComponent } from './components/employee-request/list-employee-request/list-employee-request.component';
import { BankService } from '../shared/services/bank.service';
import { EmployeeSalaryService } from './services/employee-salary/employee-salary.service';
import { EmployeeCreateSalaryPopupComponent } from './components/employee-profile/employee-create-salary-popup/employee-create-salary-popup.component'
import { EmployeeAllowanceService } from './services/employee-allowance/employee-allowance.service';
import { EmployeeInsuranceService } from './services/employee-insurance/employee-insurance.service';
import { EmployeeMonthySalaryService } from './services/employee-salary/employee-monthy-salary.service';
import { EmployeeAssessmentService } from './services/employee-assessment/employee-assessment.service';
import { ImageUploadService } from '../shared/services/imageupload.service';
import { NoteService } from '../shared/services/note.service';
import { PopupComponent } from '../shared/components/popup/popup.component';
import { NgxLoadingModule } from 'ngx-loading';
import { ContactService } from '../shared/services/contact.service';
import { TeacherSalaryService } from './services/teacher-salary/teacher-salary.service';
import { MatChipsModule } from '@angular/material/chips';
import { DetailEmployeeRequestComponent } from './components/employee-request/detail-employee-request/detail-employee-request.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { OrgSelectMultiDialogComponent } from './components/org-select-multi-dialog/org-select-multi-dialog.component';
import { GetPermission } from '../shared/permission/get-permission';
import { EmailService } from '../shared/services/email.service';
import { TongQuanNvComponent } from './components/employee-profile/employee-details/tong-quan-nv/tong-quan-nv.component';
import { ThongTinChungComponent } from './components/employee-profile/employee-details/thong-tin-chung/thong-tin-chung.component';
import { ThongTinNhanSuComponent } from './components/employee-profile/employee-details/thong-tin-nhan-su/thong-tin-nhan-su.component';
import { CauHinhPhanQuyenComponent } from './components/employee-profile/employee-details/cau-hinh-phan-quyen/cau-hinh-phan-quyen.component';
import { LuongVaTroCapComponent } from './components/employee-profile/employee-details/luong-va-tro-cap/luong-va-tro-cap.component';
import { NvGhiChuComponent } from './components/employee-profile/employee-details/nv-ghi-chu/nv-ghi-chu.component';
import { ChonNhieuDvDialogComponent } from './../shared/components/chon-nhieu-dv-dialog/chon-nhieu-dv-dialog.component';

import { ThongTinHopDongComponent } from './components/employee-profile/employee-details/hop-dong/thong-tin-hop-dong/thong-tin-hop-dong.component';
import { ThongTinKhacComponent } from './components/employee-profile/employee-details/thong-tin-khac/thong-tin-khac.component';
import { ThemMoiHopDongComponent } from './components/employee-profile/employee-details/hop-dong/them-moi-hop-dong/them-moi-hop-dong.component';
import { ChiTietHopDongComponent } from './components/employee-profile/employee-details/hop-dong/chi-tiet-hop-dong/chi-tiet-hop-dong.component';
import { TheoDoiChucVuComponent } from './components/employee-profile/employee-details/theo-doi-chuc-vu/theo-doi-chuc-vu.component';
import { ConfirmationService } from 'primeng/api';
import { EmployeeImportDetailComponent } from './components/employee-import-detail/employee-import-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { HopDongImportDetailComponent } from './components/employee-profile/employee-details/hop-dong/hop-dong-import-detail/hop-dong-import-detail.component';
import { OrganizationComponent } from './components/organization/organization.component';


@NgModule({
  imports: [
    SharedModule,
    EmployeeRouting,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    HttpClientModule,
    NgxLoadingModule.forRoot({})
  ],
  declarations: [
    EmployeeComponent,
    ListComponent,
    OrgSelectDialogComponent,
    CreateEmployeeRequestComponent,
    EmployeeCreateComponent,
    ListEmployeeRequestComponent,
    EmployeeCreateSalaryPopupComponent,
    DetailEmployeeRequestComponent,
    EmployeeDashboardComponent,
    OrgSelectMultiDialogComponent,
    TongQuanNvComponent,
    ThongTinChungComponent,
    ThongTinNhanSuComponent,
    CauHinhPhanQuyenComponent,
    LuongVaTroCapComponent,
    NvGhiChuComponent,
    ThongTinHopDongComponent,
    ThongTinKhacComponent,
    ThemMoiHopDongComponent,
    ChiTietHopDongComponent,
    ChiTietHopDongComponent,
    TheoDoiChucVuComponent,
    ChiTietHopDongComponent,
    EmployeeImportDetailComponent,
    HopDongImportDetailComponent,
    OrganizationComponent,
  ],
  providers: [
    ContactService,
    NoteService,
    ImageUploadService,
    EmployeeAssessmentService,
    EmployeeMonthySalaryService,
    EmployeeInsuranceService,
    EmployeeAllowanceService,
    EmployeeSalaryService,
    BankService,
    CommonService,
    EmployeeService,
    EmployeeRequestService,
    GetPermission,
    OrganizationService,
    CategoryService,
    PositionService,
    PermissionService,
    MatSnackBarConfig,
    EmployeeTimesheetService,
    EmployeeSalaryHandmadeImportService,
    TeacherSalaryService,
    TeacherSalaryHandmadeImportService,
    AssistantExportListService,
    AssistantSalaryHandmadeImportService,
    AssistantSalaryFindService,
    EmployeeListService,
    EmailService,
    DatePipe,
    EmailConfigService,
    ForderConfigurationService,
    ConfirmationService,
  ],
  entryComponents: [
    PopupComponent,
    OrgSelectDialogComponent,
    EmployeeCreateSalaryPopupComponent,
    ChonNhieuDvDialogComponent,
    ThemMoiHopDongComponent,
    ChiTietHopDongComponent,
  ],
  exports: [
    OrgSelectDialogComponent
  ],
  bootstrap: []
})
export class EmployeeModule { }
