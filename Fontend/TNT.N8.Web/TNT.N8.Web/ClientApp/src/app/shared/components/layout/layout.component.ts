import { Component, OnInit, Input, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { CompanyService } from '../../services/company.service';
import { ChangepasswordComponent } from '../changepassword/changepassword.component';
import { UserprofileComponent } from "../../../userprofile/userprofile.component"
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification.service';
import { AuthenticationService } from '../../services/authentication.service';

import { BreadCrumMenuModel } from '../../models/breadCrumMenu.model';
import { CompanyConfigModel } from '../../models/companyConfig.model';
import { MenuItem } from 'primeng/api';

import * as $ from 'jquery';
import { GetPermission } from '../../permission/get-permission';
import { MenuComponent } from '../menu/menu.component';
import firebase from 'firebase';
import { FireBaseService } from '../../services/fire-base.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  @ViewChild(MenuComponent, { static: true }) menuComponent;

  @ViewChild('toggleNotifi') toggleNotifi: ElementRef;
  isOpenNotifi: boolean = false;

  @ViewChild('toggleConfig') toggleConfig: ElementRef;
  isOpenConfig: boolean = false;

  @ViewChild('toggleCreateElement') toggleCreateElement: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu: ElementRef;
  isOpenCreateElement: boolean = false;

  @ViewChild('toggleUser') toggleUser: ElementRef;
  isOpenUser: boolean = false;

  systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
  applicationName = this.getDefaultApplicationName();



  companyConfigModel = new CompanyConfigModel();
  notificationNumber: number = 0;
  NotificationContent: string;
  notificationList: Array<any> = [];
  auth: any = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;

  username: string;
  userAvatar: string;
  userFullName: string;
  userEmail: string;
  dialogRef: MatDialogRef<ChangepasswordComponent>;
  dialogPopup: MatDialogRef<UserprofileComponent>;

  lstSubmenuLevel3: Array<BreadCrumMenuModel> = [
    //Quan ly he thong
    { Name: "Cấu hình Website", Path: "/admin/webSale-config", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings", IsDefault: true, CodeParent: "sys_chttc", LstChildren: [], Display: "none", Code: '' },
    { Name: "Cấu hình mobile", Path: "/admin/mobile-app-config", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings", IsDefault: true, CodeParent: "sys_chttc", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Cấu hình thông tin chung", Path: "/admin/company-config", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings", IsDefault: true, CodeParent: "sys_chttc", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Cấu hình thư mục", Path: "/admin/folder-config", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings", IsDefault: true, CodeParent: "sys_chtm", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Quản lý thông báo", Path: "/admin/notifi-setting-list", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings", IsDefault: true, CodeParent: "sys_tb", LstChildren: [], Display: "none", Code: '' },
    { Name: "Tham số hệ thống", Path: "/admin/system-parameter", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "settings_applications", IsDefault: true, CodeParent: "sys_tsht", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Quản lý mẫu Email", Path: "/admin/email-configuration", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "device_hub", IsDefault: true, CodeParent: "Systems_QLE", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Quản lý sơ đồ tổ chức", Path: "/admin/organization", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "device_hub", IsDefault: true, CodeParent: "sys_sdtc", LstChildren: [], Display: "none", Code: '' },
    { Name: "Quản lý dữ liệu danh mục", Path: "/admin/masterdata", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "category", IsDefault: true, CodeParent: "sys_dldm", LstChildren: [], Display: "none", Code: '' },
    { Name: "Quản lý nhóm quyền", Path: "/admin/permission", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "format_list_bulleted", IsDefault: true, CodeParent: "sys_nq", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Phân hạng khách hàng", Path: "/admin/config-level-customer", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "filter_list", IsDefault: true, CodeParent: "sys_phkh", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Quản lý quy trình làm việc", Path: "/admin/danh-sach-quy-trinh", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "swap_horiz", IsDefault: true, CodeParent: "sys_qtlv", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Nhật ký hệ thống", Path: "/admin/audit-trace", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "menu_book", IsDefault: true, CodeParent: "sys_log", LstChildren: [], Display: "none", Code: '' },
    // { Name: "Kế hoạch kinh doanh", Path: "/admin/business-goals", ObjectType: "sys", LevelMenu: 3, Active: false, nameIcon: "menu_book", IsDefault: true, CodeParent: "sys_khkd", LstChildren: [], Display: "none", Code: '' },
  ];

  // lstSubmenuLevel3Create: Array<BreadCrumMenuModel> = [
  //   //Quan ly he thong
  //   { Name: "Tạo cơ hội", Path: "/lead/create-lead", ObjectType: "crm", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "crm_ch", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo báo giá", Path: "/customer/quote-create", ObjectType: "crm", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "crm_bg", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo khách hàng", Path: "/customer/create", ObjectType: "crm", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "crm_kh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo sản phẩm", Path: "/product/create", ObjectType: "sal", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "sal_spdv", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo hợp đồng bán", Path: "/sales/contract-create", ObjectType: "sal", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "sal_hdb", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo đơn hàng", Path: "/order/create", ObjectType: "sal", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "sal_dh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo hóa đơn", Path: "/bill-sale/create", ObjectType: "sal", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "sal_hd", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo nhà cung cấp", Path: "/vendor/create", ObjectType: "buy", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "buy_ncc", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo đề xuất mua hàng", Path: "/procurement-request/create", ObjectType: "buy", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "buy_dxmh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo phiếu thu", Path: "/accounting/cash-receipts-create", ObjectType: "acc", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "acc_tm", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo phiếu chi", Path: "/accounting/cash-payments-create", ObjectType: "acc", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "acc_tm", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo báo có", Path: "/accounting/bank-receipts-create", ObjectType: "acc", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "acc_nh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo UNC", Path: "/accounting/bank-payments-create", ObjectType: "acc", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "acc_nh", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo nhân viên", Path: "/employee/create", ObjectType: "hrm", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "hrm_nv", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo phiếu nhập kho", Path: "/warehouse/inventory-receiving-voucher/create", ObjectType: "war", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "war_nk", LstChildren: [], Display: "none", Code: '' },
  //   { Name: "Tạo phiếu xuất kho", Path: "/warehouse/inventory-delivery-voucher/create-update", ObjectType: "war", LevelMenu: 3, Active: false, nameIcon: "note_add", IsDefault: false, CodeParent: "war_xk", LstChildren: [], Display: "none", Code: '' },
  // ];

  items: MenuItem[] = [
    {
      label: 'CRM',
      items: [
        // { label: 'Tạo khách hàng tiềm năng', url: '/customer/potential-customer-create' },
        { label: 'Tạo cơ hội', routerLink: '/lead/create-lead' },
        { label: 'Tạo báo giá', routerLink: '/customer/quote-create' },
        { label: 'Tạo Khách hàng', routerLink: '/customer/create' },
      ]
    },
    {
      label: 'Bán hàng',
      items: [
        { label: 'Tạo sản phẩm', routerLink: '/product/createOrEdit' },
        { label: 'Tạo hợp đồng bán', routerLink: '/sales/contract-create' },
        { label: 'Tạo đơn hàng', routerLink: '/order/create' },
        { label: 'Tạo hóa đơn', routerLink: '/bill-sale/create' },
      ]
    },
    {
      label: 'Mua hàng',
      items: [
        { label: 'Tạo nhà cung cấp', routerLink: '/vendor/create' },
        { label: 'Tạo đề xuất mua hàng', routerLink: '/procurement-request/create' },
      ]
    },
    // {
    //   label: 'Tài chính',
    //   items: [
    //     { label: 'Tạo phiếu thu', routerLink: '/accounting/cash-receipts-create' },
    //     { label: 'Tạo phiếu chi', routerLink: '/accounting/cash-payments-create' },
    //     { label: 'Tạo báo có', routerLink: '/accounting/bank-receipts-create' },
    //     { label: 'Tạo UNC', routerLink: '/accounting/bank-payments-create' },
    //   ]
    // },
    {
      label: 'Nhân sự',
      items: [
        { label: 'Nhân viên', routerLink: '/employee/create' },
      ]
    },
    // {
    //   label: 'Kho',
    //   items: [
    //     { label: 'Tạo phiếu nhập kho', routerLink: '/warehouse/inventory-receiving-voucher/create' },
    //     { label: 'Tạo phiếu xuất kho', routerLink: '/warehouse/inventory-delivery-voucher/create-update' }
    //   ]
    // },
    // {
    //   label: 'Dự án',
    //   items: [
    //     { label: 'Tạo mốc dự án', routerLink: '/home' },
    //     { label: 'Tạo hạng mục', routerLink: '/home' },
    //     { label: 'Tạo nguồn lực', routerLink: '/home' },
    //     { label: 'Tạo công việc', routerLink: '/project/create-project-task' },
    //     { label: 'Tạo tài liệu', routerLink: '/home' },
    //   ]
    // }
  ];

  rooms: any[];
  nickname: string = localStorage.getItem('EmployeeName');
  countMessageUnread: number;
  countMessageUnreadSos: number;
  listRoomHaveMessageUnread: any[] = [];
  listRoomHaveMessageUnreadSos: any[] = [];
  userId = this.auth.UserId;
  listPermissionResourceActive: string = localStorage.getItem("ListPermissionResource");
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private companyService: CompanyService,
    public dialog: MatDialog,
    private renderer: Renderer2
  ) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.toggleNotifi) {
        //ẩn hiện khi click Thông báo
        if (this.toggleNotifi.nativeElement.contains(e.target)) {
          this.isOpenNotifi = !this.isOpenNotifi;
        } else {
          this.isOpenNotifi = false;
        }

        //ẩn hiện khi click Tạo mới
        // if (this.toggleCreateElement.nativeElement.contains(e.target)) {
        //   this.isOpenCreateElement = !this.isOpenCreateElement;
        // } else {
        //   this.isOpenCreateElement = false;
        // }

        //ẩn hiện khi click Config
        if (this.toggleConfig.nativeElement.contains(e.target)) {
          this.isOpenConfig = !this.isOpenConfig;
        } else {
          this.isOpenConfig = false;
        }

        //ẩn hiện khi click User
        if (this.toggleUser.nativeElement.contains(e.target)) {
          this.isOpenUser = !this.isOpenUser;
        } else {
          this.isOpenUser = false;
        }
      }
      if (this.dropdownMenu) {
        //ẩn hiện khi click menu item tạo mới
        if (this.dropdownMenu.nativeElement.contains(e.target)) {
          this.isOpenCreateElement = !this.isOpenCreateElement;
        } else {
          this.isOpenCreateElement = false;
        }
      }
    });
  }

  ngOnInit() {
    this.getCompany();
    this.getNotification();
    this.getLastNotification();

    this.username = localStorage.getItem("Username");
    // this.userAvatar = localStorage.getItem("UserAvatar");
    this.userAvatar = '';
    this.userFullName = localStorage.getItem("UserFullName");
    this.userEmail = localStorage.getItem("UserEmail");
    this.getMessageUnread();
    // this.getPemistionMenu2();
  }

  // getPemistionMenu2() {
  //   this.lstSubmenuLevel3Create.forEach(element => {
  //     let resource = element.ObjectType + element.Path;
  //     let permission: any = this.getPermission.getPermission(this.listPermissionResourceActive, resource);
  //     if (permission.status == false) {
  //       element.Active = true;
  //     }
  //     else {
  //       element.Active = false;
  //     }
  //   });
  // }

  getCompany() {
    this.companyService.getCompanyConfig().subscribe(response => {
      const result = <any>response;
      this.companyConfigModel = result.companyConfig;
      this.companyConfigModel = <CompanyConfigModel>({
        companyId: result.companyConfig.companyId,
        companyName: result.companyConfig.companyName,
        email: result.companyConfig.email,
        phone: result.companyConfig.phone,
        taxCode: result.companyConfig.taxCode,
        bankAccountId: result.companyConfig.bankAccountId,
        companyAddress: result.companyConfig.companyAddress,
        contactName: result.companyConfig.contactName,
        contactRole: result.companyConfig.contactRole
      });
    }, error => { });
  }

  getNotification() {
    let size = 5;
    firebase.database().ref('notification/').child(this.auth.EmployeeId).orderByChild("status").equalTo(false).once('value', resp => {
      const listNotification = this.snapshotToArray(resp).sort((a, b): any => { return b.date.localeCompare(a.date) });
      this.notificationNumber = listNotification.length;
      this.notificationList = listNotification.splice(0, size);
    })
  }

  getLastNotification(): void {
    firebase.database().ref('notification/').child(this.auth.EmployeeId).limitToLast(1).on('value', resp => {
      this.getNotification();
    })
  }

  goToNotiUrl(item: any) {
    if (item.url) {
      window.location.href = item.url;
      const notificationRef = firebase.database().ref('notification').child(this.auth.EmployeeId + '/' + item.key);
      notificationRef.update({ status: true });
    }
  }

  goToNotification() {
    //this.notificationNumber = 0;
    this.router.navigate(['/chat/notificaton-list']);
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

  // Mở giao diện đổi Password
  openChangePassword() {
    let account = this.username;
    let _name = this.userFullName;
    let _email = this.userEmail;
    let _avatar = this.userAvatar;
    this.dialogRef = this.dialog.open(ChangepasswordComponent,
      {
        data: { accountName: account, name: _name, email: _email, avatar: _avatar }
      });
    this.dialogRef.afterClosed().subscribe(result => {
    });
    $("#user-content").toggle();

  }
  //Ket thuc

  // Mo giao dien UserProfile
  goToViewProfile() {
    this.router.navigate(['/userprofile']);
  }

  goToUrlSysConfig(Path) {
    this.router.navigate([Path]);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  onUpdateLeftMenu(event: boolean) {
    if (event) {
      this.menuComponent.updateLeftMenu();
    }
  }

  getDefaultApplicationName() {
    return this.systemParameterList.find(systemParameter => systemParameter.systemKey == "ApplicationName").systemValueString;
  }

  snapshotToArray(snapshot: any): any[] {
    const returnArr = [];
    snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
    });
    return returnArr;
  };

  goToListRoom(isSos: boolean): void {
    //1: sos, 2: nhắn tin bt
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/chat/room-list', { type: isSos ? 1 : 2 }]);
    });
  }

  getMessageUnread(): void {
    firebase.database().ref('rooms/').on('value', resp => {
      this.rooms = [];
      this.rooms = this.snapshotToArrayRoomName(resp);
      this.countMessageUnread = 0;
      this.countMessageUnreadSos = 0;

      this.rooms.forEach(r => {
        firebase.database().ref('chats/').child(r.roomname).limitToLast(1).on('value', resp => {
          let listMessageUnread = this.snapshotToArrayMessage(resp, r.roomname);
          if (listMessageUnread.length > 0) {
            if (!this.listRoomHaveMessageUnread.includes(r.roomname) && !r.roomname.includes("_Sos")) {
              this.listRoomHaveMessageUnread.push(r.roomname)
            }

            if (!this.listRoomHaveMessageUnreadSos.includes(r.roomname) && r.roomname.includes("_Sos")) {
              this.listRoomHaveMessageUnreadSos.push(r.roomname)
            }

            this.countMessageUnread = this.listRoomHaveMessageUnread.length;
            this.countMessageUnreadSos = this.listRoomHaveMessageUnreadSos.length;
          }
        });
      });
    });
  }

  snapshotToArrayRoomName(snapshot: any): any[] {
    const returnArr = [];
    snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      if ((item.receiver == this.userId || item.userCreate == this.userId)) {
        returnArr.push(item);
      }
    });
    return returnArr;
  };

  snapshotToArrayMessage(snapshot: any, roomName: string): any[] {
    const returnArr = [];
    snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      if (item.roomname == roomName && item.senderId != this.userId && item.isSeen == false) {
        returnArr.push(item);
      }
    });
    return returnArr;
  };

}
