import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import { PdfExportService } from "../../../services/pdf-export.service";
import { zip } from "rxjs/internal/observable/zip";
import { CategorizedAreaData, Series } from "../../../../../survey-tool/app/domain/categorizedAreaData";
import {
  ColorPallet,
  EoscReadiness2022MapSubtitles
} from "../../../eosc-readiness-dashboard/eosc-readiness-2022/eosc-readiness2022-map-subtitles";
import { latlong } from "../../../../../survey-tool/app/domain/countries-lat-lon";
import { CountryTableData } from "../../../../../survey-tool/app/domain/country-table-data";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { DataHandlerService } from "../../../services/data-handler.service";

@Component({
  selector: 'app-open-science-by-area-software',
  templateUrl: './open-science-by-area-software.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.scss']
})

export class OpenScienceByAreaSoftwareComponent implements OnInit {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);
  exportActive = false;

  years = ['2022', '2023'];

  sets: number[] = [];
  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

  countriesArray: string[] = [];
  questionsDataArray: any[] = [];
  tmpQuestionsDataArray: any[] = [];
  participatingCountries: number[] = [];
  total: number[] = [];
  mapPointData: CountryTableData[];
  toolTipData: Map<string, string>[] = [];

  mapSubtitlesArray: string[][] = EoscReadiness2022MapSubtitles;

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService,
              private stakeholdersService: StakeholdersService, private dataHandlerService: DataHandlerService) {}

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
      this.getSets(year, index);
    });

    // Maps
    this.getPoliciesOnSoftware();
    this.getMonitoringOnSoftware();
  }

  /** Get maps data ----------------------------------------------------------------------------------> **/
  getPoliciesOnSoftware() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion(this.years[this.years.length-1], 'Question22'),
      this.queryData.getQuestion(this.years[this.years.length-1], 'Question22.1'),
      this.queryData.getQuestionComment(this.years[this.years.length-1], 'Question22'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[0] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[0] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.total[0] = res[1].datasets[0].series.result.length;
        for (let i = 0; i < this.tmpQuestionsDataArray[0].series.length; i++) {
          this.tmpQuestionsDataArray[0].series[i].data = this.tmpQuestionsDataArray[0].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[0] = this.dataHandlerService.covertRawDataGetText(res[3]);
        this.mapPointData = this.dataHandlerService.convertRawDataToTableData(res[2]);
        this.createMapDataFromCategorizationWithDots(0,0);

      },
      error => {console.error(error)},
      () => {}
    );
  }

  getMonitoringOnSoftware() {
    zip(
      this.stakeholdersService.getEOSCSBCountries(),
      this.queryData.getQuestion(this.years[this.years.length-1], 'Question70'),
      this.queryData.getQuestionComment(this.years[this.years.length-1], 'Question70'),
    ).subscribe(
      res => {
        this.countriesArray = res[0];
        this.tmpQuestionsDataArray[1] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[1]);
        this.participatingCountries[1] = this.dataHandlerService.convertRawDataForActivityGauge(res[1]);
        this.total[1] = res[1].datasets[0].series.result.length;
        for (let i = 0; i < this.tmpQuestionsDataArray[1].series.length; i++) {
          this.tmpQuestionsDataArray[1].series[i].data = this.tmpQuestionsDataArray[1].series[i].data.map(code => ({ code }));
        }
        this.toolTipData[1] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.createMapDataFromCategorization(1,2);
      }
    );
  }

  createMapDataFromCategorization(index: number, mapCount: number) {
    // this.mapSubtitles[mapCount] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[index] = new CategorizedAreaData();

    let position = 0;
    for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
      if (this.tmpQuestionsDataArray[index].series[i].name === 'Awaiting data')
        continue;
      position = this.tmpQuestionsDataArray[index].series[i].name === 'No'? 1 : 0;
      this.questionsDataArray[index].series[i] = new Series(this.mapSubtitlesArray[mapCount][position], false);
      this.questionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
      this.questionsDataArray[index].series[i].showInLegend = true;
      this.questionsDataArray[index].series[i].color = ColorPallet[position];
    }
    let countryCodeArray = [];
    for (let i = 0; i < this.questionsDataArray[index].series.length; i++) {
      for (const data of this.questionsDataArray[index].series[i].data) {
        countryCodeArray.push(data.code)
      }
    }

    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[2];
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
    this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));
  }

  createMapDataFromCategorizationWithDots(index: number, mapCount: number) {
    // this.mapSubtitles[index] = this.mapSubtitlesArray[mapCount][index];

    this.questionsDataArray[index] = new CategorizedAreaData();

    let position = 0;
    for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
      if (this.tmpQuestionsDataArray[index].series[i].name === 'Awaiting data')
        continue;
      position = this.tmpQuestionsDataArray[index].series[i].name === 'No'? 1 : 0;
      this.questionsDataArray[index].series[i] = new Series(this.mapSubtitlesArray[mapCount][position], false);
      this.questionsDataArray[index].series[i].data = this.tmpQuestionsDataArray[index].series[i].data;
      this.questionsDataArray[index].series[i].showInLegend = true;
      this.questionsDataArray[index].series[i].color = ColorPallet[position];
    }
    let countryCodeArray = [];
    for (let i = 0; i < this.questionsDataArray[index].series.length; i++) {
      for (const data of this.questionsDataArray[index].series[i].data) {
        countryCodeArray.push(data.code)
      }
    }

    if (countryCodeArray.length > 0) {
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length] = new Series('Awaiting Data', false);
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].showInLegend = true;
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].color = ColorPallet[2];
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.countriesArray.filter(code => !countryCodeArray.includes(code));
      this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data = this.questionsDataArray[index].series[this.questionsDataArray[index].series.length-1].data.map(code => ({ code }));
    }

    let mapPointArray1 = [];
    let mapPointArray2 = [];
    for (let i = 0; i < this.mapPointData.length; i++) {
      if (this.mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies === 'Yes') {
        mapPointArray1.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
      } else if (this.mapPointData[i].dedicatedFinancialContributionsToEOSCLinkedToPolicies === 'No') {
        mapPointArray2.push({name: this.mapPointData[i].code, lat: latlong.get(this.mapPointData[i].code).latitude, lon: latlong.get(this.mapPointData[i].code).longitude});
      }
    }

    let pos: number;
    if (mapPointArray1.length > 0) {
      pos = this.questionsDataArray[index].series.length;
      this.questionsDataArray[index].series[pos] = new Series('National policy is mandatory', false, 'mappoint');
      this.questionsDataArray[index].series[pos].data = mapPointArray1;
      this.questionsDataArray[index].series[pos].color = '#7CFC00';
      this.questionsDataArray[index].series[pos].marker.symbol = 'circle';
      this.questionsDataArray[index].series[pos].showInLegend = true;
    }

    if (mapPointArray2.length > 0) {
      pos = this.questionsDataArray[index].series.length;
      this.questionsDataArray[index].series[pos] = new Series('National policy is not mandatory', false, 'mappoint');
      this.questionsDataArray[index].series[pos].data = mapPointArray2;
      this.questionsDataArray[index].series[pos].color = '#FFEF00';
      this.questionsDataArray[index].series[pos].marker.symbol = 'diamond';
      this.questionsDataArray[index].series[pos].showInLegend = true;
    }
  }

  /** Get national monitoring on sopen source software ------------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question70').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on open source software --------------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question23').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
        console.log(this.countriesWithStrategy);
      }
    });
  }

  /** Get investments in open source software ---------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question72').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on open source software -----------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question22').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get how many open source software sets were published -------------------------------------------------------> **/
  getSets(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question73').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.sets[index] = this.calculateSum(value);
      }
    });
  }

  /** Export to PDF -----------------------------------------------------------------------------------------------> **/
  exportToPDF(contents: HTMLElement[], filename?: string) {
    this.exportActive = true
    this.pdfService.export(contents, filename).then(() => {
      this.exportActive = false;
    }).catch((error) => {
      this.exportActive = false;
      console.error('Error during PDF generation:', error);
    });
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
