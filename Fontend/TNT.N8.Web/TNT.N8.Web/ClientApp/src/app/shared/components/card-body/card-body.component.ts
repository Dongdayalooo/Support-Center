import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'card-body',
  template: `
    <div class="card-body">
      <ng-content></ng-content>
    </div>
  `,
  // styleUrls: ['./card-body.component.css']
  styles: ['.card-body { background: #fff}']
})
export class CardBodyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

