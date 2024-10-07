import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import {
  distributionOfOAByScienceFields,
  distributionOfOAPublications,
  OAPublicationVSClosed,
  trendOfOAPublications
} from "../../OSO-stats-queries/explore-queries";
import * as Highcharts from "highcharts";
import { OptionsStackingValue } from "highcharts";
import { PdfExportService } from "../../../services/pdf-export.service";


@Component({
  selector: 'app-open-science-by-area-publications',
  templateUrl: './open-science-by-area-publications.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.scss']
})

export class OpenScienceByAreaPublicationsComponent implements OnInit {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);

  years = ['2022', '2023'];

  stackedColumnCategories = ['2020', '2021', '2022', '2023', '2024'];
  stackedColumnSeries = [
    {
      type: 'column',
      name: 'Gold OA only',
      data: [],
      color: '#FFD700' // Gold color
    }, {
      type: 'column',
      name: 'Green OA only',
      data: [],
      color: '#228B22' // Forest green color
    }, {
      type: 'column',
      name: 'Both Gold & Green OA',
      data: [],
      color: '#FF69B4' // Hot pink color for mixed category
    }, {
      type: 'column',
      name: 'Neither',
      data: [],
      color: '#b0c4de'
    }, {
      type: 'column',
      name: 'Closed',
      data: [],
      color: '#808080' // Grey color
    }
  ] as Highcharts.SeriesColumnOptions[];
  yAxisTitle = 'Number of Publications';
  legend = {
    align: 'right',
    x: -30,
    verticalAlign: 'top',
    y: -10,
    floating: true,
    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
    borderColor: '#CCC',
    borderWidth: 1,
    shadow: false
  };
  tooltipPointFormat = '{series.name}: {point.y}<br/>Total: {point.total}';

  stackedColumn2Categories = [];
  stackedColumn2Series = [
    {
      type: 'column',
      name: 'Gold OA only',
      data: [],
      color: '#FFD700' // Gold color
    }, {
      type: 'column',
      name: 'Green OA only',
      data: [],
      color: '#228B22' // Forest green color
    }, {
      type: 'column',
      name: 'Both Gold & Green OA',
      data: [],
      color: '#FF69B4' // Hot pink color for mixed category
    }, {
      type: 'column',
      name: 'Neither',
      data: [],
      color: '#b0c4de'
    }, {
      type: 'column',
      name: 'Closed',
      data: [],
      color: '#808080' // Grey color
    }
  ] as Highcharts.SeriesColumnOptions[];
  yAxisTitle2 = 'Percentage of Publications';
  stacking: OptionsStackingValue = 'percent';
  dataLabels_format = '{point.percentage:.0f}%';

  treemapData: Highcharts.PointOptionsObject[] = [];

  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];
  OAPublications: number[] = [];

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService) {}

  ngOnInit() {
    this.getPublicationPercentage();
    this.getTrends();
    this.getDistributionOAPublication();
    this.getDistributionOAByScienceFields();

    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
      // this.getPlans(year, index);
    });

  }

  /** Get trends of Publications ----------------------------------------------------------------------------------> **/
  getTrends() {
    this.queryData.getOSOStats(trendOfOAPublications()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.data.forEach((item, index) => {
          item.forEach(el => {
            this.stackedColumnSeries[index].data.push(+el[0]);
          });
        });
        // console.log(this.stackedColumnSeries);
        this.stackedColumnSeries = [...this.stackedColumnSeries];
      }
    });
  }

  /** Get Distribution of Open Access Types by Fields of Science **/
  getDistributionOAByScienceFields() {
    this.queryData.getOSOStatsChartData(distributionOfOAByScienceFields()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        let tmpArr = [];
        value.xAxis_categories.forEach((category, index) => {
          let topLevelItem: Highcharts.PointOptionsObject = {
            id: '',
            name: ''
          };
          tmpArr = category.split(/ (.*)/s);
          topLevelItem.id = index.toString();
          topLevelItem.name = tmpArr[1];
          this.treemapData.push(topLevelItem);
        });

        value.series[0].data.forEach((el, index) => {
          let itemsGroup: Highcharts.PointOptionsObject[] = [
            {
              parent: index.toString(),
              name: 'Gold OA Only',
              value: value.series[0].data[index],
              color: '#FFD700'  // Gold
            }, {
              parent: index.toString(),
              name: 'Green OA Only',
              value: value.series[1].data[index],
              color: '#228B22'  // Green
            }, {
              parent: index.toString(),
              name: 'Both Gold & Green OA',
              value: value.series[2].data[index],
              color: '#FF69B4'  // Pink
            }, {
              parent: index.toString(),
              name: 'Neither',
              value: value.series[3].data[index],
              color: '#b0c4de'
            }, {
              parent: index.toString(),
              name: 'Closed',
              value: value.series[4].data[index],
              color: '#808080'  // Grey
            }
          ]

          this.treemapData.push(...itemsGroup);
        });
        this.treemapData = [...this.treemapData];
      }
    });
  }


  /** Get Distribution of Open Access Types by Different Scholarly Publication Outputs **/
  getDistributionOAPublication() {
    this.queryData.getOSOStatsChartData(distributionOfOAPublications()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        value.series.forEach((series, index) => {
            this.stackedColumn2Series[index].data.push(...series.data);
        });

        this.stackedColumn2Categories = value.xAxis_categories;
        this.stackedColumn2Series[0].data.forEach((item, index) => {
          let sum = 0;
          this.stackedColumn2Series.forEach(series => {
            sum += (+series.data[index]);
          });
          this.stackedColumn2Categories[index] = this.stackedColumn2Categories[index]+ ` (total = ${sum.toLocaleString('en-GB')} )`
        });
      }
    });
  }

  /** Get OA VS closed, restricted and embargoed Publications ---------------------------------------------------  > **/
  getPublicationPercentage() {
    this.queryData.getOSOStats(OAPublicationVSClosed()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.OAPublications[0] = (Math.round((+value.data[2]/+value.data[3] + Number.EPSILON) * 100));
        this.OAPublications[1] = (Math.round((+value.data[0]/+value.data[1] + Number.EPSILON) * 100));
      }
    });
  }

  /** Get national monitoring on Publications -------------------------------------------------------------------  > **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question54').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on Publications -------------------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question7').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }


  /** Get investments on Publications -----------------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question56').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on Publications percentage --------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question6').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/
  exportToPDF(content: HTMLElement, filename?: string) {
    this.pdfService.export(content, filename);
  }

  /** Other ------------------------------------------------------------------------------------------------------>  **/
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

  calculatePercentage(data: RawData, totalCountries: number) {
    let count = 0;
    data.datasets[0].series.result.forEach(item => {
      if (item.row[1] === 'Yes')
        count++;
    });
    return(Math.round(((count/totalCountries) + Number.EPSILON) * 100));
  }

  calculatePercentageChange(data: number[]) {
    let percentage = Math.abs((data[1] - data[0]) / data[0]);
    return Math.round((percentage + Number.EPSILON) * 100);

  }

  calculateSum(data: RawData) {
    let sum = 0;
    data.datasets[0].series.result.forEach(item => {
      if (this.isNumeric(item.row[1]))
        sum += +item.row[1];
    });

    return Math.round(sum * 100) / 100;
  }

}
