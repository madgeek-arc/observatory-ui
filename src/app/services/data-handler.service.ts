import { Injectable } from '@angular/core';
import { RawData } from '../domain/raw-data';
import { CountryTableData } from '../domain/country-table-data';
import {CategorizedAreaData, Series} from "../domain/categorizedAreaData";
import {FundingForEOSCSums} from "../domain/funding-for-eosc";

@Injectable ()
export class DataHandlerService {

  public convertRawDataToTableData(rawData: RawData) {

    const tableData: CountryTableData[] = [];

    for (const series of rawData.datasets) {

      for (const rowResult of series.series.result) {

        const countryTableData: CountryTableData = new CountryTableData();
        if (series.series.query.name === 'eosc.obs.question17') {
          countryTableData.hasAppointedMandatedOrganization = rowResult.row[1];
        } else if (series.series.query.name === 'eosc.obs.question3') {
          countryTableData.EOSCRelevantPoliciesInPlace = rowResult.row.slice(2);
        } else {
          countryTableData.dedicatedFinancialContributionsToEOSCLinkedToPolicies = rowResult.row[1];
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
        if (rowResult.row[1] === null || rowResult.row[1] === 'null') {
          let found = false;
          for (const series of mapSeries) {
            if (series.name === 'Awaiting data') {
              found = true;
              series.data.push(rowResult.row[0]);
            }
          }
          if (!found) {
            mapSeries.push(new Series('Awaiting data'));
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
            mapSeries.push(new Series(rowResult.row[1]));
            mapSeries[mapSeries.length-1].data.push(rowResult.row[0]);
          }
        }

      }
      mapData.series = mapSeries;
    }

    return mapData
  }

  public convertRawDataToFundingForEOSCSums(rawData: RawData) {

    let fundingForEOSCSums: FundingForEOSCSums = new FundingForEOSCSums();

    for (const series of rawData.datasets) {

      if (series.series.query.name.includes('eosc.obs.question6.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.totalFundingForEOSC = rowResult.row[0];
        }

      } else if (series.series.query.name.includes('eosc.obs.question7.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.fundingToOrganisationsInEOSCA = rowResult.row[0];
        }

      } else if (series.series.query.name.includes('eosc.obs.question8.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.fundingToOrganisationsOutsideEOSCA = rowResult.row[0];
        }
      }

    }

    return fundingForEOSCSums;
  }

}