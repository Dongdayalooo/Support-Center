import { Component, OnInit, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef, Table } from 'primeng';


@Component({
  selector: 'app-showErrImport-dialog',
  templateUrl: './showErrImport-dialog.component.html',
  styleUrls: ['./showErrImport-dialog.component.css']
})
export class ShowErrImportDialogComponent implements OnInit {
  @ViewChild('dt') myTable: Table;

  listColumn = [];
  listData = [];

  filterGlobal: string = "";

  loading: boolean = false;


  constructor(
    private el: ElementRef,
    private translate: TranslateService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,

  ) {
    this.listColumn = this.config.data.listColumn;
    this.listData = this.config.data.listData;

    this.listColumn.push(
      { field: 'listErr', header: 'Thông tin lỗi', textAlign: "left", width: '200px' },
    );
  }

  ngOnInit() {
  }


  onCancelClick() {
    this.ref.close(false);
  }
}

