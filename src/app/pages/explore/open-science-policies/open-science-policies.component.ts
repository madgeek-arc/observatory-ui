import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { SeriesBarOptions, SeriesBubbleOptions, SeriesOptionsType } from "highcharts";
import { zip } from "rxjs/internal/observable/zip";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { RawData, Row } from "../../../../survey-tool/app/domain/raw-data";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { countriesNumbers } from "../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { DataHandlerService } from "../../services/data-handler.service";
import { countries } from "../../../../survey-tool/app/domain/countries";



@Component({
  selector: 'app-open-science-policies',
  templateUrl: './open-science-policies.component.html',
  styleUrls: ['../../dashboard/country-landing-page/country-landing-page.component.css'],
})

export class OpenSciencePoliciesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  countriesArray: string[] = [];
  years = ['2022', '2023'];
  year = '2022';

  barChartCategories = ['Open Access Publications', 'Fair Data', 'Data Management', 'Open Data', 'Open Software', 'Services', 'Connecting repositories to EOSC', 'Data stewardship', 'Long-term data preservation', 'Skills/Training', 'Incentives/Rewards for OS', 'Citizen Science'];

  barChartSeries: SeriesOptionsType[] = [];
  barChart2Series: SeriesOptionsType[] = [];

  barChartTitles = {
    // title: 'Percentage of countries with national policies different Open Science Categories',
    title: '',
    xAxis: 'Policy on',
    yAxis: 'Percentage of countries with national policies',
  }

  bubbleWithCategories = [] as SeriesBubbleOptions[];

  tableData: string[][] = [];

  constructor(private queryData: EoscReadinessDataService, private stakeholdersService: StakeholdersService,
              private dataHandlerService: DataHandlerService) {}

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().pipe().subscribe({
      next: value => this.countriesArray = value,
      error: err => console.error(err)
    });

    this.years.forEach((year, index) => {
      this.getBarChartData(year, index);
      this.getFinancialBarChartData(year, index);
    });
    this.getBubbleChartData();
    this.getTableData();
  }

  /** Bar charts ---------------------------------------------------------------------------------------------------> **/
  getBarChartData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question6'),   // national policy on open access publications
      this.queryData.getQuestion(year, 'Question14'),  // national policy on FAIR data
      this.queryData.getQuestion(year, 'Question10'),  // national policy on data management
      this.queryData.getQuestion(year, 'Question18'),  // national policy on Open data
      this.queryData.getQuestion(year, 'Question22'),  // national policy on software
      this.queryData.getQuestion(year, 'Question26'),  // national policy on offering services through EOSC
      this.queryData.getQuestion(year, 'Question30'),  // national policy on connecting repositories to EOSC
      this.queryData.getQuestion(year, 'Question34'),  // national policy on data stewardship
      this.queryData.getQuestion(year, 'Question38'),  // national policy on long-term data preservation
      this.queryData.getQuestion(year, 'Question42'),  // national policy on skills/training for Open Science
      this.queryData.getQuestion(year, 'Question46'),  // national policy on incentives/rewards for Open Science
      this.queryData.getQuestion(year, 'Question50'),  // national policy on citizen science
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.barChartSeries.push(this.createBarChartSeries(value, year));

        if (this.years.length === index+1)
          this.barChartSeries = [...this.barChartSeries];
      },
      error: err => {console.error(err)}
    });
  }

  getFinancialBarChartData(year: string, index: number) {
    zip(
      this.queryData.getQuestion(year, 'Question7'),  // Publications
      this.queryData.getQuestion(year, 'Question15'), // FAIR-data
      this.queryData.getQuestion(year, 'Question11'), // Data-management
      this.queryData.getQuestion(year, 'Question19'), // Open-data
      this.queryData.getQuestion(year, 'Question23'), // Software
      this.queryData.getQuestion(year, 'Question27'), // Services
      this.queryData.getQuestion(year, 'Question31'), // Connecting repositories to EOSC
      this.queryData.getQuestion(year, 'Question35'), // Data stewardship
      this.queryData.getQuestion(year, 'Question39'),// Long-term data preservation
      this.queryData.getQuestion(year, 'Question43'),// Skills/Training
      this.queryData.getQuestion(year, 'Question47'),// Assessment
      this.queryData.getQuestion(year, 'Question51'), // Engagement
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.barChart2Series.push(this.createBarChartSeries(value, year));

        if (this.years.length === index+1)
          this.barChart2Series = [...this.barChart2Series];
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

  /** Bubble chart ------------------------------------------------------------------------------------------------> **/
  getBubbleChartData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question6'),   // national policy on open access publications
      this.queryData.getQuestion(this.year, 'Question6.1'), // national policy is mandatory
      this.queryData.getQuestion(this.year, 'Question56'),  // financial investments in open access publications
      this.queryData.getQuestion(this.year, 'Question57'),  // number of publications published in open access
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        // console.log(this.createBubbleChartSeries(value));
        this.bubbleWithCategories = this.createBubbleChartSeries(value);
      },
      error: err => {console.error(err)}
    });
  }

  createBubbleChartSeries(data: RawData[]) {
    const tmpArr = this.mergeArrays(data[0].datasets[0].series.result, data[1].datasets[0].series.result, data[2].datasets[0].series.result, data[3].datasets[0].series.result);
    // console.log(tmpArr);
    let series = [
      {
        name: 'Policy is mandatory',
        color: '#32cd32',
        data: []
      }, {
        name: 'Policy is not mandatory',
        color: '#ff8c00',
        data: []
      }, {
        name: 'No policy',
        color: '#808080',
        data: []
      }
    ] as SeriesBubbleOptions[];

    tmpArr.forEach(el => {

      if (!this.isNumeric(el[3]) || !this.isNumeric(el[4]))
        return;

      //TODO: Z is statically set to 10 until corresponding query is provided
      let item = {x: +el[4], y: this.rangeSelector(+el[3]), z: 10, name: el[0], country: this.findCountryName(el[0]).name};

      if (el[1] === 'No')
        series[2].data.push(item);
      else if (el[1] === 'Yes') {
        if(el[2] === 'Yes')
          series[0].data.push(item);
        else if (el[2] === 'No')
          series[1].data.push(item);
      }

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
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        // console.log(value);
        this.tableData[1] = this.dataHandlerService.convertRawDataForCumulativeTable(value[0], this.countriesArray);
        this.tableData[2] = this.dataHandlerService.convertRawDataForCumulativeTable(value[1], this.countriesArray);
        this.tableData[3] = this.dataHandlerService.convertRawDataForCumulativeTable(value[2], this.countriesArray);
        this.tableData[4] = this.dataHandlerService.convertRawDataForCumulativeTable(value[3], this.countriesArray);
        this.tableData[5] = this.dataHandlerService.convertRawDataForCumulativeTable(value[4], this.countriesArray);
        this.tableData[6] = this.dataHandlerService.convertRawDataForCumulativeTable(value[5], this.countriesArray);
        this.tableData[7] = this.dataHandlerService.convertRawDataForCumulativeTable(value[6], this.countriesArray);
        this.tableData[8] = this.dataHandlerService.convertRawDataForCumulativeTable(value[7], this.countriesArray);
        this.tableData[9] = this.dataHandlerService.convertRawDataForCumulativeTable(value[8], this.countriesArray);
        this.tableData[10] = this.dataHandlerService.convertRawDataForCumulativeTable(value[9], this.countriesArray);
        this.tableData[11] = this.dataHandlerService.convertRawDataForCumulativeTable(value[10], this.countriesArray);
        this.tableData[12] = this.dataHandlerService.convertRawDataForCumulativeTable(value[11], this.countriesArray);

        this.tableData[0] = this.countriesArray;
        // Transpose 2d array
        this.tableData = this.tableData[0].map((_, colIndex) => this.tableData.map(row => row[colIndex]));

        for (let i = 0; i < this.tableData.length; i++) {
          let tmpData = countries.find(country => country.id === this.tableData[i][0]);
          if (tmpData)
            this.tableData[i][0] = tmpData.name + ` (${tmpData.id})`;
        }
        // console.log(this.tableData);
      },
      error: err => {console.error(err)}
    });
  }

  /** Other stuff -------------------------------------------------------------------------------------------------> **/
  mergeArrays = (...arrays: Row[][]): string[][] => {
    const map = new Map<string, string[]>();

    // Helper function to add rows to the map
    arrays.forEach((arr, arrayIndex) => {
      arr.forEach(row => {
        const country = row.row[0];
        const value = row.row[1];

        if (!map.has(country)) {
          map.set(country, [country, ...Array(arrays.length).fill(null)]);
        }

        const entry = map.get(country)!;
        entry[arrayIndex + 1] = value; // Fill respective column
      });
    });

    // Convert the map to an array of string arrays
    return Array.from(map.values());
  };

  findCountryName(code: string) {
    return countriesNumbers.find(
      elem => elem.id === code
    );
  }

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

  rangeSelector(value: number) {
    if (value < 1)
      return 0;
    else if (value < 5)
      return 1;
    else if (value < 10)
      return 2;
    else if (value < 20)
      return 3;
    else
      return 4;
  }

}
