import {Component, OnInit} from "@angular/core";
import {CountryTableData} from "../../../domain/country-table-data";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-ncte-policies',
  templateUrl: './ncte-policies.component.html'
})

export class NCTEPoliciesComponent implements OnInit{

  tableAbsoluteData: CountryTableData[];
  loadingAbsoluteTable: boolean = true;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadingAbsoluteTable = true;
    this.dataService.getEOSCRelevantPolicies().subscribe(
      rawData => {
        this.tableAbsoluteData = this.dataHandlerService.convertRawDataToTableData(rawData);
        console.log(this.tableAbsoluteData);
        this.loadingAbsoluteTable = false;
      },
      error => {
        console.log(error);
        this.loadingAbsoluteTable = false;
      }
    );
  }

}
