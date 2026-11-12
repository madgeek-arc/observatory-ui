import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CountryTableData } from "src/app/domain/country-table-data";
import { countriesNumbers, EoscReadinessMapSubtitles } from "../eosc-readiness-map-subtitles";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { StakeholdersService } from "src/survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../services/data-handler.service";
import { RawData } from "src/app/domain/raw-data";
import { isNumeric } from "src/app/shared/utils/is-numeric";
import { zip } from "rxjs/internal/observable/zip";
import { ColorAxisOptions, LegendOptions } from "highcharts";
import * as Highcharts from "highcharts";
import * as UIkit from 'uikit';
import { HighchartsColorAxisMapComponent } from "../../../../shared/charts/color-axis-map/highcharts-color-axis-map.component";
import { HighchartsBarComponent } from "../../../../shared/charts/bar-chart/highcharts-bar.component";
import { HighchartsColumnRangesComponent } from "../../../../shared/charts/column-ranges-chart/highcharts-column-ranges.component";
import { PieChartComponent } from "../../../../shared/charts/pie-chart/pie-chart.component";
import { DecimalPipe } from "@angular/common";
import { setAt } from "src/app/shared/utils/set-at";

@Component({
    selector: 'app-general',
    templateUrl: 'general.component.html',
    styleUrls: ['../../eosc-readiness-dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HighchartsColorAxisMapComponent, HighchartsBarComponent, HighchartsColumnRangesComponent, PieChartComponent, DecimalPipe]
})

export class GeneralComponent implements OnInit {

  type = signal<string>(null);
  year = signal<string>(null);
  fragment: string = null;

  countriesArray = signal<string[]>([]);
  toolTipData = signal<Map<string, string>[]>([]);
  tableAbsoluteDataArray: CountryTableData[][] = [];
  legend: LegendOptions;
  colorAxis: ColorAxisOptions;
  pieSeries = signal<{name: string, type: string, data: (string | number)[][]}[]>(undefined);
  columnSeries = signal<{name: string, type: string, data: (string | number)[][]}[]>(undefined);
  mapSubtitles: string[] = [];
  mapSubtitlesArray: string[][] = EoscReadinessMapSubtitles;
  questionsDataArray = signal<any[]>([]);
  tmpQuestionsDataArray: any[] = [];
  questionsDataArrayForBarChart = signal<any[]>([]);
  sumsArray = signal<string[]>([]);

  private route = inject(ActivatedRoute);
  private queryData = inject(EoscReadinessDataService);
  private stakeholdersService = inject(StakeholdersService);
  private dataHandlerService = inject(DataHandlerService);

  ngOnInit() {
    this.route.parent.paramMap.subscribe({
      next: value => {
        if (this.year() && this.year() !== value.get('year')) {
          if (this.type()) {
            this.initCharts(this.type());
          }
        }
        this.year.set(value.get('year'));
      }
    });

    this.route.params.subscribe(
      params => {
        this.type.set(params['type']);
        this.initCharts(this.type());
      }
    );

  }

  initCharts(type: string) {
    switch (type) {
      case 'researchers':
        this.getResearchersData();
        break;
      case 'RPOs':
        this.getRPOsData();
        break;
      case 'RFOs':
        this.getRFOsData();
        break;
      case 'repositories':
        this.getRepositoriesData();
        break;
      case 'investments':
        this.getInvestmentsData(8);
        break;
    }
  }

  getResearchersData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion(this.year(), 'Question1'),
      this.queryData.getQuestionComment(this.year(), 'Question1'),
    ).subscribe(
      res => {
        // this.countriesArray = res[0];
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 0, mapData);
        setAt(this.questionsDataArrayForBarChart, 0, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[0].forEach((data: string[]) => {tempArr.push(data[0]);});
        setAt(this.toolTipData, 0, this.dataHandlerService.covertRawDataGetText(res[2]));
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.sumsArray, 0, this.calculateSum(res[1]));
      }
    );
  }

  getRPOsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion2(),
      // this.queryData.getQuestion2comment(),
      this.queryData.getQuestion(this.year(), 'Question2'),
      this.queryData.getQuestionComment(this.year(), 'Question2'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 1, mapData);
        setAt(this.questionsDataArrayForBarChart, 1, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[1].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.toolTipData, 1, this.dataHandlerService.covertRawDataGetText(res[2]));
        setAt(this.sumsArray, 1, this.calculateSum(res[1]));
      }
    );
  }

  getRFOsData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion3(),
      // this.queryData.getQuestion3comment(),
      this.queryData.getQuestion(this.year(), 'Question3'),
      this.queryData.getQuestionComment(this.year(), 'Question3'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 2, mapData);
        setAt(this.questionsDataArrayForBarChart, 2, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[2].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.toolTipData, 2, this.dataHandlerService.covertRawDataGetText(res[2]));
        setAt(this.sumsArray, 2, this.calculateSum(res[1]));
      }
    );
  }

  getRepositoriesData() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion4(),
      // this.queryData.getQuestion4comment(),
      this.queryData.getQuestion(this.year(), 'Question4'),
      this.queryData.getQuestionComment(this.year(), 'Question4'),
    ).subscribe(
      res => {
        const mapData = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        setAt(this.questionsDataArray, 3, mapData);
        setAt(this.questionsDataArrayForBarChart, 3, mapData);
        let tempArr: string[] = [];
        this.questionsDataArray()[3].forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.toolTipData, 3, this.dataHandlerService.covertRawDataGetText(res[2]));
        setAt(this.sumsArray, 3, this.calculateSum(res[1]));
      }
    );
  }

  getInvestmentsData(pos: number) {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion5(),
      // this.queryData.getQuestion5comment(),
      this.queryData.getQuestion(this.year(), 'Question5'),
      this.queryData.getQuestionComment(this.year(), 'Question5'),
    ).subscribe(
      res => {
        const mapData: any[] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        this.getInvestmentsDataPie(mapData);
        // sorts mapData in place, so it runs before the chart receives the array
        this.createStackedColumnSeries(mapData);
        setAt(this.questionsDataArray, pos, mapData);
        // let tempArr: string[] = [];
        // this.questionsDataArray[pos].forEach((data: string[]) => {tempArr.push(data[0]);});
        // this.countriesArray = res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element));
        // this.toolTipData[pos] = this.dataHandlerService.covertRawDataGetText(res[2]);
        setAt(this.sumsArray, pos, this.calculateSum(res[1]));
      }
    );
  }

  getInvestmentsDataPercentage(pos: number, param: string) {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      // this.queryData.getQuestion5(),
      // this.queryData.getQuestion5comment(),
      this.queryData.getQuestion(this.year(), 'Question5'),
      this.queryData.getQuestionComment(this.year(), 'Question5'),
    ).subscribe(
      res => {
        const mapData: any[] = this.dataHandlerService.covertRawDataToColorAxisMap(res[1]);
        for (let i = 0; i < mapData.length; i++) {
          let country = countriesNumbers.find(
            elem=> elem.id.toLowerCase() === mapData[i][0]
          );
          if (country?.[param]) {
            mapData[i][1] = this.round(mapData[i][1] / country[param] * 1000, 4);
          } else {
            mapData.splice(i, 1);
            i--;
          }
        }
        setAt(this.questionsDataArray, pos, mapData);
        setAt(this.questionsDataArrayForBarChart, pos, mapData);
        let tempArr: string[] = [];
        mapData.forEach((data: string[]) => {tempArr.push(data[0]);});
        this.countriesArray.set(res[0].map(element => {return element.toLowerCase()}).filter(element => !tempArr.includes(element)));
        setAt(this.toolTipData, pos, this.dataHandlerService.covertRawDataGetText(res[2]));
        // this.sumsArray[pos] = this.calculateSum(res[1]);
      }
    );
  }

  getInvestmentsDataPie(arr: number[]) {
      const pieSeries = [{
          name: 'No of countries',
          type: 'pie',
          data: [
              [' < 1 M', 0],
              ['1 - 5 M', 0],
              ['5-10 M', 0],
              ['10 - 20 M', 0],
              [' > 20 M', 0]
          ]
      }];
      for (let i = 0; i < arr.length; i++) {
          if (arr[i][1] < 1) {
              (<number>pieSeries[0].data[0][1])++;
          } else if (arr[i][1] < 5) {
              (<number>pieSeries[0].data[1][1])++;
          } else if (arr[i][1] < 10) {
              (<number>pieSeries[0].data[2][1])++;
          } else if (arr[i][1] < 20) {
              (<number>pieSeries[0].data[3][1])++;
          } else if (arr[i][1] >= 20) {
              (<number>pieSeries[0].data[4][1])++;
          }
      }
      this.pieSeries.set(pieSeries);
      // console.log(this.series[0]);
  }

  createStackedColumnSeries(arr: any[]) {
    arr.sort((a, b) => { return a[1] - b[1]; });
    const columnSeries: {name: string, type: string, data: (string | number)[][]}[] = [];
    let serie: {name: string, type: string, data: (string | number)[][]};
    for (let i = 0; i < arr.length; i++) {
      let country = this.findCountryName(arr[i][0]);
      if (arr[i][1] < 1) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [[' < 1 M', 1]]}
        columnSeries.push(serie);
      } else if (arr[i][1] < 5) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['1 - 5 M', 1]]}
        columnSeries.push(serie);
      } else if (arr[i][1] < 10) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['5 - 10 M', 1]]}
        columnSeries.push(serie);
      } else if (arr[i][1] < 20) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [['10 - 20 M', 1]]}
        columnSeries.push(serie);
      } else if (arr[i][1] >= 20) {
        serie = {name: country.name + ' ('+ country.id +')', type: 'column', data: [[' > 20 M', 1]]}
        columnSeries.push(serie);
      }
    }
    this.columnSeries.set(columnSeries);
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

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id.toLowerCase() === code
    );
  }

  activateSwitcher(fragment: string) {
    if (!UIkit.switcher('#investmentsContent')){
      setTimeout( ()=> {
        this.activateSwitcher(fragment);
      }, 100);
    } else {
      switch (fragment) {
        case 'absolute':
          if (!this.questionsDataArray()[4])
            this.getInvestmentsData(4);
          UIkit.switcher('#investmentsContent').show(0);
          break;
        case 'gdp':
          if (!this.questionsDataArray()[5])
            this.getInvestmentsDataPercentage(5, 'gdp');
          UIkit.switcher('#investmentsContent').show(1);
          break;
        case 'gerd':
          if (!this.questionsDataArray()[6])
            this.getInvestmentsDataPercentage(6, 'gerd');
          UIkit.switcher('#investmentsContent').show(2);
          break;
        case 'income':
          if (!this.questionsDataArray()[7])
            this.getInvestmentsDataPercentage(7, 'income');
          UIkit.switcher('#investmentsContent').show(3);
          break;
        case 'total':
          if (!this.questionsDataArray()[8])
            this.getInvestmentsData(8);
          this.colorAxis = {
            dataClasses: [
              {
                to: 1,
              }, {
                from: 1,
                to: 5,
              }, {
                from: 5,
                to: 10,
              }, {
                from: 10,
                to: 20,
              }, {
                from: 20
              }
            ],
            minColor: '#F1EEF6',
            maxColor: '#008792',
          }
          UIkit.switcher('#investmentsContent').show(0);
          break;
        case 'details':
          if (!this.questionsDataArray()[9])
            this.getInvestmentsData(9);
          this.legend = {
              title: {
                  text: 'Ranges in millions',
                  style: {
                      color: ( // theme
                          Highcharts.defaultOptions &&
                          Highcharts.defaultOptions.legend &&
                          Highcharts.defaultOptions.legend.title &&
                          Highcharts.defaultOptions.legend.title.style &&
                          Highcharts.defaultOptions.legend.title.style.color
                      ) || 'black'
                  }
              },
              align: 'left',
              verticalAlign: 'top',
              floating: true,
              layout: 'vertical',
              valueDecimals: 0,
              backgroundColor: ( // theme
                  Highcharts.defaultOptions &&
                  Highcharts.defaultOptions.legend &&
                  Highcharts.defaultOptions.legend.backgroundColor
              ) || 'rgba(255, 255, 255, 0.85)',
              symbolRadius: 0,
              symbolHeight: 14
          }
          this.colorAxis = {
            dataClasses: [
              {
                to: 1,
              }, {
                from: 1,
                to: 5,
              }, {
                from: 5,
                to: 10,
              }, {
                from: 10,
                to: 20,
              }, {
                from: 20
              }
            ],
            minColor: '#F1EEF6',
            maxColor: '#008792',
          }
          UIkit.switcher('#investmentsContent').show(1);
          break;
      }
    }
  }

  round(value: number, precision?: number) {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

}
