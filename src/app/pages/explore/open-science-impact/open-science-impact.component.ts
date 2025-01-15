import { Component, OnInit } from "@angular/core";
import {zip} from "rxjs/internal/observable/zip";
import {CountryTableData} from "../../../../survey-tool/app/domain/country-table-data";
import {ColorAxisOptions, LegendOptions} from "highcharts";
import {
  ColorPallet,
  EoscReadiness2022MapSubtitles
} from "../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import {ActivatedRoute} from "@angular/router";
import {EoscReadinessDataService} from "../../services/eosc-readiness-data.service";
import {StakeholdersService} from "../../../../survey-tool/app/services/stakeholders.service";
import {DataHandlerService} from "../../services/data-handler.service";
import {ActivityGauge, CategorizedAreaData, Series} from "../../../../survey-tool/app/domain/categorizedAreaData";


// declare var UIkit;

@Component({
  selector: 'app-open-science-impact',
  templateUrl: './open-science-impact.component.html',
})

export class OpenScienceImpactComponent implements OnInit {

  year: string = null;
  countriesArray: string[] = [];
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  toolTipData: Map<string, string>[] = [];
  activityGaugeData: ActivityGauge[] = [];
  participatingCountries: number[] = [];
  participatingCountriesPercentage: number[] = [];
  tableData: string[][] = [];

  constructor(private route: ActivatedRoute, private queryData: EoscReadinessDataService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {}

  ngOnInit() {

    this.stakeholdersService.getEOSCSBCountries().subscribe(
      res => {this.countriesArray = res;},
      error => {console.error(error)}
    )

    this.year = this.route.parent.snapshot.paramMap.get('year');
    if (!this.year)
      this.year = '2022';

    this.getPublicationsData();
  }

  getPublicationsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion7(),
      this.queryData.getQuestion(this.year, 'Question7'),
      // this.queryData.getQuestion7comment(),
      this.queryData.getQuestionComment(this.year, 'Question7'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[0] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.participatingCountriesPercentage[0] = Math.round((this.participatingCountries[0]/this.countriesArray.length + Number.EPSILON) * 100);
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(0,1);
      }
    );
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    // this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[index] = new CategorizedAreaData();

    let position = 0;
    for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
      if (this.tmpQuestionsDataArray[index].series[i].name === 'Awaiting data')
        continue;
      position = this.tmpQuestionsDataArray[index].series[i].name === 'No'? 1 : 0;
      this.questionsDataArray[index].series[i] = new Series(this.mapSubtitlesArray[mapCount][position], false);
      this.questionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
      this.questionsDataArray[index].series[i].showInLegend = true;
      this.questionsDataArray[index].series[i].color = ColorPallet[position];
    }
    let countryCodeArray = [];
    for (let i = 0; i < this.questionsDataArray[index].series.length; i++) {
      for (const data of this.questionsDataArray[index].series[i].data) {
        countryCodeArray.push(data.code)
      }
    }
    // console.log(this.countriesArray.filter(code => !countryCodeArray.includes(code)));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[2];
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));

  }
}
