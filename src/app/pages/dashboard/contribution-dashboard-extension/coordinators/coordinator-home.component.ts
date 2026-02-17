import {Component, computed, DestroyRef, inject, OnInit, signal} from "@angular/core";
import {Coordinator} from "../../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {SurveyService} from "../../../../../survey-tool/app/services/survey.service";
import {Observable, of} from "rxjs";
import {catchError, filter, map, shareReplay, switchMap, tap} from "rxjs/operators";



@Component({
  selector: "app-coordinator-home",
  templateUrl: "coordinator-home.component.html",
  standalone: true,
})

export class CoordinatorHomeComponent {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private surveyService = inject(SurveyService);
  private stakeholdersService = inject(StakeholdersService);

  protected loadingResults = signal(false);

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
}
