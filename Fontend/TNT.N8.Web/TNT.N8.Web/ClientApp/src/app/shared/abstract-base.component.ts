import { Injector } from "@angular/core";
import { ConfirmationService, Message, MessageService } from "primeng/api";
import * as firebase from 'firebase/app';
import { NotificationFireBase } from "./models/fire-base.model";
import { AbstractControl, ValidatorFn } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { GetPermission } from "./permission/get-permission";
import { DialogService } from "primeng";

export abstract class AbstractBase {
    router: Router;
    route: ActivatedRoute;

    message: MessageService;
    confirmationService: ConfirmationService;
    getPermission: GetPermission;
    dialogService: DialogService;
    messageService: MessageService;

    loading: boolean = false;
    systemParameterList = JSON.parse(localStorage.getItem('systemParameterList'));
    emptyGuid: string = '00000000-0000-0000-0000-000000000000';
    auth: any = JSON.parse(localStorage.getItem("auth"));
    defaultNumberType = this.systemParameterList.find(systemParameter => systemParameter.systemKey == "DefaultNumberType").systemValueString;
    employeeId: string = JSON.parse(localStorage.getItem('auth')).EmployeeId;
    
    localeVi = {
        firstDayOfWeek: 0,
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        monthNames: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
        monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        today: 'Hôm nay',
        clear: 'Xóa',
        dateFormat: 'mm/dd/yy',
        weekHeader: 'Wk'
    };

 

    constructor(injector: Injector) {
        this.router = injector.get(Router);
        this.message = injector.get(MessageService);
        this.confirmationService = injector.get(ConfirmationService);
        this.getPermission = injector.get(GetPermission);
        this.dialogService = injector.get(DialogService);
        this.route = injector.get(ActivatedRoute);
    }

    showToast(severity: string, summary: string, detail: string): void {
        this.message.add({ severity: severity, summary: summary, detail: detail });
    }

    showMessage(msg: Message): void {
        this.message.add(msg);
    }

    createNotificationFireBase(notification: NotificationFireBase, employeeId: string): void {
        const noti = firebase.database().ref('notification/').child(employeeId).push();
        noti.set(notification);
    }

    convertToUTCTime(time: Date): Date {
        return new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds()));
    };

    checkBlankString(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } => {
            if (control.value !== null && control.value !== undefined) {
                if (control.value.trim() === "") {
                    return { 'blankString': true };
                }
            }
            return null;
        }
    }

    clearToast() {
        this.messageService.clear();
    }

}