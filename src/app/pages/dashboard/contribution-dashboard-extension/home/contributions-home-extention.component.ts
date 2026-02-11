import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {
  ContributionsHomeComponent
} from "../../../../../survey-tool/app/pages/contributions-dashboard/home/contributions-home.component";
import {Stakeholder} from "../../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../../survey-tool/app/services/user.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {combineLatest} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {StakeholdersService} from "../../../../../survey-tool/app/services/stakeholders.service";

@Component({
  selector: 'app-contributions-ext-home',
  templateUrl: './contributions-home-extention.component.html',
  standalone: false
})
export class ContributionsHomeExtentionComponent extends ContributionsHomeComponent implements OnInit {

  title: string = 'Welcome to the survey tool of the EOSC Observatory';
  text: string = 'This is a tool that is being developed by the EOSC Future project to support the EOSC Steering Board and\n' +
    '            EOSC Association in their monitoring of activities contributing to EOSC. Annual surveys will be conducted\n' +
    '            via this survey tool that are aimed at representatives of European Member States and Associated Countries\n' +
    '            (MS/AC) in the EOSC Steering Board and member organisations in the EOSC Association. The EOSC Steering Board\n' +
    '            surveys will focus on the monitoring of national policies and investments for EOSC and their impact on EOSC\n' +
    '            readiness. The EOSC Association surveys will focus on the monitoring of financial and in-kind activities\n' +
    '            that contribute to the development of EOSC and implementation of the EOSC Partnership. All current and past\n' +
    '            surveys and responses will be available on this private survey tool homepage.';

  currentStakeholder: Stakeholder | null = null;
  isManager: boolean | null = null;

  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private stakeholderService = inject(StakeholdersService);

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params['id'];
      if (id && !this.userService.currentStakeholder.getValue()) {
        this.stakeholderService.getStakeholder(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: res => {
            this.userService.changeCurrentStakeholder(res);
          },
          error: (err) => console.error('Error loading Stakeholder', err)
        })
      }
    })

    combineLatest([
      this.userService.currentStakeholder,
      this.userService.getUserObservable()
    ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(([stakeholder, userInfo]) => {
      if (!stakeholder || !userInfo || !userInfo.user) {
        return;
      }
      this.currentStakeholder = stakeholder;
      this.isManager = this.checkIfManager();
    });
  }

  checkIfManager(): boolean {
    const userInfo = this.userService.getCurrentUserInfo();
    if (this.currentStakeholder) {
      for (const email of this.currentStakeholder.admins) {
        if (userInfo.user.email === email) {
          return true;
        }
      }
    }
    return false;
  }
}
