import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Stakeholder} from "../../../../../survey-tool/app/domain/userInfo";
import {Subject} from "rxjs";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SurveyService} from "../../../../../survey-tool/app/services/survey.service";

@Component({
  selector: 'app-stakeholders-home',
  templateUrl: `./stakeholders-home.component.html`,
  standalone: true,
  imports: [CommonModule]
})

export class StakeholdersHomeComponent implements OnInit {
  currentGroup: Stakeholder | null = null;
  private destroyRef = inject(DestroyRef);

  private userService = inject(UserService);
  private stakeholdersService = inject(StakeholdersService);
  private route = inject(ActivatedRoute);

  constructor() {}

  ngOnInit() {
    this.userService.currentStakeholder.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
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
      const storedGroup = this.currentGroup || JSON.parse(sessionStorage.getItem("currentStakeholder"));
      if (!storedGroup) {
        console.log('Fetching new stakeholder for ID:', id);
        this.stakeholdersService.getStakeholder(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.userService.changeCurrentStakeholder(res);
          },
          error => console.error('Error fetching stakeholder', error));
      }
    })
  }
}
