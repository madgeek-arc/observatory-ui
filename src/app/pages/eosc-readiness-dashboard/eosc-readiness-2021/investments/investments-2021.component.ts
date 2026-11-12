import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "../../../services/data.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { mapSubtitles } from "src/app/domain/mapSubtitles";
import { CountryTableData } from "src/app/domain/country-table-data";
import { FundingForEOSCSums } from "src/app/domain/funding-for-eosc";
import { CategorizedAreaData, Series } from "src/app/domain/categorizedAreaData";
import { zip } from "rxjs/internal/observable/zip";
import * as UIkit from 'uikit';
import { HighchartsColorAxisMapComponent } from "../../../../shared/charts/color-axis-map/highcharts-color-axis-map.component";
import { HighchartsBarComponent } from "../../../../shared/charts/bar-chart/highcharts-bar.component";
import { HighchartsCategoryMapComponent } from "../../../../shared/charts/category-map/highcharts-category-map.component";
import { CountriesTableComponent } from "../../../archive/countries-table.component";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-investments-2021',
    templateUrl: 'investments-2021.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HighchartsColorAxisMapComponent, HighchartsBarComponent, HighchartsCategoryMapComponent, CountriesTableComponent]
})

export class Investments2021Component implements OnInit {

  questionsDataArray = signal<any[]>([]);
  questionsDataArrayForBarChart = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  tableAbsoluteDataArray = signal<CountryTableData[][]>([]);
  countriesArray: string[] = [];
  mapSubtitles = signal<string[]>([]);
  mapSubtitlesArray: string[][] = mapSubtitles;
  fundingForEOSCSums = signal<FundingForEOSCSums>(undefined);

  private dataService = inject(DataService);
  private dataHandlerService = inject(DataHandlerService);
  private route = inject(ActivatedRoute);
  private stakeholdersService = inject(StakeholdersService);

  ngOnInit() {
    this.route.queryParams.subscribe(
      queryParams => {
        if (queryParams['chart'])
          UIkit.switcher('#investments-tabs').show(queryParams['chart']);
        else
          UIkit.switcher('#investments-tabs').show(0);
      }
    );

    zip(
      this.dataService.getQuestion6(),
      this.dataService.getQuestion7(),
      this.dataService.getQuestion8(),
      this.dataService.getQuestion9(),
      this.dataService.getQuestion10(),
      this.dataService.getQuestion11(),
      this.dataService.getQuestion12(),
      this.dataService.getQuestion13(),
      this.stakeholdersService.getEOSCSBCountries()).subscribe(
      rawData => {
        this.countriesArray = rawData[8];
        setAt(this.questionsDataArray, 4, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[0]));
        setAt(this.questionsDataArrayForBarChart, 4, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[0]));
        setAt(this.questionsDataArray, 5, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[1]));
        setAt(this.questionsDataArrayForBarChart, 5, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[1]));
        setAt(this.questionsDataArray, 6, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[2]));
        setAt(this.questionsDataArrayForBarChart, 6, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[2]));
        setAt(this.tableAbsoluteDataArray, 7, this.dataHandlerService.convertRawDataToTableData(rawData[3]));
        this.createMapDataset(0, 7);
        setAt(this.tableAbsoluteDataArray, 8, this.dataHandlerService.convertRawDataToTableData(rawData[4]));
        this.createMapDataset(0, 8);
        setAt(this.questionsDataArray, 9, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[5]));
        setAt(this.questionsDataArrayForBarChart, 9, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[5]));
        setAt(this.questionsDataArray, 10, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[6]));
        setAt(this.questionsDataArrayForBarChart, 10, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[6]));
        setAt(this.questionsDataArray, 11, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[7]));
        setAt(this.questionsDataArrayForBarChart, 11, this.dataHandlerService.covertRawDataToColorAxisMap(rawData[7]));

      },
      error => {
        console.error(error);
      }
    );

    this.dataService.getFundingForEOSC().subscribe(
     rawData => {
        this.fundingForEOSCSums.set(this.dataHandlerService.convertRawDataToFundingForEOSCSumsCustom(rawData));
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

}
