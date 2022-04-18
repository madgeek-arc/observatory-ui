import { Injectable } from '@angular/core';
import { RawData, Row } from '../domain/raw-data';
import { CountryTableData } from '../domain/country-table-data';

@Injectable ()
export class DataHandlerService {

  public convertRawDataToTableData(rawData: RawData) {

    const tableData: CountryTableData[] = [];

    for (const series of rawData.datasets) {

      for (const rowResult of series.series.result) {

        const countryTableData: CountryTableData = new CountryTableData();
        countryTableData.dedicatedFinancialContributionsToEOSCLinkedToPolicies = rowResult.row[1];
        countryTableData.name = rowResult.row[0];
        countryTableData.code = rowResult.row[0];
        tableData.push(countryTableData);
      }
    }

    // const tableData: CountryTableData[] = [];
    //
    // mapTableData.forEach((value: CountryTableData, key: string) => {
    //   // console.log(key, value);
    //   tableData.push(value);
    // });

    return tableData;
  }
}
