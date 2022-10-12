import {Component, OnInit} from "@angular/core";
import {DataService} from "../../../services/data.service";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {DataHandlerService} from "../../../services/data-handler.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {zip} from "rxjs/internal/observable/zip";
import {mapSubtitles} from "../../../domain/mapSubtitles";

@Component({
  selector: 'app-policies',
  templateUrl: './policies.component.html'
})

export class PoliciesComponent implements OnInit{

  questionsDataArray: CategorizedAreaData[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  countriesArray: string[] = [];
  mapSubtitles: string[] = [];

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getEOSCRelevantPolicies(),
      this.dataService.getEOSCRelevantPolicies(),).subscribe(
      rawData => {
        this.countriesArray = rawData[0];
        this.tableAbsoluteDataArray[0] = this.dataHandlerService.convertRawDataToTableData(rawData[1]);
        this.createMapDataset(0, 0);
        this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(rawData[1]);
        this.createMapDataset(0, 1);
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

  createMapDataset(index: number, mapCount: number) {
    this.mapSubtitles[mapCount] = mapSubtitles[mapCount][index];

    this.questionsDataArray[mapCount] = new CategorizedAreaData();
    this.questionsDataArray[mapCount].series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteDataArray[mapCount].length; i++) {
      if (this.tableAbsoluteDataArray[mapCount][i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteDataArray[mapCount][i].code);
      }
    }
    this.questionsDataArray[mapCount].series[0].data = countryCodeArray;

    this.questionsDataArray[mapCount].series[1] = new Series('No Policy', false);
    this.questionsDataArray[mapCount].series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < this.questionsDataArray[mapCount].series.length; i++) {
      this.questionsDataArray[mapCount].series[i].data = this.questionsDataArray[mapCount].series[i].data.map(code => ({ code }));
    }

  }

}
