import {Component, computed, DestroyRef, inject, OnInit, signal} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Coordinator} from "../../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {SurveyService} from "../../../../../survey-tool/app/services/survey.service";
import {Observable, of} from "rxjs";
import {catchError, filter, map, shareReplay, switchMap, tap} from "rxjs/operators";
import {ChartsModule} from "../../../../shared/charts/charts.module";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule} from "@angular/forms";



@Component({
  selector: "app-coordinator-home",
  templateUrl: "coordinator-home.component.html",
  standalone: true,
  imports: [CommonModule, ChartsModule, NgSelectModule, FormsModule],
})

export class CoordinatorHomeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private surveyService = inject(SurveyService);
  private stakeholdersService = inject(StakeholdersService);

  protected loadingResults = signal(false);

  tooltipPointFormat: string = '{series.name}: <b>{point.y}</b>';

  // Explore page views chart
  exploreCategories: string[] = [];
  exploreSeries: any[] = [];
  totalExploreViews: number = 0;

  // Country page views chart
  countryCategories: string[] = [];
  countrySeries: any[] = [];
  totalCountryViews: number = 0;
  selectedCountry: string = '';
  countries: string[] = [];

  private coordinator$ = this.route.params.pipe(
    map(params => params['id'] as string),
    filter(id => !!id),
    switchMap((id: string): Observable<Coordinator> => {
      const storedJson = sessionStorage.getItem("currentCoordinator");
      const storedGroup = storedJson ? (JSON.parse(storedJson) as Coordinator) : null;

      if (storedGroup && storedGroup.id === id) {
        return of(storedGroup);
      }
      return this.stakeholdersService.getCoordinatorById(id);
    }),
    tap(coord => this.userService.changeCurrentCoordinator(coord)),
    shareReplay(1)
  );

  private surveyRawData$ = this.coordinator$.pipe(
    tap(() => this.loadingResults.set(true)),
    switchMap(group => this.surveyService.getSurveys('type', group.type).pipe(
      // Use map to handle the empty/null check gracefully
      map(res => (res && res.results && res.results.length > 0) ? res.results[0] : null),
      switchMap(latestSurvey => {
        if (!latestSurvey) return of({ name: '', results: [] });

        const params = [
          {key: 'groupId', values: [group.id]},
          {key: 'surveyId', values: [latestSurvey.id]},
          {key: 'quantity', values: ['100']}
        ];

        return this.surveyService.getSurveyEntries(params).pipe(
          map(entries => ({
            name: latestSurvey.name,
            results: entries?.results || []
          }))
        );
      }),
      catchError(err => {
        console.error(err);
        return of({ name: '', results: [] });
      }),
      tap(() => this.loadingResults.set(false))
    )),
    takeUntilDestroyed(this.destroyRef)
  );

  private rawDataSignal = toSignal(this.surveyRawData$, {
    initialValue: { name: '', results: [] }
  });

  public surveyStats = computed(() => {
    const data = this.rawDataSignal();
    if (!data.results.length) return this.getEmptyStats(data.name);

    const totals = data.results.reduce((acc, curr: any) => {
      acc.currSum += curr.progressTotal?.current || 0;
      acc.totalSum += curr.progressTotal?.total || 0;
      if (curr.progressTotal?.current > 0) acc.progressCount++;
      if (curr.validated) acc.valCount++;
      return acc;
    }, { currSum: 0, totalSum: 0, progressCount: 0, valCount: 0 });

    return {
      activeSurveyName: data.name,
      totalParticipants: data.results.length,
      hasProgressCount: totals.progressCount,
      validatedCount: totals.valCount,
      globalProgress: totals.totalSum > 0 ? Math.round((totals.currSum / totals.totalSum) * 100) : 0
    };
  });

  private getEmptyStats(name: string) {
    return { activeSurveyName: name, totalParticipants: 0, hasProgressCount: 0, validatedCount: 0, globalProgress: 0 };
  }

  ngOnInit() {
    this.stakeholdersService.getExplorePageViews(6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const allKeys = Object.keys(res.pageviewsPerMonth);
          const allValues = Object.values(res.pageviewsPerMonth) as number[];
          this.exploreCategories = allKeys.slice(-6);
          const finalValues = allValues.slice(-6);
          this.exploreSeries = [{
            name: 'Page Views',
            type: 'column',
            data: finalValues,
            color: '#11a18d',
            showInLegend: false
          }];
          this.totalExploreViews = finalValues.reduce((a, b) => a + b, 0);
        },
        error: (err) => console.error('Explore Analytics Error:', err)
      });

    this.stakeholdersService.getEOSCSBCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countries) => {
          this.countries = countries;
          if (countries.length > 0) {
            this.selectedCountry = countries[0];
            this.fetchCountryViews(countries[0]);
          }
        },
        error: (err) => console.error('Countries Error:', err)
      });
  }

  fetchCountryViews(country: string) {
    this.countrySeries = [];
    this.stakeholdersService.getCountryPageViews(country, 6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const allKeys = Object.keys(res.pageviewsPerMonth);
          const allValues = Object.values(res.pageviewsPerMonth) as number[];
          this.countryCategories = allKeys.slice(-6);
          const finalValues = allValues.slice(-6);
          this.countrySeries = [{
            name: 'Page Views',
            type: 'column',
            data: finalValues,
            color: '#3498db',
            showInLegend: false
          }];
          this.totalCountryViews = finalValues.reduce((a, b) => a + b, 0);
        },
        error: (err) => console.error('Country Analytics Error:', err)
      });
  }

  onCountrySelect(country: string) {
    if (country) {
      this.fetchCountryViews(country);
    }
  }

  getCountryName(code: string): string {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  }
}
