import {Component, OnInit} from "@angular/core";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {DataService} from "../../../services/data.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {zip} from "rxjs/internal/observable/zip";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {mapSubtitles} from "../../../domain/mapSubtitles";

@Component({
  selector: 'app-policies',
  templateUrl: './practices.component.html'
})

export class PracticesComponent implements OnInit {

  questionsDataArray: CategorizedAreaData[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  countriesArray: string[] = [];

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion18(),
      this.dataService.getQuestion19(),
      this.dataService.getUseCasesAndPracticesByDimension()).subscribe(
      rawData => {
        this.countriesArray = rawData[0];
        this.tableAbsoluteDataArray[16] = this.dataHandlerService.convertRawDataToTableData(rawData[1]);
        this.createMapDataset(0, 16);
        this.tableAbsoluteDataArray[17] = this.dataHandlerService.convertRawDataToTableData(rawData[2]);
        this.createMapDataset(0, 17);
        this.tableAbsoluteDataArray[18] = this.dataHandlerService.convertRawDataToTableData(rawData[3]);
        this.createMapDataset(0, 18);
      },
      error => {
        console.log(error);
      }
    );

    // this.dataService.getMandatedStatus().subscribe(
    //   rawData => {
    //     this.questionsDataArray[15] = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData);
    //     for (let i = 0; i < this.questionsDataArray[15].series.length; i++) {
    //       this.questionsDataArray[15].series[i].data = this.questionsDataArray[15].series[i].data.map(code => ({ code }));
    //     }
    //   },
    //   error => {
    //     console.log(error);
    //   }
    // );
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
