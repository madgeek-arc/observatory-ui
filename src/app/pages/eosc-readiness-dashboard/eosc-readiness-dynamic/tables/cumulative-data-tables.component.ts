import {Component, Input} from "@angular/core";

@Component({
    selector: 'cumulative-data-table',
    templateUrl: 'cumulative-data-table.component.html',
    standalone: false
})

export class CumulativeDataTablesComponent {

  @Input() title: string = null;
  @Input() tableData: string[][] = [];

  step: number = 20;
  from: number = 1;
  to: number = this.from + this.step;

  next() {
    if (this.from+this.step > this.tableData.length-1)
      return;

    this.from = this.from + this.step;
    if (this.to + this.step > this.tableData.length-1) {
      this.to = this.tableData.length
    } else
      this.to += this.step;
  }

  previous() {
    if (this.from - this.step < 1)
      return;

    if (this.to - this.from < this.step) {
      this.to -= (this.to - this.from);
    } else
      this.to -= this.step;

    this.from -= this.step;
  }

}
