import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Stakeholder } from "../../../../../survey-tool/app/domain/userInfo";
import { UserService } from "../../../../../survey-tool/app/services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyService } from "../../../../../survey-tool/app/services/survey.service";
import { EMPTY, combineLatest} from "rxjs";
import { switchMap } from "rxjs/operators";
import {ChartsModule} from "../../../../shared/charts/charts.module";
import {DisplayEntries} from "../../../../../survey-tool/app/domain/survey";
import {MessagingSystemService} from "../../../../../messaging-system-ui/services/messaging-system.service";
import {TopicThread} from "../../../../../messaging-system-ui/app/domain/messaging";

@Component({
  selector: 'app-stakeholders-home',
  templateUrl: `./stakeholders-home.component.html`,
  standalone: true,
  imports: [CommonModule, ChartsModule]
})

export class StakeholdersHomeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stakeholdersService = inject(StakeholdersService);
  private surveyService = inject(SurveyService);
  private userService = inject(UserService);
  private messagingService = inject(MessagingSystemService);


  currentGroup: Stakeholder | null = null;
  latestAnswerInfo: any = null;
  loading: boolean = false;
  recentHistory: DisplayEntries[] = [];
  recentThreads: TopicThread[] = [];
  loadingThreads: boolean = false;

  tooltipPointFormat: string = '{series.name}: <b>{point.y}</b>';

  // Highchart
  viewCategories: string[] = [];
  viewSeries: any[] = [];
  totalViews: number = 0;


  ngOnInit() {
    this.userService.currentStakeholder.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
        this.currentGroup = next;
        if (next.id) {
          this.fetchRecentThreads(next.id);
        }
      });

    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(params => {
        const id = params['id'];
        if (!id) return EMPTY;
        return this.stakeholdersService.getMonthlyViews(id);
      })
    ).subscribe({
      next: (res) => {
        console.log('--- Analytics Test Success ---');

        const allKeys = Object.keys(res.pageviewsPerMonth);
        const allValues = Object.values(res.pageviewsPerMonth);

        this.viewCategories = allKeys.slice(-6);
        const finalValues = allValues.slice(-6);

        this.viewSeries = [{
          name: 'Page Views',
          type: 'column',
          data: finalValues,
          color: '#11a18d',
          showInLegend: false
        }];
        this.totalViews = finalValues.reduce((a, b) => a + b, 0);
      },
      error: (err) => console.error('Analytics Error:', err)
    });

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef),
      switchMap(params => {
        const id = params['id'];
        if (!id) return EMPTY;
        this.loading = true;

        const storedGroup = this.currentGroup || JSON.parse(sessionStorage.getItem("currentStakeholder"));
        if (!storedGroup || storedGroup.id !== id) {
          return this.stakeholdersService.getStakeholder(id).pipe(
            switchMap(st => {
              this.userService.changeCurrentStakeholder(st);
              return [id];
            })
          );
        }
        return [id];
      }),
      switchMap(id => {
        const urlParameters = [
          { key: 'groupId', values: [id] },
          { key: 'stakeholderId', values: [id] },
          { key: 'sort', values: ['creation_date'] },
          { key: 'order', values: ['desc'] }
        ];
        return this.surveyService.getSurveyEntries(urlParameters);
      }),
      switchMap(res => {
        if (res?.results?.length > 0) {
          this.latestAnswerInfo = res.results[0];
          return this.surveyService.getAnswerHistory(this.latestAnswerInfo.surveyAnswerId);
        }
        this.loading = false;
        return EMPTY;
      })
    ).subscribe({
      next: (historyRes) => {
        if (historyRes?.entries) {
          this.recentHistory = historyRes.entries
            .sort((a, b) => b.time - a.time)
            .slice(0, 3);
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  navigateToMySurveys() {
    if ( this.currentGroup && this.currentGroup.id ) {
      this.router.navigate(['/contributions', this.currentGroup.id, 'mySurveys']);
    }
  }

  navigateToHistory() {
    const surveyId = this.latestAnswerInfo?.surveyId;
    const answerId = this.latestAnswerInfo?.surveyAnswerId;

    if (surveyId && answerId) {
      this.router.navigate(['../', 'mySurveys', surveyId, answerId, 'history'],
        { relativeTo: this.route }
      );
    }
  }

  fetchRecentThreads(groupId: string) {
    this.loadingThreads = true;

    this.messagingService.getInbox(groupId).subscribe({
      next: (response: any) => {
        if (response && response.content) {
          console.log('Recent Threads:', response.content);
          this.recentThreads = response.content.slice(0, 3);
        } else {
          this.recentThreads = [];
        }
        this.loadingThreads = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.loadingThreads = false;
      }
    });
  }

  navigateToMessages() {
    if (this.currentGroup && this.currentGroup.id) {
      this.router.navigate(['/contributions', this.currentGroup.id, 'messages']);
    }
  }


  stripHtml(html: string) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  }


  // TODO: Uncomment when PDF implementation is ready
  // modelAnswer() {
  //   const surveyId = this.latestAnswerInfo.surveyId;
  //   const answerId = this.latestAnswerInfo.surveyAnswerId;
  //   console.log(`Model: ${surveyId}, Answer: ${answerId}`);
  //
  //   zip(
  //     this.surveyService.getSurvey(surveyId),
  //     this.surveyService.getAnswer(answerId)
  //   ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
  //     next: ([model, answer]) => {
  //       console.log('Success. Model downloaded!');
  //
  //       console.log('- MODEL (Structure) -');
  //       console.log(model);
  //
  //       console.log('- ANSWER (User Answers) -');
  //       console.log(answer);
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //     }
  //   });
  // }
}
