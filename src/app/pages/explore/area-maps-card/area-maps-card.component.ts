import { Component, computed, DestroyRef, inject, input, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgOptimizedImage } from "@angular/common";
import { zip } from "rxjs/internal/observable/zip";
import { ExploreService } from "../explore.service";
import { StakeholdersService } from "../../../../survey-tool/app/services/stakeholders.service";
import { EoscReadinessDataService } from "../../services/eosc-readiness-data.service";
import { DataHandlerService } from "../../services/data-handler.service";
import { ChartsModule } from "src/app/shared/charts/charts.module";

export interface AreaMapTabConfig {
  question: string;
  title: string;
  caption: string;
  labelSuffix: string;
}

@Component({
  selector: 'app-area-maps-card',
  templateUrl: './area-maps-card.component.html',
  imports: [ChartsModule, NgOptimizedImage]
})
export class AreaMapsCardComponent implements OnInit {

  // --- Signal Inputs ---
  policyTab = input.required<AreaMapTabConfig>();
  monitoringTab = input.required<AreaMapTabConfig>();
  financialStrategyTab = input.required<AreaMapTabConfig>();
  year = input.required<string>();
  smallScreen = input<boolean>(false);

  private destroyRef = inject(DestroyRef);
  private exploreService = inject(ExploreService);
  private stakeholdersService = inject(StakeholdersService);
  private queryData = inject(EoscReadinessDataService);
  private dataHandlerService = inject(DataHandlerService);

  //  Template State
  questionsDataArray: any[] = [];
  participatingCountries: number[] = [];
  total: number[] = [];

  comment?: string;
  countryName?: string;
  countryCode?: string;

  // Internal State
  private tmpQuestionsDataArray: any[] = [];
  private countriesArray: string[] = [];
  private toolTipData: Map<string, string>[] = [];

  // It re-runs only when policyTab, monitoringTab, or financialStrategyTab change.
  tabs = computed(() => [
    this.policyTab(),
    this.monitoringTab(),
    this.financialStrategyTab()
  ]);

  ngOnInit() {
    this.stakeholdersService.getEOSCSBCountries().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: countries => {
        this.countriesArray = countries;
        this.getNationalPolicies(this.policyTab().question, 0);
        this.getMonitoring(this.monitoringTab().question, 1, 2);
        this.getMonitoring(this.financialStrategyTab().question, 2, 1);
      },
      error: err => { console.error(err); }
    });
  }

  private getNationalPolicies(question: string, index: number) {
    zip(
      this.queryData.getQuestion(this.year(), question),
      this.queryData.getQuestion(this.year(), question + '.1'),
      this.queryData.getQuestionComment(this.year(), question),
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.tmpQuestionsDataArray[index] = this.dataHandlerService.mergePolicyQuestionData(res[0], res[1]);
        this.participatingCountries[index] = this.dataHandlerService.convertRawDataForActivityGauge(res[0]);
        this.total[index] = res[0].datasets[0].series.result.length;
        this.toolTipData[index] = this.dataHandlerService.covertRawDataGetText(res[2]);
        this.questionsDataArray[index] = this.exploreService.createCategorizedMapDataFromMergedResponse(
          this.tmpQuestionsDataArray[index], this.countriesArray
        );
      },
      error: err => { console.error(err); }
    });
  }

  private getMonitoring(question: string, index: number, mapCount: number) {
    zip(
      this.queryData.getQuestion(this.year(), question),
      this.queryData.getQuestionComment(this.year(), question),
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.tmpQuestionsDataArray[index] = this.dataHandlerService.convertRawDataToCategorizedAreasData(res[0]);
        this.participatingCountries[index] = this.dataHandlerService.convertRawDataForActivityGauge(res[0]);
        this.total[index] = res[0].datasets[0].series.result.length;
        for (let i = 0; i < this.tmpQuestionsDataArray[index].series.length; i++) {
          this.tmpQuestionsDataArray[index].series[i].data =
            this.tmpQuestionsDataArray[index].series[i].data.map((code: any) => ({ code }));
        }
        this.toolTipData[index] = this.dataHandlerService.covertRawDataGetText(res[1]);
        this.questionsDataArray[index] = this.exploreService.createMapDataFromCategorization(
          this.tmpQuestionsDataArray[index], this.countriesArray, mapCount
        );
      },
      error: err => { console.error(err); }
    });
  }

  showComment(index: number, country: { code: string }) {
    this.comment = this.toolTipData[index]?.get(country.code.toLowerCase())
      ?.replace(/\\n/g, '<br>').replace(/\\t/g, '  ') ?? 'N/A';
    this.countryCode = country.code.toLowerCase();
    this.countryName = this.exploreService.findCountryName(country.code).name;
  }

  resetSelection() {
    this.countryName = this.countryCode = this.comment = undefined;
  }
}
