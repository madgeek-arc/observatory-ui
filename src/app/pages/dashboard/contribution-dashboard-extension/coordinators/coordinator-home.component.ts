import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {Coordinator} from "../../../../../survey-tool/app/domain/userInfo";
import {Subject} from "rxjs";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: "app-coordinator-home",
  templateUrl: "./coordinator-home.component.html",
  standalone: true,
})
export class CoordinatorHomeComponent implements OnInit {
  currentGroup: Coordinator | null = null;
  private destroyRef = inject(DestroyRef);

  private userService = inject(UserService);
  private stakeholdersService = inject(StakeholdersService);
  private route = inject(ActivatedRoute);

  constructor() {}

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
        this.stakeholdersService.getCoordinatorById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.userService.changeCurrentCoordinator(res);
          },
          error => console.error('Error fetching coordinator', error));
      }
    })
  }


}
