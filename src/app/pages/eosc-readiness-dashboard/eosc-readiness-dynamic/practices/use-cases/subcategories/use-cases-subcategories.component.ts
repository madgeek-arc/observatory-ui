import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { zip } from "rxjs/internal/observable/zip";
import { ColorPallet, EoscReadinessMapSubtitles } from "../../../eosc-readiness-map-subtitles";
import { CountryTableData } from "src/app/domain/country-table-data";
import { EoscReadinessDataService } from "src/app/pages/services/eosc-readiness-data.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "src/app/pages/services/data-handler.service";
import { CategorizedAreaData, Series } from "src/app/domain/categorizedAreaData";
import * as UIkit from 'uikit';
import { HighchartsCategoryMapComponent } from "../../../../../../shared/charts/category-map/highcharts-category-map.component";
import { GaugeSimpleComponent } from "../../../../../../shared/charts/gauge-simple/gauge-simple.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-use-case-subcategories',
    templateUrl: 'use-cases-subcategories.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HighchartsCategoryMapComponent, GaugeSimpleComponent]
})

export class UseCasesSubcategoriesComponent implements OnInit {

  year: string = null;
  dataType = signal<string>(null);

  countriesArray = signal<string[]>([]);
  tableAbsoluteDataArray: CountryTableData[][] = [];
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadinessMapSubtitles;
  questionsDataArray = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  participatingCountries = signal<number[]>([]);
  participatingCountriesPercentage = signal<number[]>([]);
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
            UIkit.switcher('#dataContent').show(2)
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
      // this.queryData.getQuestion59(),
      this.queryData.getQuestion(this.year, 'Question59'),
      // this.queryData.getQuestion59comment(),
      this.queryData.getQuestionComment(this.year, 'Question59'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 0, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 0, Math.round((this.participatingCountries()[0]/this.countriesArray().length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 0, this.dataHandlerService.covertRawDataGetText(res[2]));
        this.createMapDataFromCategorization(0,3);
      }
    );
  }

  getFairDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion63(),
      this.queryData.getQuestion(this.year, 'Question63'),
      // this.queryData.getQuestion63comment(),
      this.queryData.getQuestionComment(this.year, 'Question63'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 1, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 1, Math.round((this.participatingCountries()[1]/this.countriesArray().length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 1, this.dataHandlerService.covertRawDataGetText(res[2]));
        this.createMapDataFromCategorization(1,3);
      }
    );
  }

  getOpenDataData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion67(),
      this.queryData.getQuestion(this.year, 'Question67'),
      // this.queryData.getQuestion67comment(),
      this.queryData.getQuestion(this.year, 'Question67'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[2] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 2, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 2, Math.round((this.participatingCountries()[2]/this.countriesArray().length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[2].series.length; i++) {
          this.tmpQuestionsDataArray[2].series[i].data = this.tmpQuestionsDataArray[2].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 2, this.dataHandlerService.covertRawDataGetText(res[2]));
        this.createMapDataFromCategorization(2,3);
      }
    );
  }

  getConnectingReposToEOSCData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion79(),
      this.queryData.getQuestion(this.year, 'Question79'),
      // this.queryData.getQuestion79comment(),
      this.queryData.getQuestionComment(this.year, 'Question79'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 3, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 3, Math.round((this.participatingCountries()[3]/this.countriesArray().length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[3].series.length; i++) {
          this.tmpQuestionsDataArray[3].series[i].data = this.tmpQuestionsDataArray[3].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 3, this.dataHandlerService.covertRawDataGetText(res[2]));
        this.createMapDataFromCategorization(3,3);
      }
    );
  }

  getDataStewardshipData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion83(),
      this.queryData.getQuestion(this.year, 'Question83'),
      // this.queryData.getQuestion83comment(),
      this.queryData.getQuestionComment(this.year, 'Question83'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[4] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 4, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 4, Math.round((this.participatingCountries()[4]/this.countriesArray().length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[4].series.length; i++) {
          this.tmpQuestionsDataArray[4].series[i].data = this.tmpQuestionsDataArray[4].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 4, this.dataHandlerService.covertRawDataGetText(res[2]));
        this.createMapDataFromCategorization(4,3);
      }
    );
  }

  getLongTermDataPreservationData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion87(),
      this.queryData.getQuestion(this.year, 'Question87'),
      // this.queryData.getQuestion87comment(),
      this.queryData.getQuestionComment(this.year, 'Question87'),
    ).subscribe(
      res => {
        this.countriesArray.set(res[0]);
        this.tmpQuestionsDataArray[5] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        setAt(this.participatingCountries, 5, this.dataHandlerService.convertRawDataForActivityGauge(res[1]));
        setAt(this.participatingCountriesPercentage, 5, Math.round((this.participatingCountries()[5]/this.countriesArray().length + Number.EPSILON) * 100));
        for (let i = 0; i < this.tmpQuestionsDataArray[5].series.length; i++) {
          this.tmpQuestionsDataArray[5].series[i].data = this.tmpQuestionsDataArray[5].series[i].data.map(code => ({ code }));
        }
        setAt(this.toolTipData, 5, this.dataHandlerService.covertRawDataGetText(res[2]));
        this.createMapDataFromCategorization(5,3);
      }
    );
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    // this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    const mapData = new CategorizedAreaData();
    let position = 0;
    for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
      if (this.tmpQuestionsDataArray[index].series[i].name === 'Awaiting data')
        continue;
      position = this.tmpQuestionsDataArray[index].series[i].name === 'No'? 1 : 0;
      mapData.series[i] = new Series(this.mapSubtitlesArray[mapCount][position], false);
      mapData.series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
      mapData.series[i].showInLegend = true;
      mapData.series[i].color = ColorPallet[position];
    }
    // for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
    //   mapData.series[i] = new Series(this.mapSubtitlesArray[mapCount][i], false);
    //   mapData.series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
    //   mapData.series[i].showInLegend = true;
    //   mapData.series[i].color = ColorPallet[i];
    // }
    let countryCodeArray = [];
    for (let i = 0; i < mapData.series.length; i++) {
      for (const data of mapData.series[i].data) {
        countryCodeArray.push(data.code);
      }
    }

    mapData.series[mapData.series.length] = new Series('Awaiting Data', false);
    mapData.series[mapData.series.length-1].showInLegend = true;
    mapData.series[mapData.series.length-1].color = ColorPallet[2];
    mapData.series[mapData.series.length-1].data = this.countriesArray().filter(code => !countryCodeArray.includes(code));
    mapData.series[mapData.series.length-1].data = mapData.series[mapData.series.length-1].data.map(code => ({ code }));
    setAt(this.questionsDataArray, index, mapData);
  }
}
