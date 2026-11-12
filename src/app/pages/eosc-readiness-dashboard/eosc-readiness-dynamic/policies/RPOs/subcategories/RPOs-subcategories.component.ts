import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EoscReadinessDataService } from "src/app/pages/services/eosc-readiness-data.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "src/app/pages/services/data-handler.service";
import { CountryTableData } from "src/app/domain/country-table-data";
import { EoscReadinessMapSubtitles } from "../../../eosc-readiness-map-subtitles";
import { RawData } from "src/app/domain/raw-data";
import { zip } from "rxjs/internal/observable/zip";
import { isNumeric } from "src/app/shared/utils/is-numeric";
import * as UIkit from 'uikit';
import { HighchartsColorAxisMapComponent } from "../../../../../../shared/charts/color-axis-map/highcharts-color-axis-map.component";
import { HighchartsBarComponent } from "../../../../../../shared/charts/bar-chart/highcharts-bar.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-RPOs-subcategories',
    templateUrl: 'RPOs-subcategories.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HighchartsColorAxisMapComponent, HighchartsBarComponent]
})

export class RPOsSubcategoriesComponent implements OnInit{

  year: string = null;
  dataType = signal<string>(null);

  countriesArray = signal<string[]>([]);
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadinessMapSubtitles;
  questionsDataArray = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart = signal<any[]>([]);
  sumsArray = signal<string[]>([]);
  toolTipData = signal<Map<string, string>[]>([]);

  private route = inject(ActivatedRoute);
  private queryData = inject(EoscReadinessDataService);
  private stakeholdersService = inject(StakeholdersService);
  private dataHandlerService = inject(DataHandlerService);

  ngOnInit() {
    this.year = this.route.parent.parent.parent.snapshot.paramMap.get('year');
    // if (!this.year)
    //   this.year = '2022';

    this.route.params.subscribe(
      params => {
        this.dataType.set(params['dataType']);
        switch (this.dataType()) {
          case 'dataManagement':
            this.getDataManagementData();
            UIkit.switcher('#dataContent').show(0);
            break;
          case 'fairData':
            this.getFairDataData();
            UIkit.switcher('#dataContent').show(1);
            break;
          case 'openData':
            this.getOpenDataData();
            UIkit.switcher('#dataContent').show(2);
            break;
          case 'connectingRepositoriesToEOSC':
            this.getConnectingReposToEOSCData();
            UIkit.switcher('#infrastructuresContent').show(0);
            break;
          case 'dataStewardship':
            this.getDataStewardshipData();
            UIkit.switcher('#infrastructuresContent').show(1);
            break;
          case 'longTermDataPreservation':
            this.getLongTermDataPreservationData();
            UIkit.switcher('#infrastructuresContent').show(2);
            break;
        }
      }
    )
  }

  getDataManagementData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion12(),
      this.queryData.getQuestion(this.year, 'Question12'),
      // this.queryData.getQuestion12comment(),
      this.queryData.getQuestionComment(this.year, 'Question12'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 0, mapData);
        setAt(this.questionsDataArrayForBarChart, 0, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 0, this.calculateSum(res[1]));
        setAt(this.toolTipData, 0, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getFairDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion16(),
      this.queryData.getQuestion(this.year, 'Question16'),
      // this.queryData.getQuestion16comment(),
      this.queryData.getQuestionComment(this.year, 'Question16'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 1, mapData);
        setAt(this.questionsDataArrayForBarChart, 1, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 1, this.calculateSum(res[1]));
        setAt(this.toolTipData, 1, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getOpenDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion20(),
      this.queryData.getQuestion(this.year, 'Question20'),
      // this.queryData.getQuestion20comment(),
      this.queryData.getQuestionComment(this.year, 'Question20'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 2, mapData);
        setAt(this.questionsDataArrayForBarChart, 2, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 2, this.calculateSum(res[1]));
        setAt(this.toolTipData, 2, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getConnectingReposToEOSCData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion32(),
      this.queryData.getQuestion(this.year, 'Question32'),
      // this.queryData.getQuestion32comment(),
      this.queryData.getQuestionComment(this.year, 'Question32'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 3, mapData);
        setAt(this.questionsDataArrayForBarChart, 3, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 3, this.calculateSum(res[1]));
        setAt(this.toolTipData, 3, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getDataStewardshipData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion36(),
      this.queryData.getQuestion(this.year, 'Question36'),
      // this.queryData.getQuestion36comment(),
      this.queryData.getQuestionComment(this.year, 'Question36'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 4, mapData);
        setAt(this.questionsDataArrayForBarChart, 4, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[4].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 4, this.calculateSum(res[1]));
        setAt(this.toolTipData, 4, this.dataHandlerService.covertRawDataGetText(res[2]));
      }
    )
  }

  getLongTermDataPreservationData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion40(),
      this.queryData.getQuestion(this.year, 'Question40'),
      // this.queryData.getQuestion40comment(),
      this.queryData.getQuestionComment(this.year, 'Question40'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 5, mapData);
        setAt(this.questionsDataArrayForBarChart, 5, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[5].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 5, this.calculateSum(res[1]));
        setAt(this.toolTipData, 5, this.dataHandlerService.covertRawDataGetText(res[2]));
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
}
