import { Component, OnInit, ChangeDetectorRef, Renderer2, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CustomerOrder, CustomerOrderTaskEntityModel, ReportPointEntityModel } from '../../models/customer-order.model';
import { CustomerOrderService } from '../../services/customer-order.service';
import { GetPermission } from '../../../shared/permission/get-permission';
import { MessageService, TreeNode } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { CustomerOrderExtension } from '../../models/customer-order-detail.model';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { CustomerOrderTaskSettingComponent } from '../customer-order-task-setting/customer-order-task-setting.component';
import { SettingReportPointComponent } from '../setting-report-point/setting-report-point.component';
import { SettingReportPointDetailComponent } from '../setting-report-point-detail/setting-report-point-detail.component';
import { AbstractBase } from '../../../shared/abstract-base.component';
import { Workbook } from 'exceljs';
import { saveAs } from "file-saver";
import { SrvRecord } from 'dns';

class ResultDialog {
  status: boolean;
  rowData: CustomerOrderTaskEntityModel;
  isChangStatus: boolean;
  nguoiThucHienType: number;
}

@Component({
  selector: 'app-orderAction',
  templateUrl: './orderAction.component.html',
  styleUrls: ['./orderAction.component.css']
})
export class OrderActionComponent extends AbstractBase implements OnInit {
  /*Khai báo biến*/
  auth: any = JSON.parse(localStorage.getItem("auth"));
  loading: boolean = false;
  actionAdd: boolean = true;
  awaitResult: boolean = false;

  toDay: Date = new Date();

  /* Masterdata */
  //List phiếu yêu cầu < customerOrder>
  listCustomerOrder: Array<any> = [];
  listEmployeeEntity: Array<any> = [];
  /* End */

  editing: boolean = false;
  viewNcc: boolean = false;

  listColumns = [];

  listSettingTaskEmp: Array<CustomerOrderTaskEntityModel> = [];

  //List all thuộc tính của gói
  listAtrrOption: Array<CustomerOrderExtension> = [];

  title: string = "Tạo phiếu hỗ trợ dịch vụ";

  //form
  orderActionForm: FormGroup;
  //Thông tin phiếu
  customerOrderInfor: FormControl;
  orderActionCode: FormControl;
  creatorName: FormControl;
  createdDate: FormControl;
  orderActionStatus: FormControl;
  //Thông tin khách hàng
  cusName: FormControl;
  cusAddress: FormControl;
  cusPhone: FormControl;
  cusNote: FormControl;
  cusOrderDate: FormControl;
  //end form

  statusOrderAction: number = 1;
  orderActionId: string = null;
  orderId: string = null;
  customerOrderModel: CustomerOrder = new CustomerOrder();

  listReportPoint: Array<ReportPointEntityModel> = [];

  heightOfReportPoint: string = "0px";
  //Công thức: 210 * (số bản ghi - 1)

  customerOrderAction = null;
  //note
  isManagerOfHR: boolean = false;
  isGD: boolean = false;
  isNguoiPhuTrach: boolean = false;
  viewNote: boolean = true;
  viewTimeline: boolean = true;
  pageSize = 20;
  actionEdit: boolean = true;
  actionDelete: boolean = true;
  isReportPoint: boolean = false; // là điểm báo cáo ?
  isActionStep: boolean = true;
  isConfirmStep: boolean = true;


  listViewNccVendor = [];

  constructor(private translate: TranslateService,
    injector: Injector,
    private customerOrderService: CustomerOrderService,
    public cdRef: ChangeDetectorRef,
    public datepipe: DatePipe,
  ) {
    super(injector)
  }

  async ngOnInit() {
    this.setForm();
    this.setTable();

    let resource = "cusOrder/order/orderAction";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      this.router.navigate(['/home']);
    }
    else {
      let listCurrentActionResource = permission.listCurrentActionResource;
      if (listCurrentActionResource.indexOf("add") == -1) {
        this.actionAdd = false;
      }
    }


    this.route.params.subscribe(params => {
      this.orderActionId = params['OrderActionId'];
      this.orderId = params['OrderId'];
    });

    this.getMasterData();
  }

  setForm() {
    this.customerOrderInfor = new FormControl(null, [Validators.required]);
    this.orderActionCode = new FormControl("Hệ thống tự động tạo");
    this.creatorName = new FormControl(null);
    this.createdDate = new FormControl(new Date());
    this.orderActionStatus = new FormControl("Mới");
    this.cusName = new FormControl(null);
    this.cusAddress = new FormControl(null);
    this.cusPhone = new FormControl(null);
    this.cusNote = new FormControl(null);
    this.cusOrderDate = new FormControl(null);

    this.orderActionForm = new FormGroup({
      customerOrderInfor: this.customerOrderInfor,
      orderActionCode: this.orderActionCode,
      creatorName: this.creatorName,
      createdDate: this.createdDate,
      cusName: this.cusName,
      cusAddress: this.cusAddress,
      cusPhone: this.cusPhone,
      cusNote: this.cusNote,
      cusOrderDate: this.cusOrderDate,
    });
  }

  setTable() {
    this.listColumns = [
      { field: 'path', header: 'Dịch vụ', width: '150px', textAlign: 'left', color: '#f44336' },
      { field: 'vendorName', header: 'Nhà cung cấp', width: '140px', textAlign: 'left', color: '#f44336' },
      { field: 'listEmpName', header: 'Người phụ trách', width: '200px', textAlign: 'left', color: '#f44336' },
      // { field: 'mission', header: 'Nhiệm vụ', width: '140px', textAlign: 'left', color: '#f44336' },
      { field: 'note', header: 'Ghi chú', width: '200px', textAlign: 'left', color: '#f44336' },
      { field: 'hanPheDuyet', header: 'Hạn phê duyệt', width: '120px', textAlign: 'center', color: '#f44336' },
      { field: 'status', header: 'Trạng thái', width: '120px', textAlign: 'center', color: '#f44336' },
      { field: 'action', header: 'Tác vụ', width: '200px', textAlign: 'center', color: '#f44336' },
    ];
  }

  getMasterData() {
    this.loading = true;
    this.customerOrderService.getMasterDataCreateOrderAction().subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listCustomerOrder = result.listCustomerOrder;
        this.creatorName.setValue(result.creatorName);
        this.listEmployeeEntity = result.listEmployeeEntityModel;
        if (this.orderId != null && this.orderActionId == null) {
          let order = this.listCustomerOrder.find(x => x.orderId == this.orderId);
          this.customerOrderInfor.setValue(order);
          this.changeCustomerOrder(order, false);
        }

        if (this.orderActionId != null) this.setDefaultValue();
      } else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  setDefaultValue() {
    this.title = "Chi tiết phiếu hỗ trợ dịch vụ";
    this.loading = true;
    this.customerOrderService.getMasterDataOrderActionDetail(this.orderActionId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      console.log("result", result)
      if (result.statusCode == 200) {
        this.orderActionCode.setValue(result.customerOrderAction.orderCode);
        this.orderActionStatus.setValue(result.customerOrderAction.statusOrderName);
        this.creatorName.setValue(result.empNameCreator);
        this.createdDate.setValue(result.customerOrderAction.createdDate);
        this.statusOrderAction = result.customerOrderAction.statusOrder;
        this.orderId = result.customerOrderAction.objectId;
        this.customerOrderAction = result.customerOrderAction;
        let newArray = [];
        newArray.push(result.customerOrder);
        this.listCustomerOrder.forEach(item => {
          newArray.push(item);
        });

        this.listCustomerOrder = newArray;
        this.isActionStep = result.isActionStep;
        this.isConfirmStep = result.isConfirmStep;
        this.customerOrderInfor.setValue(result.customerOrder);
        this.changeCustomerOrder(result.customerOrder, true);
        this.listSettingTaskEmp = result.listCustomerOrderTask;

        this.listReportPoint = result.listReportPoint;

        //Set chiều cao của thanh nối các step
        //Công thức: 210 * (số bản ghi - 1)
        this.heightOfReportPoint = ((this.listReportPoint.length - 1) * 210).toString() + "px";


        //set tree
        this.setTree();
      } else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  //Hệ số khuyến khích (2 cấp);
  setTree() {
    this.listViewNccVendor = [];
    let listNcc = this.listSettingTaskEmp.filter(x => x.nguoiThucHienType == 1 && x.vendorId != null && x.vendorId != this.emptyGuid).map(x => x.vendorOrderId);
    var uniqueNcc = listNcc.filter((value, index, array) => array.indexOf(value) === index);

    uniqueNcc.forEach(vendorOrderId => {
      let data = this.listSettingTaskEmp.find(x => x.vendorOrderId == vendorOrderId);

      let listChild: TreeNode[] = [];
      let listDv = this.listSettingTaskEmp.filter(x => x.nguoiThucHienType == 1 && x.vendorId != null && x.vendorId != this.emptyGuid && x.vendorOrderId == vendorOrderId);
      listDv.forEach(item => {
        let nodeChild: TreeNode = { data: item, children: [] };
        listChild.push(nodeChild)
      });

      let node: TreeNode = { data: data, children: listChild }
      node.expanded = true;
      this.listViewNccVendor.push(node);
    });
    console.log("this.listViewNccVendor", this.listViewNccVendor)
  }

  cancel() {
    this.router.navigate(['order/orderActionList']);
  }

  changeCustomerOrder(data, isDetailScreen: boolean = false) {
    //Lấy thông tin về các dịch vụ đã được chọn trong phiếu
    this.customerOrderService.changeCustomerOrder(data.orderId).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        this.listAtrrOption = result.listAtrrOption;
        this.cusName.setValue(result.cusName);
        this.cusAddress.setValue(result.cusAddress);
        this.cusPhone.setValue(result.cusPhone);
        this.cusNote.setValue(result.cusNote);
        this.cusOrderDate.setValue(result.cusOrderDate);

        //Nếu kp là màn detail thì gán lại
        if (!isDetailScreen) {
          this.listSettingTaskEmp = [];
          result.listOrderDetail.forEach(item => {
            let newTask = new CustomerOrderTaskEntityModel();
            newTask.orderDetailId = item.orderDetailId;
            newTask.path = item.optionName;
            newTask.optionId = item.optionTempId;
            newTask.servicePacketId = item.servicePacketId;
            newTask.isExtend = false; // có phải tùy chọn phát sinh hay không
            this.listSettingTaskEmp.push(newTask);
          });

          result.listOrderDetailExten.forEach(item => {
            let newTask = new CustomerOrderTaskEntityModel();
            newTask.orderDetailId = this.emptyGuid;
            newTask.path = item.name;
            newTask.servicePacketId = item.servicePacketId;
            newTask.isExtend = true; // có phải tùy chọn phát sinh hay không
            this.listSettingTaskEmp.push(newTask);
          });
        }
      } else {
        this.loading = false;
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  /*Chỉnh sửa thông tin nhân viên phụ trách dịch vụ*/
  editTask(rowData: CustomerOrderTaskEntityModel): void {
    debugger
    let listAttr = [];
    if (!rowData.isExtend) listAttr = this.listAtrrOption.filter(x => x.orderDetailId == rowData.orderDetailId);

    let ref = this.dialogService.open(CustomerOrderTaskSettingComponent, {
      data: {
        rowData: rowData,
        listAttr: listAttr,
        servicePacketId: rowData.servicePacketId,
      },
      header: 'Cài đặt thông tin nhân viên hỗ trợ',
      width: '50%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "550px",
        "overflow": "unset"
      }
    });

    ref.onClose.subscribe(() => { });
  }

  // SettingReportPointComponent: cấu hình điểm báo cáo
  // SettingReportPointDetailComponent: cập nhật báo cáo
  openSettingReport(rowData: ReportPointEntityModel): void {
    let ref = this.dialogService.open(SettingReportPointComponent, {
      data: {
        orderActionId: this.orderActionId,
        rowData: rowData,
      },
      header: 'Cài đặt điểm báo cáo',
      width: '50%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "550px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result.status) {
        this.setDefaultValue();
      }
    });
  }

  //Xem chi tiết hoặc báo cáo cho 1 điểm báo cáo
  openReport(isDetail, reportPoint: ReportPointEntityModel): void {
    let ref = this.dialogService.open(SettingReportPointDetailComponent, {
      data: {
        isDetail: isDetail,
        reportPoint: reportPoint,
        orderActionId: this.orderActionId,
        orderStatus: this.statusOrderAction,
        orderActionCode: this.orderActionCode.value,
      },
      header: isDetail ? 'Chi tiết điểm báo cáo' : "Báo cáo",
      width: '50%',
      baseZIndex: 1030,
      contentStyle: {
        "min-height": "280px",
        "max-height": "700px",
        "overflow": "auto"
      }
    });

    ref.onClose.subscribe((result: ResultDialog) => {
      if (result.isChangStatus) {
        this.getMasterData();
      }
    });
  }

  onViewVendorOrderDetail(id: any) {
    this.router.navigate([]).then(result => { window.open(`/vendor/detail-order;vendorOrderId=${id}`, '_blank'); });
  }

  //Tạo hoặc cập nhật phiếu hỗ trợ
  createOrderAction(statusOrderAction: number) {
    if (!this.orderActionForm.valid) {
      this.orderActionForm.markAllAsTouched();
      let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Vui lòng chọn thông tin phiếu yêu cầu' };
      this.showMessage(msg);
      return;
    }

    let listSettingEmpToTask = this.listSettingTaskEmp;

    //Check validate các task cho nhân viên
    let checkEmpToTask = false;
    listSettingEmpToTask.forEach(item => {
      //Nếu là nhà cung cấp
      if (item.nguoiThucHienType == 1 && !item.vendorId) checkEmpToTask = true;
      //Nếu là nhân viên
      if (item.nguoiThucHienType == 2 && (item.listEmpId == null || item.listEmpId.length == 0)) checkEmpToTask = true;

      if (!item.hanPheDuyet) checkEmpToTask = true;

      if (item.hanPheDuyet) item.hanPheDuyet = this.convertToUTCTime(new Date(item.hanPheDuyet));
    });

    if (checkEmpToTask) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Vui lòng chọn đầy đủ thông tin cài đặt nhân viên hỗ trợ!' };
      this.showMessage(msg);
      return;
    }

    //Nếu chuyển sang trạng thái thực hiện => Kiểm tra thông tin của điểm báo cáo
    if (statusOrderAction == 2) {
      //Check validate các điểm báo cáo
      let checkReportPoint = false;
      this.listReportPoint.forEach(item => {
        if (item.nguoiThucHienType == 2 && (item.empId == null || item.empId == this.emptyGuid || item.empId == "")) checkReportPoint = true;
      });

      if (checkReportPoint) {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: 'Vui lòng cấu hình đầy đủ thông tin các điểm báo cáo!' };
        this.showMessage(msg);
        return;
      }
    }


    let customrerOderId = this.customerOrderInfor.value.orderId;
    this.loading = true;
    this.customerOrderService.createOrUpdateCustomerOrderAction(this.orderActionId, customrerOderId, listSettingEmpToTask, statusOrderAction).subscribe(response => {
      let result: any = response;
      this.loading = false;
      if (result.statusCode == 200) {
        let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);


        if (this.orderActionId == null) this.router.navigate(['order/orderAction', { OrderActionId: result.customerOrderActionId }]);
        this.getMasterData();
      } else {
        let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
        this.showMessage(msg);
      }
    });
  }

  showTuChoiForm: boolean = false;
  tuChoiText: string = "";
  currentTuChoiId = null;

  showDialogLyDoTuChoi(id: string, statusId: Number) {
    if (statusId == 2) {
      this.xacNhanThucHienDichVuPhieuHoTro(id, statusId);
    } else {
      this.showTuChoiForm = true;
      this.tuChoiText = "";
      this.currentTuChoiId = id;
    }

  }

  cancelDialog() {
    this.showTuChoiForm = false;;
    this.tuChoiText = "";
    this.currentTuChoiId = null;
  }

  xacNhanThucHienDichVuPhieuHoTro(id: string, statusId: Number) {
    if (statusId == 3 && (this.tuChoiText == null || this.tuChoiText.trim() == "")) {
      let msg = { severity: 'error', summary: 'Thông báo:', detail: "Lý do từ chối không được để trống!" };
      this.showMessage(msg);
      return;
    }

    this.confirmationService.confirm({
      message: "Bạn có chắc " + (statusId == 2 ? "xác nhận " : "từ chối ") + "thực hiện dịch vụ này?",
      accept: async () => {
        this.loading = true;
        this.customerOrderService.xacNhanThucHienDichVuPhieuHoTro(id, statusId, this.tuChoiText).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode != 200) {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
            return;
          }
          let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
          this.showMessage(msg);
          this.getMasterData();
          this.cancelDialog();
        });
      }
    });
  }

  exportExcel(): void {
    let title = "phiếu hỗ trợ dịch vụ";
    let workBook = new Workbook();
    let worksheet = workBook.addWorksheet(title);

    let line = ['Công ty CP Kiến Tạo Tài Năng - HÃY ĐỂ TÔI LO                             Cộng hoà xã hội chủ nghĩa Việt Nam'];
    let lineRow = worksheet.addRow(line);
    lineRow.font = { name: 'Calibri', size: 10, bold: true };
    worksheet.mergeCells(`A${lineRow.number}:J${lineRow.number}`);
    lineRow.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow.height = 22;

    let line2 = ['                                                                                                                                   -----------------'];
    let lineRow2 = worksheet.addRow(line2);
    worksheet.mergeCells(`A${lineRow2.number}:J${lineRow2.number}`);
    lineRow2.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow2.font = { name: 'Calibri', size: 10, bold: true };
    lineRow2.height = 22;

    let line3 = ['                                                                                                                                      ------------'];
    let lineRow3 = worksheet.addRow(line3);
    worksheet.mergeCells(`A${lineRow3.number}:J${lineRow3.number}`);
    lineRow3.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow3.font = { name: 'Calibri', size: 10, bold: true };
    lineRow3.height = 22;

    let line4 = ['                                        PHIẾU HỖ TRỢ DỊCH VỤ'];
    let lineRow4 = worksheet.addRow(line4);
    worksheet.mergeCells(`A${lineRow4.number}:J${lineRow4.number}`);
    lineRow4.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow4.font = { name: 'Calibri', size: 12, bold: true };
    lineRow4.height = 22;

    let line5 = ['Xác nhận thông tin khách hàng đã lựu chọn dịch vụ'];
    let lineRow5 = worksheet.addRow(line5);
    worksheet.mergeCells(`A${lineRow5.number}:J${lineRow5.number}`);
    lineRow5.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow5.font = { name: 'Calibri', size: 10 };
    lineRow5.height = 22;

    let line6 = ['Khách hàng: ' + this.cusName?.value];
    let lineRow6 = worksheet.addRow(line6);
    worksheet.mergeCells(`A${lineRow6.number}:J${lineRow6.number}`);
    lineRow6.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow6.font = { name: 'Calibri', size: 10 };
    lineRow6.height = 22;

    let line7 = ['Địa chỉ: ' + this.cusAddress.value];
    let lineRow7 = worksheet.addRow(line7);
    worksheet.mergeCells(`A${lineRow7.number}:J${lineRow7.number}`);
    lineRow7.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow7.font = { name: 'Calibri', size: 10 };
    lineRow7.height = 22;

    let line8 = ['Số điện thoại: ' + this.cusPhone.value];
    let lineRow8 = worksheet.addRow(line8);
    worksheet.mergeCells(`A${lineRow8.number}:J${lineRow8.number}`);
    lineRow8.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow8.font = { name: 'Calibri', size: 10 };
    lineRow8.height = 22;

    let line9 = ['Dịch vụ hỗ trợ'];
    let lineRow9 = worksheet.addRow(line9);
    worksheet.mergeCells(`A${lineRow9.number}:J${lineRow9.number}`);
    lineRow9.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow9.font = { name: 'Calibri', size: 10 };
    lineRow9.height = 22;

    let dataHeaderRow = ['Dịch vụ', '', '', 'Nhà cung cấp', '', '', 'Người phụ trách', '', 'Ghi chú', ''];
    let headerRow = worksheet.addRow(dataHeaderRow);
    worksheet.mergeCells(`A${headerRow.number}:C${headerRow.number}`);
    worksheet.mergeCells(`D${headerRow.number}:F${headerRow.number}`);
    worksheet.mergeCells(`G${headerRow.number}:H${headerRow.number}`);
    worksheet.mergeCells(`I${headerRow.number}:J${headerRow.number}`);
    headerRow.font = { name: 'Calibri', size: 10, bold: true };
    dataHeaderRow.forEach((item, index) => {
      headerRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      headerRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      headerRow.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF' }
      };
    });
    headerRow.height = 25;

    if (this.listSettingTaskEmp != null && this.listSettingTaskEmp != undefined) {
      this.listSettingTaskEmp.forEach((item, index) => {
        let dataItem = [item.path, '', '', item.vendorName, '', '', item.listEmpName ? item.listEmpName.substring(2, item.listEmpName.length) : "", '', item.note, ''];
        let itemRow = worksheet.addRow(dataItem);
        worksheet.mergeCells(`A${itemRow.number}:C${itemRow.number}`);
        worksheet.mergeCells(`D${itemRow.number}:F${itemRow.number}`);
        worksheet.mergeCells(`G${itemRow.number}:H${itemRow.number}`);
        worksheet.mergeCells(`I${itemRow.number}:J${itemRow.number}`);
        itemRow.font = { name: 'Calibri', size: 10 };
        dataItem.forEach((item, index) => {
          itemRow.getCell(index + 1).border = { left: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
          itemRow.getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          itemRow.getCell(index + 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' }
          };
          itemRow.height = 35;
        });
      });
    }

    this.listSettingTaskEmp.forEach(x => {
      let line11 = ['Dịch vụ: ' + x.path];
      let lineRow11 = worksheet.addRow(line11);
      worksheet.mergeCells(`A${lineRow11.number}:J${lineRow11.number}`);
      lineRow11.getCell(1).alignment = { vertical: 'middle', wrapText: true, };
      lineRow11.font = { name: 'Calibri', size: 10, bold: true };
      lineRow11.height = 22;

      x.listEmpId.forEach(e => {
        let line12 = ['Người phụ trách: ' + this.listEmployeeEntity.find(y => y.employeeId == e)?.employeeName + '        ' + 'SĐT: ' + this.listEmployeeEntity.find(y => y.employeeId == e)?.phone];
        let lineRow12 = worksheet.addRow(line12);
        worksheet.mergeCells(`A${lineRow12.number}:J${lineRow12.number}`);
        lineRow12.getCell(1).alignment = { vertical: 'middle', wrapText: true, };
        lineRow12.font = { name: 'Calibri', size: 10, bold: true };
        lineRow12.height = 22;
      })
      worksheet.addRow([]);
    });

    if (this.listSettingTaskEmp.length < 10) {
      for (let index = 0; index <= (10 - this.listSettingTaskEmp.length); index++) {
        let emptyRow = ['', '', '', '', '', '', '', '', '', ''];
        let itemRow = worksheet.addRow(emptyRow);
        worksheet.mergeCells(`A${itemRow.number}:J${itemRow.number}`);
      }
    }

    let date = "                                                                                                                    Ngày: " + this.formatDate(new Date(), '-', false);
    let line10 = [date];
    let lineRow10 = worksheet.addRow(line10);
    worksheet.mergeCells(`A${lineRow10.number}:J${lineRow10.number}`);
    lineRow10.getCell(1).alignment = { vertical: 'middle', wrapText: true };
    lineRow10.font = { name: 'Calibri', size: 10, bold: true };
    lineRow10.height = 22;

    let line11 = ['                                                                                                                    Kế toán'];
    let lineRow11 = worksheet.addRow(line11);
    worksheet.mergeCells(`A${lineRow11.number}:J${lineRow11.number}`);
    lineRow11.getCell(1).alignment = { vertical: 'middle', wrapText: true, };
    lineRow11.font = { name: 'Calibri', size: 10, bold: true };
    lineRow11.height = 22;

    /* fix with for column */
    worksheet.getColumn(1).width = 8;
    worksheet.getColumn(2).width = 8;
    worksheet.getColumn(3).width = 9;
    worksheet.getColumn(4).width = 9;
    worksheet.getColumn(6).width = 8;
    worksheet.getColumn(5).width = 8;
    worksheet.getColumn(7).width = 8;
    worksheet.getColumn(8).width = 8;

    this.exportToExel(workBook, title);
  }

  exportToExel(workbook: Workbook, fileName: string): void {
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs.saveAs(blob, fileName);
    })
  }

  formatDate(date: Date, txt: string, isMonth: boolean): string {
    var dateItem = new Date(date);
    const yyyy = dateItem.getFullYear();
    let mm = dateItem.getMonth() + 1; // Months start at 0!
    let dd = dateItem.getDate();

    let ddtxt = '' + dd;
    let mmtxt = '' + mm;

    if (dd < 10) ddtxt = '0' + dd;
    if (mm < 10) mmtxt = '0' + mm;

    let formattedToday = ddtxt + txt + mmtxt + txt + yyyy;

    if (isMonth) {
      formattedToday = mmtxt + txt + yyyy;
    }
    return formattedToday;
  }


  changeViewNcc() {
    console.log("ạndks", this.viewNcc);
  }

  // type == 1: Chấp nhận, type == 2: Từ chối
  chapNhanTuChoiDonHang(vendorOrderId: string, type: number) {
    this.confirmationService.confirm({
      message: "Bạn có chắc " + (type == 1 ? "xác nhận " : "từ chối ") + " đơn hàng này?",
      accept: () => {
        this.loading = true;
        this.customerOrderService.chapNhanTuChoiDonHang(vendorOrderId, type).subscribe(response => {
          let result: any = response;
          this.loading = false;
          if (result.statusCode == 200) {
            let msg = { severity: 'success', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
            this.getMasterData();
          } else {
            let msg = { severity: 'error', summary: 'Thông báo:', detail: result.messageCode };
            this.showMessage(msg);
          }
        });
      }
    });
  }


  showEmpTaskInfor: boolean = false;
  currentTask = null; 

  xemChiTietPheDuyetDichVu(rowData){
    this.currentTask = rowData;
    this.showEmpTaskInfor = true;
  }

  closeXemChiTietPheDuyetDichVu(){
    this.currentTask = null;
    this.showEmpTaskInfor = false;
  }
}

