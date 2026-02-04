import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Stakeholder} from "../../../../../survey-tool/app/domain/userInfo";
import {Subject} from "rxjs";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {takeUntil} from "rxjs/operators";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

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
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params['id'];
      console.log(id);
      if (id) {
        this.userService.currentStakeholder.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
          this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem("currentStakeholder"));

          if (this.currentGroup !== null && this.currentGroup.id === id) {

          } else {
            this.stakeholdersService.getStakeholder(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
              res => {
                this.currentGroup = res;
                this.userService.changeCurrentStakeholder(res);
              },
              error => console.error('Error fetching stakeholders', error))
          }
        })
      }
    })
  }
}
