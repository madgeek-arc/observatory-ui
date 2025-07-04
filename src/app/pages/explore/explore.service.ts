import { Injectable } from "@angular/core";
import {
  ColorPallet, countriesNumbers, EoscReadiness2022MapSubtitles
} from "../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { latlong } from "../../domain/countries-lat-lon";
import { CountryTableData } from "../../domain/country-table-data";
import { RawData, Row } from "../../domain/raw-data";
import { EoscReadinessDataService } from "../services/eosc-readiness-data.service";
import { CategorizedAreaData, Series } from "../../domain/categorizedAreaData";
import { BehaviorSubject } from "rxjs";
import { SeriesBarOptions } from "highcharts";
import { countries } from "../../domain/countries";
import { DataHandlerService } from "../services/data-handler.service";
import * as Highcharts from "highcharts";
import { colors } from "../../domain/chart-color-palette";

@Injectable({providedIn: 'root'})
export class ExploreService {

  _lastUpdateDate: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;

  constructor(private eoscReadiness: EoscReadinessDataService, private dataHandlerService: DataHandlerService) {
    this.getLastUpdateDate();
  }

  get isMobileOrSmallScreen(): boolean {
    return window.innerWidth < 960;
  }

  getLastUpdateDate() {
    return this.eoscReadiness.getLastUpdateDate().subscribe({
      next: data => {
        this._lastUpdateDate.next(data.datasets[0].series.result[0].row[0]);
      },
      error: err => {
        console.error(err);
      }
    });
  }

  // Maps
  createMapDataFromCategorization(tmpQuestionsData: CategorizedAreaData, countriesArray: string[], mapCount: number) {
    let questionsData = new CategorizedAreaData();

    let position = 0;
    for (let i = 0; i < tmpQuestionsData.series.length; i++) {
      if (tmpQuestionsData.series[i].name === 'Awaiting data')
        continue;
      position = tmpQuestionsData.series[i].name === 'No'? 1 : 0;
      questionsData.series[i] = new Series(this.mapSubtitlesArray[mapCount][position], false);
      questionsData.series[i].data = tmpQuestionsData.series[i].data;
      questionsData.series[i].showInLegend = true;
      questionsData.series[i].color = colors[position];
    }
    let countryCodeArray = [];
    for (let i = 0; i < questionsData.series.length; i++) {
      for (const data of questionsData.series[i].data) {
        countryCodeArray.push(data.code)
      }
    }

    questionsData.series[questionsData.series.length] = new Series('Awaiting Data', false);
    questionsData.series[questionsData.series.length-1].showInLegend = true;
    questionsData.series[questionsData.series.length-1].color = ColorPallet[2];
    questionsData.series[questionsData.series.length-1].data = countriesArray.filter(code => !countryCodeArray.includes(code));
    questionsData.series[questionsData.series.length-1].data = questionsData.series[questionsData.series.length-1].data.map(code => ({ code }));

    return questionsData;
  }

  createCategorizedMapDataFromMergedResponse(tmpQuestionsData: RawData, countriesArray: string[]) {

    const countriesWithAnswer: string[] = [];
    const questionsData = new CategorizedAreaData();

    questionsData.series.push(new Series('Has mandatory national policy', true));
    questionsData.series[0].showInLegend = true;
    questionsData.series[0].color = colors[0];
    questionsData.series.push(new Series('Has national policy but not mandatory', false));
    questionsData.series[1].showInLegend = true;
    questionsData.series[1].color = colors[3];
    questionsData.series.push(new Series('Does not have national policy', false));
    questionsData.series[2].showInLegend = true;
    questionsData.series[2].color = colors[1];

    tmpQuestionsData.datasets[0].series.result.forEach(result => {
      if (result.row[1] === 'No') {
        questionsData.series[2].data.push({code: result.row[0]});
      } else if (result.row[1] === 'Yes') {
        if (result.row[2] === 'Yes') {
          questionsData.series[0].data.push({code: result.row[0]});
        } else if (result.row[2] === 'No') {
          questionsData.series[1].data.push({code: result.row[0]});
        }
      }

      countriesWithAnswer.push(result.row[0]);
    });

    questionsData.series[3] = new Series('Awaiting Data', false);
    questionsData.series[3].showInLegend = true;
    questionsData.series[3].color = ColorPallet[2];
    questionsData.series[3].data = countriesArray.filter(code => !countriesWithAnswer.includes(code));
    questionsData.series[3].data = questionsData.series[3].data.map(code => ({ code }));

    for (let i = questionsData.series.length-1; i >= 0; i--) {
      if (questionsData.series[i].data.length === 0)
        questionsData.series.splice(i, 1);
    }

    return questionsData;
  }

  createMapDataFromCategorizationWithDots(tmpQuestionsData: CategorizedAreaData, countriesArray: string[], mapPointData: CountryTableData[], mapCount: number) {
    // this.mapSubtitles[index] = this.mapSubtitlesArray[mapCount][index];
    console.log(tmpQuestionsData);
    let questionsData = new CategorizedAreaData();

    let position = 0;
    for (let i = 0; i < tmpQuestionsData.series.length; i++) {
      if (tmpQuestionsData.series[i].name === 'Awaiting data')
        continue;
      position = tmpQuestionsData.series[i].name === 'No'? 1 : 0;
      questionsData.series[i] = new Series(this.mapSubtitlesArray[mapCount][position], false);
      questionsData.series[i].data = tmpQuestionsData.series[i].data;
      questionsData.series[i].showInLegend = true;
      questionsData.series[i].color = ColorPallet[position];
    }
    let countryCodeArray = [];
    for (let i = 0; i < questionsData.series.length; i++) {
      for (const data of questionsData.series[i].data) {
        countryCodeArray.push(data.code)
      }
    }

    if (countryCodeArray.length > 0) {
      questionsData.series[questionsData.series.length] = new Series('Awaiting Data', false);
      questionsData.series[questionsData.series.length-1].showInLegend = true;
      questionsData.series[questionsData.series.length-1].color = ColorPallet[2];
      questionsData.series[questionsData.series.length-1].data = countriesArray.filter(code => !countryCodeArray.includes(code));
      questionsData.series[questionsData.series.length-1].data = questionsData.series[questionsData.series.length-1].data.map(code => ({ code }));
    }

    let mapPointArray1 = [];
    let mapPointArray2 = [];
    for (let i = 0; i < mapPointData.length; i++) {
      if (mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies === 'Yes') {
        mapPointArray1.push({name: mapPointData[i].code, lat: latlong.get(mapPointData[i].code).latitude, lon: latlong.get(mapPointData[i].code).longitude});
      } else if (mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies === 'No') {
        mapPointArray2.push({name: mapPointData[i].code, lat: latlong.get(mapPointData[i].code).latitude, lon: latlong.get(mapPointData[i].code).longitude});
      }
    }

    let pos: number;
    if (mapPointArray1.length > 0) {
      pos = questionsData.series.length;
      questionsData.series[pos] = new Series('National policy is mandatory', false, 'mappoint');
      questionsData.series[pos].data = mapPointArray1;
      questionsData.series[pos].color = '#7CFC00';
      questionsData.series[pos].marker.symbol = 'circle';
      questionsData.series[pos].showInLegend = true;
    }

    if (mapPointArray2.length > 0) {
      pos = questionsData.series.length;
      questionsData.series[pos] = new Series('National policy is not mandatory', false, 'mappoint');
      questionsData.series[pos].data = mapPointArray2;
      questionsData.series[pos].color = '#FFEF00';
      questionsData.series[pos].marker.symbol = 'diamond';
      questionsData.series[pos].showInLegend = true;
    }

    return questionsData;
  }

  createMapDataFromMergedData(data: string[][], dictionary: Record<string, string[]>,  countriesArray: string[], seriesName: string) {
    const countriesWithAnswer: string[] = [];
    const questionsData = new CategorizedAreaData();

    questionsData.series.push(new Series('Has national ' + seriesName, true));
    questionsData.series[0].showInLegend = true;
    questionsData.series[0].color = colors[0];
    questionsData.series.push(new Series('Does not have national ' + seriesName, false));
    questionsData.series[1].showInLegend = true;
    questionsData.series[1].color = colors[1];

    data.forEach(value => {
      if (value[1] === 'Yes') {
        questionsData.series[0].data.push({code: value[0]});
        questionsData.series[0].custom[value[0]] = dictionary[value[0]];
      } else if (value[1] === 'No') {
        questionsData.series[1].data.push({code: value[0]});
        questionsData.series[1].custom[value[0]] = dictionary[value[0]];
      }

      countriesWithAnswer.push(value[0]);
    });

    questionsData.series[2] = new Series('Awaiting Data', false);
    questionsData.series[2].showInLegend = true;
    questionsData.series[2].color = ColorPallet[2];
    questionsData.series[2].data = countriesArray.filter(code => !countriesWithAnswer.includes(code));
    questionsData.series[2].data = questionsData.series[2].data.map(code => ({ code }));

    for (let i = questionsData.series.length-1; i >= 0; i--) {
      if (questionsData.series[i].data.length === 0)
        questionsData.series.splice(i, 1);
    }

    return questionsData;
  }

  mergeCategorizedMapData(data: RawData[], areas: string[], countries: string[], seriesName: string) {
    let mergedData: string[][] = [];
    let record: Record<string, string[]> = {};

    for (let i = 0; i < data[0].datasets[0].series.result.length; i++) {
      let answerArray: string[] = [];
      let hasPositiveAnswer = false;
      for (let j = 0; j < data.length; j++) {
        if (data[j].datasets[0].series.result[i].row[1] === 'Yes')
          hasPositiveAnswer = true;

        answerArray.push(areas[j] + ': ' + data[j].datasets[0].series.result[i].row[1]);
      }
      mergedData.push([data[0].datasets[0].series.result[i].row[0], hasPositiveAnswer ? 'Yes' : 'No']);

      record[data[0].datasets[0].series.result[i].row[0]] = answerArray;
    }
    // console.log(record);
    // console.log(mergedData);

    return this.createMapDataFromMergedData(mergedData, record, countries, seriesName);
  }

  // Bar charts
  createInvestmentsBar(data: RawData) {
    let series: SeriesBarOptions[] = [
      {type: 'bar', name: '< 1 M', data: []},
      {type: 'bar', name: '1-5 M', data: []},
      {type: 'bar', name: '5-10 M', data: []},
      {type: 'bar', name: '10-20M', data: []},
      {type: 'bar', name: '> 20 M', data: []}
    ];

    let index = -1;
    data.datasets[0].series.result.forEach((element: Row) => {

      if (!this.isNumeric(element.row[1]))
        return;

      if (+element.row[1] === 0)
        return;

      if (+element.row[1] < 1) {
        index = series.findIndex(elem => elem.name === '< 1 M');
        series[index].data.push(element.row[0]);

      } else if (+element.row[1] < 5) {
        index = series.findIndex(elem => elem.name === '1-5 M');
        series[index].data.push(element.row[0]);

      } else if (+element.row[1] < 10) {
        index = series.findIndex(elem => elem.name === '5-10 M');
        series[index].data.push(element.row[0]);

      } else if (+element.row[1] < 20) {
        index = series.findIndex(elem => elem.name === '10-20M');
        series[index].data.push(element.row[0]);

      } else if (+element.row[1] >= 20) {
        index = series.findIndex(elem => elem.name === '> 20 M');
        series[index].data.push(element.row[0]);

      }
    });

    series = series.filter(elem => elem.data.length !== 0);

    series.forEach(series => {
      series.data.forEach((element: string, index: number) => {
        series.data[index] = this.findCountryName(element).name;
      });

      let countryCount = series.data.length
      series.custom = series.data;
      series.data = [countryCount];
    });

    return series;
  }

  createColumnChartSeries(data: RawData[], year: string) {
    let series: Highcharts.SeriesColumnOptions = {
      type: 'column',
      name: 'Year '+ (+year-1),
      data: []
    }

    data.forEach(el => {
      let count = 0;
      el.datasets[0].series.result.forEach(item => {
        if (item.row[1] === 'Yes')
          count++;
      });
      series.data.push(Math.round(((count/el.datasets[0].series.result.length + Number.EPSILON) * 100)));
    });
    return series;
  }

  // Stacked columns
  createStackedColumnSeries(data: RawData[], series: Highcharts.SeriesColumnOptions[]) {
    let orgCount = 0;
    let orgCountWithPolicy = 0;
    data[0].datasets[0].series.result.forEach((result) => {
      if (this.isNumeric(result.row[1]))
        orgCount += +result.row[1];
    });

    data[1].datasets[0].series.result.forEach((result) => {
      if (this.isNumeric(result.row[1]))
        orgCountWithPolicy += +result.row[1];
    });

    // series[0].data.push(Math.round(((orgCountWithPolicy/orgCount) + Number.EPSILON) * 100));
    series[0].data.push(orgCountWithPolicy);
    // series[1].data.push(Math.round((((orgCount-orgCountWithPolicy)/orgCount) + Number.EPSILON) * 100));
    series[1].data.push(orgCount-orgCountWithPolicy);
  }

  // Tree graph data
  createRanges(data: RawData) {
    const arr = [
      {id: '0.0', parent: '', name: 'Country investments'},
      {id: '1.1', parent: '0.0', name: '< 1 M'},
      {id: '1.2', parent: '0.0', name: '1-5 M'},
      {id: '1.3', parent: '0.0', name: '5-10 M'},
      {id: '1.4', parent: '0.0', name: '10-20M'},
      {id: '1.5', parent: '0.0', name: '> 20 M'}
    ];

    let count = 0;

    data.datasets[0].series.result.forEach((element: any) => {

      if (!this.isNumeric(element.row[1]))
        return;

      if (+element.row[1] === 0)
        return;

      count++;
      let countryName = this.findCountryName(element.row[0]).name;

      let item = {
        id: '2.' + count,
        parent: '1.',
        name: countryName,
        y: +element.row[1]
      }

      if (+element.row[1] < 1) {
        item.parent = '1.1';
      } else if (+element.row[1] < 5) {
        item.parent = '1.2';
      } else if (+element.row[1] < 10) {
        item.parent = '1.3';
      } else if (+element.row[1] < 20) {
        item.parent = '1.4';
      } else if (+element.row[1] >= 20) {
        item.parent = '1.5';
      }

      arr.push(item);

    });

    // console.log(arr);
    return this.trimNodes(arr);
  }

  trimNodes(data: any[]): any[] {
    // const parentIds = new Set(data.map(item => item.parent).filter(p => p));
    const leafIds = new Set(data.filter(d => d.y != null).map(d => d.parent));
    return data.filter(item =>
      item.parent === "" ||         // keep root
      item.y != null ||             // keep leaf nodes
      leafIds.has(item.id)          // keep parents that actually have children
    );
  }


  // Tables
  createTable(value: RawData[], countriesEOSC: string[]) {
    let tableData: string[][] = [];

    tableData[1] = this.dataHandlerService.convertRawDataForCumulativeTable(value[0], countriesEOSC);
    tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(value[1], countriesEOSC);
    tableData[3] = this.dataHandlerService.convertRawDataForCumulativeTable(value[2], countriesEOSC);
    tableData[4] = this.dataHandlerService.convertRawDataForCumulativeTable(value[3], countriesEOSC);
    tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(value[4], countriesEOSC);
    tableData[6] = this.dataHandlerService.convertRawDataForCumulativeTable(value[5], countriesEOSC);
    tableData[7] = this.dataHandlerService.convertRawDataForCumulativeTable(value[6], countriesEOSC);
    tableData[8] = this.dataHandlerService.convertRawDataForCumulativeTable(value[7], countriesEOSC);
    tableData[9] = this.dataHandlerService.convertRawDataForCumulativeTable(value[8], countriesEOSC);
    tableData[10] = this.dataHandlerService.convertRawDataForCumulativeTable(value[9], countriesEOSC);
    tableData[11] = this.dataHandlerService.convertRawDataForCumulativeTable(value[10], countriesEOSC);
    tableData[12] = this.dataHandlerService.convertRawDataForCumulativeTable(value[11], countriesEOSC);

    tableData[0] = countriesEOSC;
    // Transpose 2d array
    tableData = tableData[0].map((_, colIndex) => tableData.map(row => row[colIndex]));

    for (let i = 0; i < tableData.length; i++) {
      let tmpData = countries.find(country => country.id === tableData[i][0]);
      if (tmpData)
        tableData[i][0] = tmpData.name + ` (${tmpData.id})`;
    }
    // console.log(tableData);

    return tableData;
  }

  // Utilities
  isNumeric(value: string | null): boolean {
    // Check if the value is empty
    if (value === undefined || value === null || value.trim() === '')
      return false;

    // Attempt to parse the value as a float
    const number = parseFloat(value);

    // Check if parsing resulted in NaN or the value has extraneous characters
    return !Number.isNaN(number) && Number.isFinite(number) && String(number) === value;
  }

  calculateSum(rawData: RawData): string {
    let sum = 0.0;
    for (const series of rawData.datasets) {
      for (const rowResult of series.series.result) {
        if (this.isNumeric(rowResult.row[1])) {
          sum += +rowResult.row[1];
        }
      }
    }

    return (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
  }

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id === code
    );
  }
}
