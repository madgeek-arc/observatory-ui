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
  mapSubtitle: string = null;
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

    this.createMapSubtitle(index);

    this.countryCodeArray = [];
    this.countryCodeArray[0] = new HighlightedAreaSeries('Country');

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteData.length; i++) {
      if (this.tableAbsoluteData[i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push([this.tableAbsoluteData[i].code.toLocaleLowerCase(), index]);
      }
    }
    this.countryCodeArray[0].data = countryCodeArray;
  }

  createMapSubtitle(index: number) {
    switch (index) {
      case 0:
        this.mapSubtitle = 'There are one or more policies relevant for the EOSC in place';
        break;
      case 1:
        this.mapSubtitle = 'Policy in planning';
        break;
      case 2:
        this.mapSubtitle = 'One or more of the open science policies explicitly mentions EOSC';
        break;
      case 3:
        this.mapSubtitle = 'Policy addresses Open access to data, data management and/or FAIR';
        break;
      case 4:
        this.mapSubtitle = 'Policy addresses FAIRisation of data';
        break;
      case 5:
        this.mapSubtitle = 'Policy addresses Open access to software';
        break;
      case 6:
        this.mapSubtitle = 'Policy addresses Preservation and reuse of scientific information';
        break;
      case 7:
        this.mapSubtitle = 'Policy addresses Infrastructures that include aspects of open science';
        break;
      case 8:
        this.mapSubtitle = 'Policy addresses Skills and competencies';
        break;
      case 9:
        this.mapSubtitle = 'Policy addresses Incentives and rewards';
        break;
      case 10:
        this.mapSubtitle = 'Policy addresses Citizen science';
        break;
      case 11:
        this.mapSubtitle = 'Other';
        break;
    }
  }

}
