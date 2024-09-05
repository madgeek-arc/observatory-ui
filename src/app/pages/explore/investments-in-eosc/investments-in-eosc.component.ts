import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { PointOptionsObject, SeriesBubbleOptions } from "highcharts";
import { zip } from "rxjs/internal/observable/zip";
import { RawData, Row } from "../../../../survey-tool/app/domain/raw-data";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { countriesNumbers } from "../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
type MergedElement = { x: string; y: string; z: string; name: string; country: string };

@Component({
  selector: 'app-investments-in-eosc',
  templateUrl: './investments-in-eosc.component.html',
})

export class InvestmentsInEoscComponent implements OnInit {

  private destroyRef = inject(DestroyRef);

  year = '2022';

  treeGraph: PointOptionsObject[] = [];

  variablePie = [];

  pieTooltip = {
    headerFormat: '',
    pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> ' +
      '{point.name}</b><br/>' +
      'Investment in millions of Euroso: <b>{point.y}</b><br/>'
  }

  bubbleWithPlotLines = [] as SeriesBubbleOptions[];

  constructor(private queryData: EoscReadinessDataService) {}

  ngOnInit() {
    this.getPieChartData();
    this.getTreeGraphData();
    this.getBubbleChartData();
  }

  getTreeGraphData() {
    this.queryData.getQuestion(this.year, 'Question5').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      res => {
        this.treeGraph = this.createRanges(res);
      }
    );
  }

  createRanges(data: RawData) {
    const arr = [
      {
        id: '0.0',
        parent: '',
        name: 'Country investments'
      },
      {
        id: '1.1',
        parent: '0.0',
        name: '< 1 M'
      },
      {
        id: '1.2',
        parent: '0.0',
        name: '1-5 M'
      },
      {
        id: '1.3',
        parent: '0.0',
        name: '5-10 M'
      },
      {
        id: '1.4',
        parent: '0.0',
        name: '10-20M'
      },
      {
        id: '1.5',
        parent: '0.0',
        name: '> 20 M'
      }

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
    return arr;
  }

  /** Bubble chart ------------------------------------------------------------------------------------------------> **/
  getBubbleChartData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question5'),  // Investments in EOSC and Open Science
      this.queryData.getQuestion(this.year, 'Question56'), // Investments in Open Access publications
      this.queryData.getQuestion(this.year, 'Question57'), // Publications
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        console.log(value);
        this.bubbleWithPlotLines = this.createBubbleSeries(value);
      },
      error: err => {console.error(err)}
    });
  }

  createBubbleSeries(data: RawData[]) {
    const series = [{
      type: 'bubble',
      data: [],
      colorByPoint: true
    }] as unknown as SeriesBubbleOptions[];

    const result = this.mergeArrays(data[0].datasets[0].series.result, data[1].datasets[0].series.result, data[2].datasets[0].series.result);

    // console.log(result);
    result.forEach(el => {
      if (!this.isNumeric(el.x) || !this.isNumeric(el.y) || !this.isNumeric(el.z))
        return;

      let item = {
        x: +el.x,
        y: +el.y,
        z: +el.z,
        name: el.name,
        country: this.findCountryName(el.name).name
      };
      series[0].data.push(item);
    });

    // console.log(series);
    return series;
  }

  /** pie chart ---------------------------------------------------------------------------------------------------> **/
  getPieChartData() {
    zip(
      this.queryData.getQuestion(this.year, 'Question100'), // Investments in citizen science
      this.queryData.getQuestion(this.year, 'Question72'),  // Investments in open source software
      this.queryData.getQuestion(this.year, 'Question68'),  // Investments in open data
      this.queryData.getQuestion(this.year, 'Question64'),  // Investments in FAIR data
      this.queryData.getQuestion(this.year, 'Question76'),  // Investments in offering services through EOSC
      this.queryData.getQuestion(this.year, 'Question80'),  // Investments in connecting repositories to EOSC
      this.queryData.getQuestion(this.year, 'Question56'),  // Investments in open access publications
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        console.log(value);
        this.variablePie = this.createPieSeries(value);
      },
      error: err => {console.error(err)}
    });
  }

  createPieSeries(data: RawData[]) {
    const names = ['Citizen Science', 'Software', 'Open Data', 'FAIR Data', 'Services in EOSC', 'Repositories', 'Open Access'];
    const series = [{
      minPointSize: 10,
      innerSize: '20%',
      zMin: 0,
      name: 'countries',
      borderRadius: 5,
      data: [],
      colors: [
        '#4caefe',
        '#3dc3e8',
        '#2dd9db',
        '#1feeaf',
        '#0ff3a0',
        '#00e887',
        '#23e274'
      ]
    }];
    for (let i = 0; i < data.length; i++) {
      let item = {name: names[i], y: this.calculateSum(data[i]), z: 80+i*13};
      series[0].data.push(item);
    }
    // series[0].data.sort((a, b) => a.y - b.y);
    console.log(series);
    return series;
  }

  /** Other -------------------------------------------------------------------------------------------------------> **/
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

  mergeArrays = (arr1: Row[], arr2: Row[], arr3: Row[]): MergedElement[] => {
    const map = new Map<string, Partial<MergedElement>>();

    // Helper function to update map with values
    const addToMap = (arr: Row[], key: keyof MergedElement) => {
      for (const element of arr) {
        const name = element.row[0];
        const value = element.row[1];

        if (!map.has(name)) {
          map.set(name, { name });
        }

        const entry = map.get(name)!;
        entry[key] = String(value);
      }
    };

    // Populate the map with values from each array
    addToMap(arr1, 'x');
    addToMap(arr2, 'y');
    addToMap(arr3, 'z');

    // Convert the map to an array of MergedElement objects
    return Array.from(map.values()).map(entry => ({
      x: entry.x || null,
      y: entry.y || null,
      z: entry.z || null,
      name: entry.name || '',
      country: ''
    }));
  };

  calculateSum(rawData: RawData): number {
    let sum = 0.0;
    for (const series of rawData.datasets) {
      for (const rowResult of series.series.result) {
        if (this.isNumeric(rowResult.row[1])) {
          sum += +rowResult.row[1];
        }
      }
    }
    return (Math.round((sum + Number.EPSILON) * 100) / 100);
  }

}
