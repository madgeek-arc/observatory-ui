import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Stakeholder } from "../../../../../survey-tool/app/domain/userInfo";
import { UserService } from "../../../../../survey-tool/app/services/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyService } from "../../../../../survey-tool/app/services/survey.service";

@Component({
  selector: 'app-stakeholders-home',
  templateUrl: `./stakeholders-home.component.html`,
  standalone: true,
  imports: [CommonModule]
})

export class StakeholdersHomeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stakeholdersService = inject(StakeholdersService);
  private surveyService = inject(SurveyService);
  private userService = inject(UserService);


  currentGroup: Stakeholder | null = null;
  latestAnswerInfo: any = null;
  loading: boolean = false;

  ngOnInit() {

    this.userService.currentStakeholder.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
      this.currentGroup = next;
    });

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      const storedGroup = this.currentGroup || JSON.parse(sessionStorage.getItem("currentStakeholder"));

      if (!storedGroup) {
        this.stakeholdersService.getStakeholder(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.userService.changeCurrentStakeholder(res);
          },
          error => console.error('Error fetching stakeholder', error));
      }

      const urlParameters = [
        {key: 'groupId', values: [id] },
        { key: 'stakeholderId', values: [id] },
        { key: 'sort', values: ['creation_date'] },
        { key: 'order', values: ['desc'] }
      ];

      this.loading = true;
      this.surveyService.getSurveyEntries(urlParameters)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            if ( res && res.results && res.results.length > 0) {
              this.latestAnswerInfo = res.results[0];
            }
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          }
        });
    })
  }

  navigateToMySurveys() {
    if ( this.currentGroup && this.currentGroup.id ) {
      this.router.navigate(['/contributions', this.currentGroup.id, 'mySurveys']);
    }
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
