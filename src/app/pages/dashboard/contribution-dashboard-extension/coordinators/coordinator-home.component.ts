import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { Coordinator } from "../../../../../survey-tool/app/domain/userInfo";
import { UserService } from "../../../../../survey-tool/app/services/user.service";
import { ActivatedRoute } from "@angular/router";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SurveyService } from "../../../../../survey-tool/app/services/survey.service";

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

  ngOnInit() {
    this.userService.currentCoordinator.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
      this.currentGroup = next;
    });

    // ----------------------------------------------------------------
    // SUBSCRIPTION 2: URL & Data Fetching Logic (Active)
    // Reacts to URL changes (ID), checks if data exists locally/storage,
    // and fetches from API only if necessary.
    // ----------------------------------------------------------------

    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params['id'];
      if (!id) return;
      const storedGroup = this.currentGroup || JSON.parse(sessionStorage.getItem("currentCoordinator"));
      if (!storedGroup) {
        console.log('Fetching new coordinator for ID:', id);
        this.stakeholdersService.getCoordinatorById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: res => {
            this.userService.changeCurrentCoordinator(res);
          },
          error: err => {
            console.error('Error fetching coordinator', err)
          }
        });
      }
      const urlParameters = [
        {key: 'groupId', values: ['admin-eosc-sb']},
        {key: 'stakeholderId', values: [id]},
        {key: 'sort', values: ['modificationDate']},
        {key: 'order', values: ['desc']}
      ];

      // console.log('Params:', urlParameters);


      this.surveyService.getSurveyEntries(urlParameters)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            // console.log('--- SUCCESS ---');
            // console.log(res);
          },
          error: (err) => {
            // console.error('--- ERROR ---');
            console.error(err);
          }
        });
    })
  }


}
