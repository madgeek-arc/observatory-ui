import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { EoscReadinessDataService } from "../../../services/eosc-readiness-data.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RawData } from "../../../../../survey-tool/app/domain/raw-data";
import { PdfExportService } from "../../../services/pdf-export.service";

@Component({
  selector: 'app-open-science-by-area-repositories',
  templateUrl: './open-science-by-area-repositories.component.html',
  styleUrls: ['../../../../../assets/css/explore-dashboard.scss']
})

export class OpenScienceByAreaRepositoriesComponent implements OnInit {
  protected readonly Math = Math;

  private destroyRef = inject(DestroyRef);

  years = ['2022', '2023'];

  repositories: number[] = [];
  countriesWithPolicy: number[] = [];
  countriesWithStrategy: number[] = [];
  countriesWithMonitoring: number[] = [];
  totalInvestments: number[] = [];

  constructor(private queryData: EoscReadinessDataService, private pdfService: PdfExportService) {}

  ngOnInit() {
    this.years.forEach((year, index) => {
      this.getCountriesWithPolicy(year, index);
      this.getTotalInvestments(year, index);
      this.getCountriesWithFinancialStrategy(year, index);
      this.getNationalMonitoring(year, index);
      this.getRepositories(year, index);
    });
  }


  /** Get national monitoring on connecting repositories ----------------------------------------------------------> **/
  getNationalMonitoring(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question78').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithMonitoring[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get financial strategy on connecting repositories -----------------------------------------------------------> **/
  getCountriesWithFinancialStrategy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question31').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithStrategy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get investments in connecting repositories ------------------------------------------------------------------> **/
  getTotalInvestments(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question80').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.totalInvestments[index] = this.calculateSum(value);
      }
    });
  }

  /** Get countries with policy on connecting repositories --------------------------------------------------------> **/
  getCountriesWithPolicy(year: string, index: number) {
    this.queryData.getQuestion(year, 'Question30').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.countriesWithPolicy[index] = this.calculatePercentage(value, value.datasets[0].series.result.length);
      }
    });
  }

  /** Get how many repositories offered long-term data preservation -----------------------------------------------> **/
  getRepositories(year: string, index: number) {
    // TODO: See what is the issue with Q84.1
    this.queryData.getQuestion(year, 'Question89').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => {
        this.repositories[index] = this.calculateSum(value);
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
