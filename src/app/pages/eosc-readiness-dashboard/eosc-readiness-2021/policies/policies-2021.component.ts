import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "../../../services/data.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { CountryTableData } from "src/app/domain/country-table-data";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { mapSubtitles } from "src/app/domain/mapSubtitles";
import { latlong } from "src/app/domain/countries-lat-lon";
import { zip } from "rxjs/internal/observable/zip";
import { CategorizedAreaData, Series } from "src/app/domain/categorizedAreaData";
import * as UIkit from 'uikit';
import { HighchartsCategoryMapComponent } from "../../../../shared/charts/category-map/highcharts-category-map.component";
import { CountriesTableComponent } from "../../../archive/countries-table.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-policies-2021',
    templateUrl: './policies-2021.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HighchartsCategoryMapComponent, CountriesTableComponent]
})

export class Policies2021Component implements OnInit{

  questionsDataArray = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  tableAbsoluteDataArray = signal<CountryTableData[][]>([]);
  mapPointData: CountryTableData[];
  question3: CountryTableData[];
  question12: CountryTableData[];
  question14: CountryTableData[];
  countriesArray: string[] = [];
  mapSubtitles = signal<string[]>([]);
  mapSubtitlesArray: string[][] = mapSubtitles;


  private dataService = inject(DataService);
  private dataHandlerService = inject(DataHandlerService);
  private route = inject(ActivatedRoute);
  private stakeholdersService = inject(StakeholdersService);

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
      this.dataService.getQuestion4(),
      this.dataService.getQuestion14(),
      this.dataService.getQuestion15(),
      this.dataService.getQuestion16()).subscribe(
      rawData => {
        this.countriesArray = rawData[0];
        setAt(this.tableAbsoluteDataArray, 2, this.dataHandlerService.convertRawDataToTableData(rawData[1]));
        this.createMapDataset(0, 2);
        setAt(this.tableAbsoluteDataArray, 12, this.dataHandlerService.convertRawDataToTableData(rawData[2]));
        this.createMapDataset(0, 12);
        setAt(this.tableAbsoluteDataArray, 13, this.dataHandlerService.convertRawDataToTableData(rawData[3]));
        this.createMapDataset(0, 13);
        setAt(this.tableAbsoluteDataArray, 14, this.dataHandlerService.convertRawDataToTableData(rawData[4]));
        this.createMapDataset(0, 14);
      },
      error => {
        console.error(error);
      }
    );
    zip(this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion5()).subscribe(
       rawData => {
          this.countriesArray = rawData[0];
          setAt(this.tableAbsoluteDataArray, 3, this.dataHandlerService.convertRawDataToTableData(rawData[1]));
          this.tmpQuestionsDataArray[3] = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData[1]);
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
          console.error(error);
        }
      );

    zip(
      this.dataService.getEOSCRelevantPolicies(),
      this.dataService.getUseCasesAndPracticesByDimension(),
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion5(),
      this.dataService.getQuestion14(),
      this.dataService.getQuestion16()).subscribe(
      next => {
        setAt(this.tableAbsoluteDataArray, 1, this.dataHandlerService.convertRawDataToTableData(next[0]));
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(next[1]);
        this.countriesArray = next[2];
        this.question3 = this.dataHandlerService.convertRawDataToMapPoint(next[3]);
        this.question12 = this.dataHandlerService.convertRawDataToMapPoint(next[4]);
        this.question14 = this.dataHandlerService.convertRawDataToMapPoint(next[5]);
      },
      error => {},
      () => {
        this.createComplexMapDataset(0, 1);
      }
    );

  }

  createMapDataset(index: number, mapCount: number) {
    setAt(this.mapSubtitles, mapCount, mapSubtitles[mapCount][index]);

    const mapData = new CategorizedAreaData();
    mapData.series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteDataArray()[mapCount].length; i++) {
      if (this.tableAbsoluteDataArray()[mapCount][i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteDataArray()[mapCount][i].code);
      }
    }
    mapData.series[0].data = countryCodeArray;

    mapData.series[1] = new Series('No Policy', false);
    mapData.series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < mapData.series.length; i++) {
      mapData.series[i].data = mapData.series[i].data.map(code => ({ code }));
    }
    setAt(this.questionsDataArray, mapCount, mapData);
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    setAt(this.mapSubtitles, mapCount, mapSubtitles[mapCount][index]);

    const mapData = new CategorizedAreaData();

    mapData.series[0] = new Series(this.mapSubtitles()[mapCount], false);
    for (let i = 0; i < this.tmpQuestionsDataArray[mapCount].series.length; i++) {
      if (this.tmpQuestionsDataArray[mapCount].series[i].name === this.mapSubtitles()[mapCount]){
        mapData.series[0].data = this.tmpQuestionsDataArray[mapCount].series[i].data;
        break;
      }
    }
    let countryCodeArray = [];
    for (const data of mapData.series[0].data) {
      countryCodeArray.push(data.code)
    }

    mapData.series[1] = new Series('Other', false);
    mapData.series[1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    mapData.series[1].data = mapData.series[1].data.map(code => ({ code }));
    setAt(this.questionsDataArray, mapCount, mapData);
  }

  createComplexMapDataset(index: number, mapCount: number) {

    setAt(this.mapSubtitles, mapCount, mapSubtitles[mapCount][index]);

    const mapData = new CategorizedAreaData();
    mapData.series[0] = new Series('Has Policy', false);

    let countryCodeArray = [];
    for (let i = 0; i < this.tableAbsoluteDataArray()[mapCount].length; i++) {
      if (this.tableAbsoluteDataArray()[mapCount][i].EOSCRelevantPoliciesInPlace[index] === 'true') {
        countryCodeArray.push(this.tableAbsoluteDataArray()[mapCount][i].code);
      }
    }
    mapData.series[0].data = countryCodeArray;

    mapData.series[1] = new Series('No Policy', false);
    mapData.series[1].data = this.countriesArray.filter( code => !countryCodeArray.includes(code));

    for (let i = 0; i < mapData.series.length; i++) {
      mapData.series[i].data = mapData.series[i].data.map(code => ({ code }));
    }

    if (index > 2) {
      let mapPointArray = [];
      for (let i = 0; i < this.mapPointData.length; i++) {
        if (this.mapPointData[i].mapPointData[index] === 'true') {
          mapPointArray.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
        }
      }
      const pos = mapData.series.length
      mapData.series[pos] = new Series('Countries with use cases and best practices relevant to the policy', false, 'mappoint');
      mapData.series[pos].data = mapPointArray;
      mapData.series[pos].color = '#7CFC00';
      mapData.series[pos].marker.symbol = 'circle';
      mapData.series[pos].showInLegend = true;
    }

    if (index === 0 || index === 4 || index === 7) {

      let mapPointArray = [];
      if (index === 0) {
        for (let i = 0; i < this.question3.length; i++) {
          mapPointArray.push({name: this.question3[i].code, lat: latlong.get(this.question3[i].code).latitude, lon: latlong.get(this.question3[i].code).longitude});
        }
      }

      if (index === 4) {
        for (let i = 0; i < this.question12.length; i++) {
          mapPointArray.push({name: this.question12[i].code, lat: latlong.get(this.question12[i].code).latitude, lon: latlong.get(this.question12[i].code).longitude});
        }
      }

      if (index === 7) {
        for (let i = 0; i < this.question14.length; i++) {
          mapPointArray.push({name: this.question14[i].code, lat: latlong.get(this.question14[i].code).latitude, lon: latlong.get(this.question14[i].code).longitude});
        }
      }

      const pos = mapData.series.length
      mapData.series[pos] = new Series('Countries with financial strategies linked to the policy', false, 'mappoint');
      mapData.series[pos].data = mapPointArray;
      mapData.series[pos].color = '#FFEF00';
      mapData.series[pos].marker.symbol = 'diamond';
      mapData.series[pos].showInLegend = true;
    }

    // console.log(this.countryCodeArray);
    setAt(this.questionsDataArray, mapCount, mapData);
  }

}
