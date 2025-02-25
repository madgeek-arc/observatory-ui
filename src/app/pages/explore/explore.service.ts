import { Injectable } from "@angular/core";
import { CategorizedAreaData, Series } from "../../../survey-tool/app/domain/categorizedAreaData";
import {
  ColorPallet, countriesNumbers,
  EoscReadiness2022MapSubtitles
} from "../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { latlong } from "../../../survey-tool/app/domain/countries-lat-lon";
import { CountryTableData } from "../../../survey-tool/app/domain/country-table-data";
import { RawData, Row } from "../../../survey-tool/app/domain/raw-data";
import { SeriesBarOptions } from "highcharts";
import { EoscReadinessDataService } from "../services/eosc-readiness-data.service";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ExploreService {

  _lastUpdateDate: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;

  constructor(private eoscReadiness: EoscReadinessDataService) {
    this.getLastUpdateDate();
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
      questionsData.series[i].color = ColorPallet[position];
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
    questionsData.series[0].color = ColorPallet[0];
    questionsData.series.push(new Series('Has national policy but not mandatory', false));
    questionsData.series[1].showInLegend = true;
    questionsData.series[1].color = ColorPallet[3];
    questionsData.series.push(new Series('Does not have national policy', false));
    questionsData.series[2].showInLegend = true;
    questionsData.series[2].color = ColorPallet[1];

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

  mergeMonitoringData(data: RawData[], areas: string[]) {
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
    console.log(record);
    console.log(mergedData);
  }

  createInvestmentBar(data: RawData) {
    let series: SeriesBarOptions[] = [];

    let index = -1;
    data.datasets[0].series.result.forEach((element: Row) => {

      if (!this.isNumeric(element.row[1]))
        return;

      if (+element.row[1] === 0)
        return;

      if (+element.row[1] < 1) {
        index = series.findIndex(elem => elem.name === '< 1 M');
        if (index < 0)
          series.push({type: 'bar', name: '< 1 M', data: [element.row[0]]});
        else
          series[index].data.push(element.row[0]);

      } else if (+element.row[1] < 5) {
        index = series.findIndex(elem => elem.name === '1-5 M');
        if (index < 0)
          series.push({type: 'bar', name: '1-5 M', data: [element.row[0]]});
        else
          series[index].data.push(element.row[0]);

      } else if (+element.row[1] < 10) {
        index = series.findIndex(elem => elem.name === '5-10 M');
        if (index < 0)
          series.push({type: 'bar', name: '5-10 M', data: [element.row[0]]});
        else
          series[index].data.push(element.row[0]);

      } else if (+element.row[1] < 20) {
        index = series.findIndex(elem => elem.name === '10-20M');
        if (index < 0)
          series.push({type: 'bar', name: '10-20M', data: [element.row[0]]});
        else
          series[index].data.push(element.row[0]);

      } else if (+element.row[1] >= 20) {
        index = series.findIndex(elem => elem.name === '> 20 M');
        if (index < 0)
          series.push({type: 'bar', name: '> 20 M', data: [element.row[0]]});
        else
          series[index].data.push(element.row[0]);

      }
    });

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

  // Tree graph data
  createRanges(data: RawData) {
    const arr = [{id: '0.0', parent: '', name: 'Country investments'}];

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
        if (arr.findIndex(elem => elem.id === '1.1') < 0)
          arr.push({id: '1.1', parent: '0.0', name: '< 1 M'});

        item.parent = '1.1';
      } else if (+element.row[1] < 5) {
        if (arr.findIndex(elem => elem.id === '1.2') < 0)
          arr.push({id: '1.2', parent: '0.0', name: '1-5 M'});

        item.parent = '1.2';
      } else if (+element.row[1] < 10) {
        if (arr.findIndex(elem => elem.id === '1.3') < 0)
          arr.push({id: '1.3', parent: '0.0', name: '5-10 M'});

        item.parent = '1.3';
      } else if (+element.row[1] < 20) {
        if (arr.findIndex(elem => elem.id === '1.4') < 0)
          arr.push({id: '1.4', parent: '0.0', name: '10-20M'});

        item.parent = '1.4';
      } else if (+element.row[1] >= 20) {
        if (arr.findIndex(elem => elem.id === '1.5') < 0)
          arr.push(
            {id: '1.5', parent: '0.0', name: '> 20 M'});

        item.parent = '1.5';
      }

      arr.push(item);

    });

    // console.log(arr);
    return arr;
  }

  // Utilities
  isNumeric(value: string | null): boolean {
    // Check if the value is empty
    if (value === null)
      return false;

    if (value.trim() === '') {
      return false;
    }

    // Attempt to parse the value as a float
    const number = parseFloat(value);

    // Check if parsing resulted in NaN or the value has extraneous characters
    return !isNaN(number) && isFinite(number) && String(number) === value;
  }

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id === code
    );
  }
}
