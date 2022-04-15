import {Component, OnInit} from "@angular/core";
import {DataService} from "../../../services/data.service";

@Component({
  selector: 'app-ncte-funding',
  templateUrl: './ncte-funding.component.html'
})

export class NCTEFundingComponent implements OnInit {

  constructor(private dataService: DataService,) {}

  ngOnInit() {
    this.dataService.getFinancialContrToEOSCLinkedToPolicies().subscribe(
      rawData => {
        console.log('RawData', rawData);
        // this.tableAbsoluteData = this.dataHandlerService.convertRawDataToAbsoluteTableData(rawData);
        // this.loadingAbsoluteTable = false;
      }, error => {
        console.log(error);
        // this.loadingAbsoluteTable = false;
      }
    );
  }
}
