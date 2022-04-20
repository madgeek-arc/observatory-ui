import {Component, OnInit} from "@angular/core";
import {CountryTableData} from "../../../domain/country-table-data";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {DomSanitizer} from "@angular/platform-browser";
import {SeriesMapDataOptions} from "highcharts/highmaps";
import {HighlightedAreaSeries} from "../../../domain/categorizedAreaData";

@Component({
  selector: 'app-ncte-policies',
  templateUrl: './ncte-policies.component.html'
})

export class NCTEPoliciesComponent implements OnInit{

  tableAbsoluteData: CountryTableData[];
  countryCodeArray: HighlightedAreaSeries[] = null;
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
      },
      () => {
        this.createMapDataset(0);
      }
    );
  }

  createMapDataset(index: number) {
    this.countryCodeArray = [];
    this.countryCodeArray[0] = new HighlightedAreaSeries('Country');

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteData.length; i++) {
      if (this.tableAbsoluteData[i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push([this.tableAbsoluteData[i].code, index]);
      }
    }
    this.countryCodeArray[0].data = countryCodeArray;
    // this.countryCodeArray[0].data = [
    //     ['is', 1],
    //     ['no', 1],
    //     ['se', 1],
    //     ['dk', 1],
    //     ['fi', 1]
    //   ];
  }

}
