import { Injectable } from '@angular/core';
import {RawData, Row} from '../../../survey-tool/app/domain/raw-data';
import { CountryTableData } from '../../../survey-tool/app/domain/country-table-data';
import {CategorizedAreaData, Series} from "../../../survey-tool/app/domain/categorizedAreaData";
import {FundingForEOSCSums} from "../../../survey-tool/app/domain/funding-for-eosc";
import {identity, isNumeric} from "rxjs/internal-compatibility";
import {SeriesMapbubbleDataOptions, SeriesMapbubbleOptions} from "highcharts";
import {SeriesMapDataOptions} from "highcharts/highmaps";

@Injectable ()
export class DataHandlerService {

  public convertRawDataToTableData(rawData: RawData) {

    const tableData: CountryTableData[] = [];

    for (const series of rawData.datasets) {

      for (const rowResult of series.series.result) {
        // console.log(rowResult);

        const countryTableData: CountryTableData = new CountryTableData();
        if (series.series.query.name === 'eosc.sb.2021.Question17') {
          countryTableData.hasAppointedMandatedOrganization = rowResult.row[1];
        }
        // if (series.series.query.name === 'eosc.sb.2021.Question3' || series.series.query.name === 'eosc.sb.2021.Question4'
        //   || series.series.query.name === 'eosc.sb.2021.Question9' || series.series.query.name === 'eosc.sb.2021.Question10'
        //   || series.series.query.name === 'eosc.sb.2021.Question14' || series.series.query.name === 'eosc.sb.2021.Question15'
        //   || series.series.query.name === 'eosc.sb.2021.Question16' || series.series.query.name === 'eosc.sb.2021.Question18'
        //   || series.series.query.name === 'eosc.sb.2021.Question19' || series.series.query.name === 'eosc.sb.2021.Question20') {
        if (series.series.query.name !== 'eosc.sb.2021.Question17') {
          countryTableData.EOSCRelevantPoliciesInPlace = rowResult.row.slice(3);
        }
        if (series.series.query.name === 'eosc.sb.2021.Question20') {
          countryTableData.mapPointData = Array(3).fill(null).concat(rowResult.row.slice(3, 11).concat(rowResult.row.slice(12)));
        }

        countryTableData.dedicatedFinancialContributionsToEOSCLinkedToPolicies = rowResult.row[1];

        countryTableData.name = rowResult.row[0];
        countryTableData.code = rowResult.row[0];
        tableData.push(countryTableData);
      }
    }

    return tableData;
  }

  public convertRawDataToMapPoint(rawData: RawData) {
    const tableData: CountryTableData[] = [];

    for (const series of rawData.datasets) {

      for (const rowResult of series.series.result) {

        const countryTableData: CountryTableData = new CountryTableData();
        if (series.series.query.name === 'eosc.sb.2021.Question5') {
          if (rowResult.row[1] === 'Yes')
            countryTableData.mapPointData.push(rowResult.row[1]);
          else
            continue;
        }
        if (series.series.query.name === 'eosc.sb.2021.Question14') {
          if (rowResult.row[1] === 'true')
            countryTableData.mapPointData.push(rowResult.row[1]);
          else
            continue;
        }
        if (series.series.query.name === 'eosc.sb.2021.Question16') {
          if (rowResult.row[2] === 'true')
            countryTableData.mapPointData.push(rowResult.row[2]);
          else
            continue;
        }
        countryTableData.name = rowResult.row[0];
        countryTableData.code = rowResult.row[0];
        tableData.push(countryTableData);
      }
    }
    return tableData;
  }

  public convertRawDataToCategorizedAreasData(rawData: RawData) {

    const mapData: CategorizedAreaData = new CategorizedAreaData();
    let mapSeries: Series[] = [];
    // mapSeries.push(new Series('In'));
    for (const series of rawData.datasets) {
      for (const rowResult of series.series.result) {
        // console.log(rowResult);
        if (rowResult.row[1] === null || rowResult.row[1] === 'null') {
          let found = false;
          for (const series of mapSeries) {
            if (series.name === 'Awaiting data') {
              found = true;
              series.data.push(rowResult.row[0]);
            }
          }
          if (!found) {
            mapSeries.push(new Series('Awaiting data', false));
            mapSeries[mapSeries.length-1].data.push(rowResult.row[0]);
          }
        } else {
          let found = false;
          for (const series of mapSeries) {
            if (series.name === rowResult.row[1]) {
              found = true;
              series.data.push(rowResult.row[0]);
            }
          }
          if (!found) {
            mapSeries.push(new Series(rowResult.row[1], false));
            mapSeries[mapSeries.length-1].data.push(rowResult.row[0]);
          }
        }

      }
      mapData.series = mapSeries;
    }

    // sort descending Yes, No
    mapData.series.sort((a,b) => (a.name > b.name) ? -1 : ((b.name > a.name) ? 1 : 0));

    return mapData
  }

  public covertRawDataToColorAxisMap(rawData: RawData) {
    let tmpDataArray: (number | SeriesMapDataOptions | [string, number])[] = [];
    for (const data of rawData?.datasets[0].series.result) {
      if (isNumeric(data.row[1]))
        tmpDataArray.push([data.row[0].toLowerCase(), parseFloat(data.row[1])])
    }
    // console.log(tmpDataArray);
    return tmpDataArray;
  }

  public convertRawDataForActivityGauge(rawData: RawData) {
    if (!rawData)
      return 0;
    let count: number = 0;
    for (const series of rawData?.datasets) {

      for (const rowResult of series?.series.result) {
        if (rowResult.row[1] === 'Yes' || (isNumeric(rowResult.row[1]) && parseFloat(rowResult.row[1]) > 0)) {
          count++;
        }
      }

    }
    return count;
  }

  public convertRawDataForCumulativeTable(rawData: RawData, countries: string[], mergedArray?: string[]) {
    let tmpArr: string[] = [];
    if (!rawData)
      return tmpArr;
    let found: boolean = false;
    for (const series of rawData?.datasets) {
      for (const country of countries) {
        found = false;
        for (const rowResult of series.series.result) {
          if (rowResult.row[0] === country) {
            if (rowResult.row[1] === 'Yes') {
              tmpArr.push('true');
              found = true;
            } else if (isNumeric(rowResult.row[1])) {
              tmpArr.push(rowResult.row[1]);
              found = true;
            }
            break;
          }
        }
        if (!found)
          tmpArr.push('-');
      }
    }
    if (mergedArray) {
      for (let i = 0; i < mergedArray.length; i++) {
        if (isNumeric(mergedArray[i]) && isNumeric(tmpArr[i])) {
          tmpArr[i] = (+mergedArray[i] + +tmpArr[i]).toString();
        } else if (isNumeric(mergedArray[i])) {
          tmpArr[i] = mergedArray[i];
        } else if (isNumeric(tmpArr[i])) {
          tmpArr[i] = tmpArr[i];
        } else if (mergedArray[i] !== 'true' || tmpArr[i] !== 'true') {
          tmpArr[i] = '-';
        }
      }
    }
    return tmpArr;
  }

  public covertRawDataGetText(rawData: RawData) {
    let tmpDataArray = new Map<string, string>();
    for (const data of rawData.datasets[0].series.result) {
      if (data.row[1] === null || data.row[1] === '' || data.row[1] === 'null')
        continue;
      tmpDataArray.set(data.row[0].toLowerCase(), data.row[1]);
    }
    return tmpDataArray;
  }

  public convertRawDataToFundingForEOSCSums(rawData: RawData) {

    let fundingForEOSCSums: FundingForEOSCSums = new FundingForEOSCSums();

    for (const series of rawData.datasets) {

      if (series.series.query.name.includes('eosc.sb.2021.Question6.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.totalFundingForEOSC = rowResult.row[0];
        }

      } else if (series.series.query.name.includes('eosc.sb.2021.Question7.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.fundingToOrganisationsInEOSCA = rowResult.row[0];
        }

      } else if (series.series.query.name.includes('eosc.sb.2021.Question8.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.fundingToOrganisationsOutsideEOSCA = rowResult.row[0];
        }
      }

    }

    return fundingForEOSCSums;
  }

  public convertRawDataToFundingForEOSCSumsCustom(rawData: RawData) {
    let fundingForEOSCSums: FundingForEOSCSums = new FundingForEOSCSums();
    for (const series of rawData.datasets) {
      if (series.series.query.name.includes('eosc.sb.2021.Question6')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.totalFundingForEOSC = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();

      } else if (series.series.query.name.includes('eosc.sb.2021.Question7')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.fundingToOrganisationsInEOSCA = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();

      } else if (series.series.query.name.includes('eosc.sb.2021.Question8')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.fundingToOrganisationsOutsideEOSCA = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
      } else if (series.series.query.name.includes('eosc.sb.2021.Question11')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.earmarkedContributions = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
      } else if (series.series.query.name.includes('eosc.sb.2021.Question12')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.nonEarmarkedContributions = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
      } else if (series.series.query.name.includes('eosc.sb.2021.Question13')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.structuralInvestmentFunds = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
      }
    }
    return fundingForEOSCSums;
  }

  public convertRawDataToBubbleMapSeries(rawData: RawData) {
    let series = [];
    for (const dataset of rawData.datasets) {
      let dataOptions:SeriesMapbubbleDataOptions[] = [];
      for (const row of dataset.series.result) {
        if (isNumeric(row.row[1])) {
          let data: SeriesMapbubbleDataOptions = new class implements SeriesMapbubbleDataOptions {
            id: string;
            name: string;
            z: number | null;
          };
          data.id = row.row[0];
          data.name = row.row[0];
          data.z = +row.row[1];
          dataOptions.push(data);
        }
      }
      series.push(dataOptions);
    }
    // console.log(series);
    return series;
  }

  public convertRawDataToPercentageTableData(rawData: RawData, eoscSBCountries: string[]) {

    const mapTableData: Map<string, CountryTableData> = new Map();

    for (const series of rawData.datasets) {

      if (series.series.query.name.includes('oso.results.oa_percentage.affiliated.peer_reviewed.bycountry')) {
        for (const rowResult of series.series.result) {

          // remove unwanted countries
          if (!eoscSBCountries.includes(rowResult.row[4])) {
            continue;
          }

          if (mapTableData.has(rowResult.row[4])) {
            const countryTableData = mapTableData.get(rowResult.row[4]);
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsAffiliatedPeerReviewed = Number(rowResult.row[0]);
            }
          } else {
            const countryTableData: CountryTableData = new CountryTableData();
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsAffiliatedPeerReviewed = Number(rowResult.row[0]);
            }
            countryTableData.name = rowResult.row[3];
            countryTableData.code = rowResult.row[4];
            mapTableData.set(rowResult.row[4], countryTableData);
          }
        }
      } else if (series.series.query.name.includes('oso.results.oa_percentage.bycountry')) {
        for (const rowResult of series.series.result) {

          // remove unwanted countries
          if (!eoscSBCountries.includes(rowResult.row[4])) {
            continue;
          }

          if (mapTableData.has(rowResult.row[4])) {
            const countryTableData = mapTableData.get(rowResult.row[4]);
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsAffiliated = Number(rowResult.row[0]);
            }
          } else {
            const countryTableData: CountryTableData = new CountryTableData();
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsAffiliated = Number(rowResult.row[0]);
            }
            countryTableData.name = rowResult.row[3];
            countryTableData.code = rowResult.row[4];
            mapTableData.set(rowResult.row[4], countryTableData);
          }
        }
      } else if (series.series.query.name.includes('oso.results.oa_percentage.deposited.peer_reviewed.bycountry')) {
        for (const rowResult of series.series.result) {

          // remove unwanted countries
          if (!eoscSBCountries.includes(rowResult.row[4])) {
            continue;
          }

          if (mapTableData.has(rowResult.row[4])) {
            const countryTableData = mapTableData.get(rowResult.row[4]);
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsDepositedPeerReviewed = Number(rowResult.row[0]);
            }
          } else {
            const countryTableData: CountryTableData = new CountryTableData();
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsDepositedPeerReviewed = Number(rowResult.row[0]);
            }
            countryTableData.name = rowResult.row[3];
            countryTableData.code = rowResult.row[4];
            mapTableData.set(rowResult.row[4], countryTableData);
          }
        }
      } else if (series.series.query.name.includes('oso.results.oa_percentage.deposited.bycountry')) {
        for (const rowResult of series.series.result) {

          // remove unwanted countries
          if (!eoscSBCountries.includes(rowResult.row[4])) {
            continue;
          }

          if (mapTableData.has(rowResult.row[4])) {
            const countryTableData = mapTableData.get(rowResult.row[4]);
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsDeposited = Number(rowResult.row[0]);
            }
          } else {
            const countryTableData: CountryTableData = new CountryTableData();
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsDeposited = Number(rowResult.row[0]);
            }
            countryTableData.name = rowResult.row[3];
            countryTableData.code = rowResult.row[4];
            mapTableData.set(rowResult.row[4], countryTableData);
          }
        }
      }
    }

    const tableData: CountryTableData[] = [];

    mapTableData.forEach((value: CountryTableData, key: string) => {
      // console.log(key, value);
      tableData.push(value);
    });

    return tableData;
  }

}
