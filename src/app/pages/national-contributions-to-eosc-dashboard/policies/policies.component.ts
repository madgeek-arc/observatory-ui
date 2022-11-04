import {Component, OnInit} from "@angular/core";
import {DataService} from "../../../services/data.service";
import {CategorizedAreaData, Series} from "../../../domain/categorizedAreaData";
import {DataHandlerService} from "../../../services/data-handler.service";
import {CountryTableData} from "../../../domain/country-table-data";
import {StakeholdersService} from "../../../services/stakeholders.service";
import {zip} from "rxjs/internal/observable/zip";
import {mapSubtitles} from "../../../domain/mapSubtitles";
import {FundingForEOSCSums} from "../../../domain/funding-for-eosc";
import {ActivatedRoute} from "@angular/router";

import UIkit from "uikit";

@Component({
  selector: 'app-policies',
  templateUrl: './policies.component.html'
})

export class PoliciesComponent implements OnInit{

  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  countriesArray: string[] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = mapSubtitles;

  fundingForEOSCSums: FundingForEOSCSums;

  constructor(private dataService: DataService, private dataHandlerService: DataHandlerService,
              private route: ActivatedRoute, private stakeholdersService: StakeholdersService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      queryParams => {
        if (queryParams['chart'])
          UIkit.switcher('#policies-tabs').show(queryParams['chart']);
        else
          UIkit.switcher('#policies-tabs').show(0);
      }
    );
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getEOSCRelevantPolicies(),
      this.dataService.getQuestion4(),
      // this.dataService.getQuestion9(),
      // this.dataService.getQuestion10(),
      this.dataService.getQuestion14(),
      this.dataService.getQuestion15(),
      this.dataService.getQuestion16()).subscribe(
      rawData => {
        this.countriesArray = rawData[0];
        this.tableAbsoluteDataArray[1] = this.dataHandlerService.convertRawDataToTableData(rawData[1]);
        this.createMapDataset(0, 1);
        this.tableAbsoluteDataArray[2] = this.dataHandlerService.convertRawDataToTableData(rawData[2]);
        this.createMapDataset(0, 2);
        // this.tableAbsoluteDataArray[7] = this.dataHandlerService.convertRawDataToTableData(rawData[3]);
        // this.createMapDataset(0, 7);
        // this.tableAbsoluteDataArray[8] = this.dataHandlerService.convertRawDataToTableData(rawData[4]);
        // this.createMapDataset(0, 8);
        this.tableAbsoluteDataArray[12] = this.dataHandlerService.convertRawDataToTableData(rawData[3]);
        this.createMapDataset(0, 12);
        this.tableAbsoluteDataArray[13] = this.dataHandlerService.convertRawDataToTableData(rawData[4]);
        this.createMapDataset(0, 13);
        this.tableAbsoluteDataArray[14] = this.dataHandlerService.convertRawDataToTableData(rawData[5]);
        this.createMapDataset(0, 14);
      },
      error => {
        console.log(error);
      }
    );
    zip(
      this.dataService.getQuestion5(),
      // this.dataService.getQuestion6(),
      // this.dataService.getQuestion7(),
      // this.dataService.getQuestion8(),
      // this.dataService.getQuestion11(),
      // this.dataService.getQuestion12(),
      // this.dataService.getQuestion13()
    ).subscribe(
        rawData => {
            this.tableAbsoluteDataArray[3] = this.dataHandlerService.convertRawDataToTableData(rawData[0]);
            this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData[0]);
            for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
              this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
            }
            this.createMapDataFromCategorization(0,3);
            // this.questionsDataArray[4] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[1]);
            // this.questionsDataArray[5] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[2]);
            // this.questionsDataArray[6] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[3]);
            // this.questionsDataArray[9] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[4]);
            // this.questionsDataArray[10] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[5]);
            // this.questionsDataArray[11] = this.dataHandlerService.covertRawDataToColorAxisMap(rawData[6]);
          },
        error => {
          console.log(error);
        }
      );

    this.dataService.getFundingForEOSC().subscribe(
      rawData => {
        // console.log('RawData', rawData);
        // this.fundingForEOSCSums = this.dataHandlerService.convertRawDataToFundingForEOSCSums(rawData);
        this.fundingForEOSCSums = this.dataHandlerService.convertRawDataToFundingForEOSCSumsCustom(rawData);
      }, error => {
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

  createMapDataFromCategorization(index: number, mapCount: number) {
    this.mapSubtitles[mapCount] = mapSubtitles[mapCount][index];

    this.questionsDataArray[mapCount] = new CategorizedAreaData();

    for (let i = 0; i < this.tmpQuestionsDataArray[mapCount].series.length; i++) {
      if (this.tmpQuestionsDataArray[mapCount].series[i].name === this.mapSubtitles[mapCount]){
        this.questionsDataArray[mapCount].series[0] = new Series(this.mapSubtitles[mapCount], false);
        this.questionsDataArray[mapCount].series[0].data = this.tmpQuestionsDataArray[mapCount].series[i].data;
        break;
      }
    }
    let countryCodeArray = [];
    for (const data of this.questionsDataArray[mapCount].series[0].data) {
      countryCodeArray.push(data.code)
    }

    this.questionsDataArray[mapCount].series[1] = new Series('Other', false);
    this.questionsDataArray[mapCount].series[1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[mapCount].series[1].data = this.questionsDataArray[mapCount].series[1].data.map(code => ({ code }));

  }

}
