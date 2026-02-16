import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {Coordinator} from "../../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SurveyService} from "../../../../../survey-tool/app/services/survey.service";
import {of} from "rxjs";
import {switchMap} from "rxjs/operators";


@Component({
  selector: "app-coordinator-home",
  templateUrl: "./coordinator-home.component.html",
  standalone: true,
})
export class CoordinatorHomeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private surveyService = inject(SurveyService);
  private stakeholdersService = inject(StakeholdersService);

  currentGroup: Coordinator | null = null;
  surveyStats = {
    activeSurveyName: '',
    totalParticipants: 0,
    hasProgressCount: 0,
    validatedCount: 0,
    globalProgress: 0
  };
  loadingResults: boolean = false;

  ngOnInit() {
    this.userService.currentCoordinator.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
      this.currentGroup = next;
    });

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      const storedGroup = this.currentGroup || JSON.parse(sessionStorage.getItem("currentCoordinator"));
      if (!storedGroup) {
        this.stakeholdersService.getCoordinatorById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: res => {
            this.userService.changeCurrentCoordinator(res);
            this.fetchSurveyData(res);
          },
          error: err => console.error('Error fetching coordinator', err)
        });
      } else {
        this.fetchSurveyData(storedGroup);
      }
    });
  }

  fetchSurveyData(group: Coordinator) {
    this.loadingResults = true;

    this.surveyService.getSurveys('type', group.type).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(res => {
        if (res && res.results && res.results.length > 0) {
          const latestSurvey = res.results[0];
          this.surveyStats.activeSurveyName = latestSurvey.name;
          const answerUrlParams = [
            {key: 'groupId', values: [group.id]},
            {key: 'surveyId', values: [latestSurvey.id]},
            {key: 'quantity', values: ['50']}
          ];
          return this.surveyService.getSurveyEntries(answerUrlParams);
        }
        return of(null);
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.results) {
          const finalData = res.results;

          let currentSum = 0;
          let totalSum = 0;
          let validated = 0;
          let hasProgress = 0;

          finalData.forEach((answer: any) => {
            currentSum += answer.progressTotal.current;
            totalSum += answer.progressTotal.total;
            if (answer.progressTotal.current > 0) {
              hasProgress++;
            }
            if (answer.validated) {
              validated++;
            }
          });
          this.surveyStats.totalParticipants = finalData.length;
          this.surveyStats.hasProgressCount = hasProgress;
          this.surveyStats.validatedCount = validated;
          this.surveyStats.globalProgress = totalSum > 0
            ? Math.round((currentSum / totalSum) * 100)
            : 0;
        }
        this.loadingResults = false;
        console.log('Processed Coordinator Stats:', this.surveyStats);
      },
      error: (err) => {
        console.error(err);
        this.loadingResults = false;
      }
    });
  }
}
