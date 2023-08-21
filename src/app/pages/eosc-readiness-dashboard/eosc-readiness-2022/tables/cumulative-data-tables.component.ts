import {Component, Input} from "@angular/core";

@Component({
  selector: 'cumulative-data-table',
  templateUrl: 'cumulative-data-table.component.html'
})

export class CumulativeDataTablesComponent {

  @Input() countriesArray: string[] = [];
  @Input() tableData: string[][] = [];

}
