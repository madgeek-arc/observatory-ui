import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { SeriesBarOptions, SeriesOptionsType } from "highcharts";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { RawData } from "../../../../survey-tool/app/domain/raw-data";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { zip } from "rxjs";
import { DataHandlerService } from "../../services/data-handler.service";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { countries } from "../../../../survey-tool/app/domain/countries";

@Component({
  selector: 'app-national-monitoring',
  templateUrl: './national-monitoring.component.html',
  styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
})

export class NationalMonitoringComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  year = '2023';
  years = ['2022', '2023'];

  tableData: string[][] = [];

  barChartCategories = ['Open Access Publications', 'Fair Data', 'Data Management', 'Open Data', 'Open Software', 'Services', 'Connecting repositories to EOSC', 'Data stewardship', 'Long-term data preservation', 'Skills/Training', 'Incentives/Rewards for OS', 'Citizen Science'];

  barChartSeries: SeriesOptionsType[] = [];
  barChartTitles = {
    // title: 'Percentage of countries with national policies different Open Science Categories',
    title: '',
    xAxis: 'National Monitoring on',
    yAxis: 'Percentage of countries with National Monitoring',
  }

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService,
              private dataHandlerService: DataHandlerService) {}

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getBarChartData(year, index);
    });

    this.getTableData();
  }

  /** Bar charts ---------------------------------------------------------------------------------------------------> **/
  getBarChartData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question54'), // publications
      this.queryData.getQuestion(year, 'Question62'), // FAIR data
      this.queryData.getQuestion(year, 'Question58'), // Data management
      this.queryData.getQuestion(year, 'Question66'), // Open data
      this.queryData.getQuestion(year, 'Question70'), // Software
      this.queryData.getQuestion(year, 'Question74'), // Services
      this.queryData.getQuestion(year, 'Question78'), // Connecting repositories to EOSC
      this.queryData.getQuestion(year, 'Question82'), // Data stewardship
      this.queryData.getQuestion(year, 'Question86'), // Long-term data preservation
      this.queryData.getQuestion(year, 'Question90'), // Skills/training for Open Science
      this.queryData.getQuestion(year, 'Question94'), // Incentives/rewards for Open Science
      this.queryData.getQuestion(year, 'Question98'), // Citizen science
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.barChartSeries.push(this.createBarChartSeries(value, year));

        if (this.years.length === index+1) {
          this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: countries => {
              this.createTable(value, countries);
            },
            error: err => {console.error(err)}
          });

          this.barChartSeries = [...this.barChartSeries];
        }
      },
      error: err => {console.error(err)}
    });
  }

  createBarChartSeries(data: RawData[], year: string) {
    let series: SeriesBarOptions = {
      type: 'bar',
      name: 'Year '+ year,
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

  /** Create table ------------------------------------------------------------------------------------------------> **/
  getTableData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question6'),  // Publications
      this.queryData.getQuestion(this.year, 'Question10'), // Data-management
      this.queryData.getQuestion(this.year, 'Question14'), // FAIR-data
      this.queryData.getQuestion(this.year, 'Question18'), // Open-data
      this.queryData.getQuestion(this.year, 'Question22'), // Software
      this.queryData.getQuestion(this.year, 'Question26'), // Services
      this.queryData.getQuestion(this.year, 'Question30'), // Connecting repositories to EOSC
      this.queryData.getQuestion(this.year, 'Question34'), // Data stewardship
      this.queryData.getQuestion(this.year, 'Question38'), // Long-term data preservation
      this.queryData.getQuestion(this.year, 'Question42'), // Skills/Training
      this.queryData.getQuestion(this.year, 'Question46'), // Assessment
      this.queryData.getQuestion(this.year, 'Question50'), // Engagement
      this.stakeholdersService.getEOSCSBCountries()
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value: any) => {
        // console.log(value);
        // this.createTable(value);
      },
      error: err => {console.error(err)}
    });
  }

  createTable(value: RawData[], countriesEOSC: string[]) {
    this.tableData = [];

    this.tableData[1] = this.dataHandlerService.convertRawDataForCumulativeTable(value[0], countriesEOSC);
    this.tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(value[1], countriesEOSC);
    this.tableData[3] = this.dataHandlerService.convertRawDataForCumulativeTable(value[2], countriesEOSC);
    this.tableData[4] = this.dataHandlerService.convertRawDataForCumulativeTable(value[3], countriesEOSC);
    this.tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(value[4], countriesEOSC);
    this.tableData[6] = this.dataHandlerService.convertRawDataForCumulativeTable(value[5], countriesEOSC);
    this.tableData[7] = this.dataHandlerService.convertRawDataForCumulativeTable(value[6], countriesEOSC);
    this.tableData[8] = this.dataHandlerService.convertRawDataForCumulativeTable(value[7], countriesEOSC);
    this.tableData[9] = this.dataHandlerService.convertRawDataForCumulativeTable(value[8], countriesEOSC);
    this.tableData[10] = this.dataHandlerService.convertRawDataForCumulativeTable(value[9], countriesEOSC);
    this.tableData[11] = this.dataHandlerService.convertRawDataForCumulativeTable(value[10], countriesEOSC);
    this.tableData[12] = this.dataHandlerService.convertRawDataForCumulativeTable(value[11], countriesEOSC);

    this.tableData[0] = countriesEOSC;
    // Transpose 2d array
    this.tableData = this.tableData[0].map((_, colIndex) => this.tableData.map(row => row[colIndex]));

    for (let i = 0; i < this.tableData.length; i++) {
      let tmpData = countries.find(country => country.id === this.tableData[i][0]);
      if (tmpData)
        this.tableData[i][0] = tmpData.name + ` (${tmpData.id})`;
    }
    // console.log(this.tableData);
  }

}
