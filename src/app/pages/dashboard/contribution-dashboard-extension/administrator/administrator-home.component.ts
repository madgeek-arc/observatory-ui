import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {Administrator, Stakeholder} from "../../../../../survey-tool/app/domain/userInfo";
import {Subject} from "rxjs";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";
import {takeUntil} from "rxjs/operators";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: "app-administrator-home",
  templateUrl: "./administrator-home.component.html",
  standalone: true,
})
export class AdministratorHomeComponent implements OnInit {
  currentGroup: Administrator | null = null;
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
        this.userService.currentAdministrator.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
          this.currentGroup = !!next ? next : JSON.parse(sessionStorage.getItem("currentAdministrator"));

          if (this.currentGroup !== null && this.currentGroup.id === id) {

          } else {
            this.stakeholdersService.getAdministratorById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
              res => {
                this.currentGroup = res;
                this.userService.changeCurrentAdministrator(res);
              },
              error => console.error('Error fetching administrators', error))
          }
        })
      }
    })
  }
}
