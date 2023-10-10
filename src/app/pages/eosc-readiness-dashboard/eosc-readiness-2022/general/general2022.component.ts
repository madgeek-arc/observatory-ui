import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {CountryTableData} from "../../../../../survey-tool/app/domain/country-table-data";
import {countriesNumbers, EoscReadiness2022MapSubtitles} from "../eosc-readiness2022-map-subtitles";
import {EoscReadiness2022DataService} from "../../../services/eosc-readiness2022-data.service";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../../services/data-handler.service";
import {zip} from "rxjs/internal/observable/zip";
import {RawData} from "../../../../../survey-tool/app/domain/raw-data";
import {isNumeric} from "rxjs/internal-compatibility";
import UIkit from "uikit";
import {countries} from "../../../../../survey-tool/app/domain/countries";

@Component({
  selector: 'app-general-2022',
  templateUrl: 'general2022.component.html'
})

export class General2022Component implements OnInit {

  type: string = null;
  fragment: string = null;

  countriesArray: string[] = [];
  toolTipData: Map<string, string>[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart: any[] = [];
  sumsArray: string[] = [];

  constructor(private route: ActivatedRoute, private queryData: EoscReadiness2022DataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {}

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        // console.log(params);
        this.type = params['type'];
        if (params['type'] === 'researchers') {
          this.getResearchersData();
        }
        if (params['type'] === 'RPOs') {
          this.getRPOsData();
        }
        if (params['type'] === 'RFOs') {
          this.getRFOsData();
        }
        if (params['type'] === 'repositories') {
          this.getRepositoriesData();
        }
        if (params['type'] === 'investments') {
          this.getInvestmentsData();
          this.route.fragment.subscribe(
            fragment => {
              this.fragment = fragment;
              this.activateSwitcher(fragment);
            }
          );
        }

      }
    );


  }

  getResearchersData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion1(),
      this.queryData.getQuestion1comment(),
    ).subscribe(
      res => {
        // this.countriesArray = res[0];
        this.questionsDataArray[0] = this.questionsDataArrayForBarChart[0] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.sumsArray[0] = this.calculateSum(res[1]);
      }
    )
  }

  getRPOsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion2(),
      this.queryData.getQuestion2comment(),
    ).subscribe(
      res => {
        this.questionsDataArray[1] = this.questionsDataArrayForBarChart[1] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[1] = this.calculateSum(res[1]);
      }
    )
  }

  getRFOsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion3(),
      this.queryData.getQuestion3comment(),
    ).subscribe(
      res => {
        this.questionsDataArray[2] = this.questionsDataArrayForBarChart[2] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[2] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[2] = this.calculateSum(res[1]);
      }
    )
  }

  getRepositoriesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion4(),
      this.queryData.getQuestion4comment(),
    ).subscribe(
      res => {
        this.questionsDataArray[3] = this.questionsDataArrayForBarChart[3] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[3] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[3] = this.calculateSum(res[1]);
      }
    )
  }

  getInvestmentsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion5(),
      this.queryData.getQuestion5comment(),
    ).subscribe(
      res => {
        this.questionsDataArray[4] = this.questionsDataArrayForBarChart[4] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        let tempArr: string[] = [];
        this.questionsDataArray[4].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[4] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.sumsArray[4] = this.calculateSum(res[1]);
      }
    )
  }

  getInvestmentsDataPercentage(pos: number, param: string) {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion5(),
      this.queryData.getQuestion5comment(),
    ).subscribe(
      res => {
        this.questionsDataArray[pos] = this.questionsDataArrayForBarChart[pos] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        for (let i = 0; i < this.questionsDataArray[pos].length; i++) {
          let country = countriesNumbers.find(
            elem=> elem.id.toLowerCase() === this.questionsDataArray[pos][i][0]
          );
          if (country?.[param]) {
            this.questionsDataArray[pos][i][1] = this.round(this.questionsDataArray[pos][i][1] / country[param] * 1000, 4);
          } else {
            this.questionsDataArray[pos].splice(i, 1);
            i--;
          }
        }
        let tempArr: string[] = [];
        this.questionsDataArray[pos].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        this.toolTipData[pos] = this.dataHandlerService.covertRawDataGetText(res[2]);
        // this.sumsArray[4] = this.calculateSum(res[1]);
      }
    )
  }

  calculateSum(rawData: RawData): string {
    let sum = 0.0;
    for (const series of rawData.datasets) {
      for (const rowResult of series.series.result) {
        if (isNumeric(rowResult.row[1])) {
          sum += +rowResult.row[1];
        }
      }
    }
    return (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
  }

  activateSwitcher(fragment: string) {
    if (!UIkit.switcher('#investmentsContent')){
      setTimeout( ()=> {
        this.activateSwitcher(fragment);
      }, 100);
    } else {
      switch (fragment) {
        case 'absolute':
          UIkit.switcher('#investmentsContent').show(0);
          break;
        case 'gdp':
          this.getInvestmentsDataPercentage(5, 'gdp');
          UIkit.switcher('#investmentsContent').show(1);
          break;
        case 'gerd':
          this.getInvestmentsDataPercentage(6, 'gerd');
          UIkit.switcher('#investmentsContent').show(2);
          break;
        case 'income':
          this.getInvestmentsDataPercentage(7, 'income');
          UIkit.switcher('#investmentsContent').show(3);
          break;
      }
    }
  }


  round(value: number, precision?: number) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

}
