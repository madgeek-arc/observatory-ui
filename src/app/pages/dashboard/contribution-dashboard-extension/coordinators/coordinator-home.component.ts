import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {Coordinator} from "../../../../../survey-tool/app/domain/userInfo";
import {Subject} from "rxjs";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {takeUntil} from "rxjs/operators";
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
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.userService.currentCoordinator.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
          console.log(next);
          this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem("currentCoordinator"));

          if (this.currentGroup != null && this.currentGroup.id === id) {

          } else {
            console.log("Current coordinator was not found");
            this.stakeholdersService.getCoordinatorById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
              res => {
                this.currentGroup = res;
                this.userService.changeCurrentCoordinator(res);

              },
              error => console.error('Error fetching coordinator', error))
          }
        })
      }
    })
  }
}
