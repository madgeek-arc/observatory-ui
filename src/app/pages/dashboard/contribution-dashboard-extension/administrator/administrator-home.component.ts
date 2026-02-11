import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { StakeholdersService } from "../../../../../survey-tool/app/services/stakeholders.service";
import { UserService } from "../../../../../survey-tool/app/services/user.service";
import { Administrator } from "../../../../../survey-tool/app/domain/userInfo";

@Component({
  selector: "app-administrator-home",
  templateUrl: "./administrator-home.component.html",
  standalone: true,
})
export class AdministratorHomeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private stakeholdersService = inject(StakeholdersService);
  private userService = inject(UserService);

  currentGroup: Administrator | null = null;

  ngOnInit() {
    this.userService.currentAdministrator.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(next => {
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
      const storedGroup = this.currentGroup || JSON.parse(sessionStorage.getItem("currentAdministrator"));
      if (!storedGroup) {
        // console.log('Fetching new administrator for ID:', id);
        this.stakeholdersService.getAdministratorById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: res => {
            this.userService.changeCurrentAdministrator(res);
          },
          error: err => {
            console.error('Error fetching administrator', err)
          }
        });
      }
    });
  }

}
