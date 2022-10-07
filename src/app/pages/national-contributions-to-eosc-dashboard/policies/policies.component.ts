import {Component, OnInit} from "@angular/core";
import {DataService} from "../../../services/data.service";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {DataHandlerService} from "../../../services/data-handler.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {zip} from "rxjs/internal/observable/zip";

@Component({
  selector: 'app-policies',
  templateUrl: './policies.component.html'
})

export class PoliciesComponent implements OnInit{

  questionsDataArray: CategorizedAreaData[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  countriesArray: string[] = [];
  map1Subtitle: string = null;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    zip(
    this.stakeholdersService.getEOSCSBCountries(),
    this.dataService.getEOSCRelevantPolicies()).subscribe(
      rawData => {
        this.countriesArray = rawData[0];
        this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(rawData[1]);
        this.createMapDataset(0);
      },
      error => {
        console.log(error);
      }
    );
    this.dataService.getQuestion3().subscribe(
      rawData => {
          this.questionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData);
          for (let i = 0; i < this.questionsDataArray[3].series.length; i++) {
            this.questionsDataArray[3].series[i].data = this.questionsDataArray[3].series[i].data.map(code => ({ code }));
          }
        },
      error => {
        console.log(error);
      }
    );
  }

  createMapDataset(index: number) {

    this.createMapSubtitle(index);

    this.questionsDataArray[1] = new CategorizedAreaData();
    this.questionsDataArray[1].series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteDataArray[1].length; i++) {
      if (this.tableAbsoluteDataArray[1][i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteDataArray[1][i].code);
      }
    }
    this.questionsDataArray[1].series[0].data = countryCodeArray;

    this.questionsDataArray[1].series[1] = new Series('No Policy', false);
    this.questionsDataArray[1].series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < this.questionsDataArray[1].series.length; i++) {
      this.questionsDataArray[1].series[i].data = this.questionsDataArray[1].series[i].data.map(code => ({ code }));
    }

  }

  createMapSubtitle(index: number) {
    switch (index) {
      case 0:
        this.map1Subtitle = 'There are one or more policies relevant for the EOSC in place';
        break;
      case 1:
        this.map1Subtitle = 'Policy in planning';
        break;
      case 2:
        this.map1Subtitle = 'One or more of the open science policies explicitly mentions EOSC';
        break;
      case 3:
        this.map1Subtitle = 'Policy addresses Open access to data, data management and/or FAIR';
        break;
      case 4:
        this.map1Subtitle = 'Policy addresses FAIRisation of data';
        break;
      case 5:
        this.map1Subtitle = 'Policy addresses Open access to software';
        break;
      case 6:
        this.map1Subtitle = 'Policy addresses Preservation and reuse of scientific information';
        break;
      case 7:
        this.map1Subtitle = 'Policy addresses Infrastructures that include aspects of open science';
        break;
      case 8:
        this.map1Subtitle = 'Policy addresses Skills and competencies';
        break;
      case 9:
        this.map1Subtitle = 'Policy addresses Incentives and rewards';
        break;
      case 10:
        this.map1Subtitle = 'Policy addresses Citizen science';
        break;
      case 11:
        this.map1Subtitle = 'Other';
        break;
    }
  }

}
