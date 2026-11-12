import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { zip } from "rxjs/internal/observable/zip";
import { DataService } from "../../../services/data.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { CountryTableData } from "src/app/domain/country-table-data";
import { mapSubtitles } from "src/app/domain/mapSubtitles";
import { CategorizedAreaData, Series } from "src/app/domain/categorizedAreaData";
import * as UIkit from 'uikit';
import { HighchartsCategoryMapComponent } from "../../../../shared/charts/category-map/highcharts-category-map.component";
import { CountriesTableComponent } from "../../../archive/countries-table.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-practices-2021',
    templateUrl: './practices-2021.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HighchartsCategoryMapComponent, CountriesTableComponent]
})

export class Practices2021Component implements OnInit {

  questionsDataArray = signal<CategorizedAreaData[]>([]);
  tmpQuestionsDataArray: CategorizedAreaData[] = [];
  tableAbsoluteDataArray = signal<CountryTableData[][]>([]);
  mapSubtitles = signal<string[]>([]);
  mapSubtitlesArray: string[][] = mapSubtitles;
  countriesArray: string[] = [];

  private dataService = inject(DataService);
  private dataHandlerService = inject(DataHandlerService);
  private route = inject(ActivatedRoute);
  private stakeholdersService = inject(StakeholdersService);

  ngOnInit() {
    this.route.queryParams.subscribe(
      queryParams => {
        if (queryParams['chart'])
          UIkit.switcher('#practices-tabs').show(queryParams['chart']);
        else
          UIkit.switcher('#practices-tabs').show(0);
      }
    );
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.dataService.getQuestion18(),
      this.dataService.getQuestion19(),
      this.dataService.getUseCasesAndPracticesByDimension(),
      this.dataService.getMandatedStatus()).subscribe(
      rawData => {
        this.countriesArray = rawData[0];
        setAt(this.tableAbsoluteDataArray, 16, this.dataHandlerService.convertRawDataToTableData(rawData[1]));
        this.createMapDataset(0, 16);
        setAt(this.tableAbsoluteDataArray, 17, this.dataHandlerService.convertRawDataToTableData(rawData[2]));
        this.createMapDataset(0, 17);
        setAt(this.tableAbsoluteDataArray, 18, this.dataHandlerService.convertRawDataToTableData(rawData[3]));
        this.createMapDataset(0, 18);
        setAt(this.tableAbsoluteDataArray, 15, this.dataHandlerService.convertRawDataToTableData(rawData[4]));
        this.tmpQuestionsDataArray[15] = this.dataHandlerService.convertRawDataToCategorizedAreasData(rawData[4]);
        for (let i = 0; i < this.tmpQuestionsDataArray[15].series.length; i++) {
          this.tmpQuestionsDataArray[15].series[i].data = this.tmpQuestionsDataArray[15].series[i].data.map(code => ({ code }));
        }
        this.createMapDataFromCategorization(0,15);
      },
      error => {
        console.error(error);
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

}
