import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { AbstractBase } from '../../../shared/abstract-base.component';
import { MobileAppConfigurationService } from '../../services/mobile-app-configuration.service';
import { CauHinhThongTinWebBanHangModel } from '../../../../../src/app/shared/models/CauHinhThongTinWebBanHangModel';
import { CauHinhDanhGiaWebModel } from '../../../../../src/app/shared/models/CauHinhDanhGiaWebModel';
import { CauHinhGioiThieuWebModel } from '../../../../../src/app/shared/models/CauHinhGioiThieuWebModel';
import { CauHinhQuangCaoDoiTacModel } from '../../../../../src/app/shared/models/CauHinhQuangCaoDoiTacModel';
import { tap } from 'rxjs/operators';
import { CauHinhAnhLinkWebModel } from '../../../../../src/app/shared/models/CauHinhAnhLinkWebModel';


@Component({
  selector: 'app-webSale-configuration',
  templateUrl: './webSale-configuration.component.html',
  styleUrls: ['./webSale-configuration.component.css']
})
export class WebSaleConfigurationComponent extends AbstractBase implements OnInit {

  cauHinhWeb: CauHinhThongTinWebBanHangModel = new CauHinhThongTinWebBanHangModel();
  listCauHinhDanhGia: CauHinhDanhGiaWebModel[] = [
    new CauHinhDanhGiaWebModel(),
    new CauHinhDanhGiaWebModel(),
    new CauHinhDanhGiaWebModel()
  ];

  listCauHinhGioiThieu: CauHinhGioiThieuWebModel[] = [
    new CauHinhGioiThieuWebModel(),
    new CauHinhGioiThieuWebModel(),
    new CauHinhGioiThieuWebModel()
  ];

  listCauHinhQuangCaoDoiTac: CauHinhQuangCaoDoiTacModel[] = [];

  listCauHinhBanner: CauHinhAnhLinkWebModel[] = [];
  listCauHinhUuDai: CauHinhAnhLinkWebModel[] = [];
  listCauHinhQuangCaoTrai: CauHinhAnhLinkWebModel[] = [];
  listCauHinhQuangCaoPhai: CauHinhAnhLinkWebModel[] = [];

  loading: boolean = false;

  constructor(
    injector: Injector,
    private _mobileAppConfigurationService: MobileAppConfigurationService,
    private changeDetector: ChangeDetectorRef,
  ) {
    super(injector);
  }

  async ngOnInit() {
    let resource = "admin/mobile-app-config";
    let permission: any = await this.getPermission.getPermission(resource);
    if (permission.status == false) {
      let mgs = { severity: 'warn', summary: 'Thông báo:', detail: 'Bạn không có quyền truy cập vào đường dẫn này vui lòng quay lại trang chủ' };
      this.showMessage(mgs);
      this.router.navigate(['/home']);
    }

    this.getMasterData();
  }

  getMasterData() {
    this.loading = true;
    this._mobileAppConfigurationService.getDataCauHinhWeb()
      .pipe(tap(() => this.loading = false))
      .subscribe(result => {
        console.log("get", result)
        if (result.cauHinhThongTinWebBanHang) this.cauHinhWeb = result.cauHinhThongTinWebBanHang;
        if (result.cauHinhDanhGiaWeb && result.cauHinhDanhGiaWeb.length > 0) this.listCauHinhDanhGia = result.cauHinhDanhGiaWeb;
        if (result.cauHinhGioiThieuWeb && result.cauHinhGioiThieuWeb.length > 0) this.listCauHinhGioiThieu = result.cauHinhGioiThieuWeb;
        if (result.cauHinhQuangCaoDoiTac && result.cauHinhQuangCaoDoiTac.length > 0) this.listCauHinhQuangCaoDoiTac = result.cauHinhQuangCaoDoiTac;
        if (result.cauHinhAnhLinkWeb && result.cauHinhAnhLinkWeb.length > 0) {
          this.listCauHinhBanner = result.cauHinhAnhLinkWeb.filter(x => x.type == 1);
          this.listCauHinhUuDai = result.cauHinhAnhLinkWeb.filter(x => x.type == 2);
          this.listCauHinhQuangCaoTrai = result.cauHinhAnhLinkWeb.filter(x => x.type == 3);
          this.listCauHinhQuangCaoPhai = result.cauHinhAnhLinkWeb.filter(x => x.type == 4);
        }
      })
  }

  save() {
    console.log("cauHinhWeb", this.cauHinhWeb)
    console.log("listCauHinhDanhGia", this.listCauHinhDanhGia)
    console.log("listCauHinhGioiThieu", this.listCauHinhGioiThieu)
    console.log("listCauHinhQuangCaoDoiTac", this.listCauHinhQuangCaoDoiTac)
    let listCauHinhAnhLink = [].concat(this.listCauHinhBanner, this.listCauHinhUuDai, this.listCauHinhQuangCaoTrai, this.listCauHinhQuangCaoPhai)

    console.log("listCauHinhAnhLink", listCauHinhAnhLink)

    this.loading = true;
    this._mobileAppConfigurationService.createUpdateCauHinhWeb(
      this.cauHinhWeb,
      this.listCauHinhDanhGia,
      this.listCauHinhGioiThieu,
      this.listCauHinhQuangCaoDoiTac,
      listCauHinhAnhLink)
      .pipe(tap(() => this.loading = false))
      .subscribe(result => {
        if (result.statusCode != 200) {
          console.log("get", result)
          this.showToast('error', 'Thông báo', 'Lưu thất bại');
          return;
        }
        this.showToast('success', 'Thông báo', 'Lưu thành công');
      })
  }

  themCauHinhAnhLink(type) {
    debugger
    switch (type) {
      case 1:
        this.listCauHinhBanner.push(new CauHinhAnhLinkWebModel(type));
        break;
      case 2:
        this.listCauHinhUuDai.push(new CauHinhAnhLinkWebModel(type));
        break;
      case 3:
        this.listCauHinhQuangCaoTrai.push(new CauHinhAnhLinkWebModel(type));
        break;
      case 4:
        this.listCauHinhQuangCaoPhai.push(new CauHinhAnhLinkWebModel(type));
        break;
    }
  }

  deleteCauHinhAnhLink(type, rowData: CauHinhAnhLinkWebModel) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: () => {
        switch (type) {
          case 1:
            this.listCauHinhBanner = this.listCauHinhBanner.filter(x => x != rowData);
            break;
          case 2:
            this.listCauHinhUuDai = this.listCauHinhUuDai.filter(x => x != rowData);
            break;
          case 3:
            this.listCauHinhQuangCaoTrai = this.listCauHinhQuangCaoTrai.filter(x => x != rowData);
            break;
          case 4:
            this.listCauHinhQuangCaoPhai = this.listCauHinhQuangCaoPhai.filter(x => x != rowData);
            break;
        }
      }
    });
  }

  themQuangCaoDoiTac() {
    this.listCauHinhQuangCaoDoiTac.push(new CauHinhQuangCaoDoiTacModel())
  }

  deleteCauHinhQuangCaoDoiTac(rowData: CauHinhQuangCaoDoiTacModel) {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa?',
      accept: () => {
        this.listCauHinhQuangCaoDoiTac = this.listCauHinhQuangCaoDoiTac.filter(x => x != rowData);
      }
    });
  }

  async uploadImageAdvertisement(event: { files: File[] }, rowData): Promise<void> {
    rowData.anh = await (await this.getBase64ImageFromURL(event)).toString();
  }

  removeImageAdvertisement(rowData): void {
    rowData.anh = null;
  }


  getBase64ImageFromURL(event: { files: File[] }): Promise<string | ArrayBuffer | null> {
    return new Promise(resolve => {
      let file = event.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result);
      };
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

}
