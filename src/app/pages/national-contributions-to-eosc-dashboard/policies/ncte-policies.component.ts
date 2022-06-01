import {Component, OnInit} from "@angular/core";
import {CountryTableData} from "../../../domain/country-table-data";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {StakeholdersService} from "../../../services/stakeholders.service";

@Component({
  selector: 'app-ncte-policies',
  templateUrl: './ncte-policies.component.html'
})

export class NCTEPoliciesComponent implements OnInit{

  tableAbsoluteData: CountryTableData[];
  countryCodeArray: CategorizedAreaData = null;
  mapSubtitle: string = null;
  loadingAbsoluteTable: boolean = true;
  countriesArray: string[] = [];

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private stakeholdersService: StakeholdersService) {}

  ngOnInit() {
    this.loadingAbsoluteTable = true;
    this.dataService.getEOSCRelevantPolicies().subscribe(
      rawData => {
        this.tableAbsoluteData = this.dataHandlerService.convertRawDataToTableData(rawData);
        this.loadingAbsoluteTable = false;

        this.dataService.getUseCasesAndPracticesByDimension().subscribe(
          rawData1 => {


            this.stakeholdersService.getEOSCSBCountries().subscribe(
              res => {
                this.countriesArray = res;
              },
              error => console.log(error),
              () => {
                this.createMapDataset(0);
              }
            );
          },
          error => {
            console.log(error);
          }
        );
      },
      error => {
        console.log(error);
        this.loadingAbsoluteTable = false;
      },
      () => {
      }
    );
  }

  createMapDataset(index: number) {

    this.createMapSubtitle(index);

    this.countryCodeArray = new CategorizedAreaData();
    this.countryCodeArray.series[0] = new Series('Has Policy');

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteData.length; i++) {
      if (this.tableAbsoluteData[i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteData[i].code);
      }
    }
    this.countryCodeArray.series[0].data = countryCodeArray;

    this.countryCodeArray.series[1] = new Series('No Policy');
    this.countryCodeArray.series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < this.countryCodeArray.series.length; i++) {
      this.countryCodeArray.series[i].data = this.countryCodeArray.series[i].data.map(code => ({ code }));
    }
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
