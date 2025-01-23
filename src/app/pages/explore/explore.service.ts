import { Injectable } from "@angular/core";
import { CategorizedAreaData, Series } from "../../../survey-tool/app/domain/categorizedAreaData";
import {
  ColorPallet, countriesNumbers,
  EoscReadiness2022MapSubtitles
} from "../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { latlong } from "../../../survey-tool/app/domain/countries-lat-lon";
import { CountryTableData } from "../../../survey-tool/app/domain/country-table-data";
import { RawData } from "../../../survey-tool/app/domain/raw-data";

@Injectable()
export class ExploreService {

  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;

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

  createMapDataFromCategorizationWithDots(tmpQuestionsData: CategorizedAreaData, countriesArray: string[], mapPointData: CountryTableData[], mapCount: number) {
    // this.mapSubtitles[index] = this.mapSubtitlesArray[mapCount][index];

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
