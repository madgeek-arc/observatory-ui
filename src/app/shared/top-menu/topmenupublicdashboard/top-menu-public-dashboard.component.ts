import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {Coordinator, Stakeholder, UserInfo} from "../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../survey-tool/app/services/user.service";
import {Router} from "@angular/router";
import {AuthenticationService} from "../../../../survey-tool/app/services/authentication.service";
import {PrivacyPolicyService} from "../../../../survey-tool/app/services/privacy-policy.service";

import * as UIkit from 'uikit';
import {AcceptedPrivacyPolicy} from "../../../../survey-tool/app/domain/privacy-policy";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-top-menu-public-dashboard',
  templateUrl: 'top-menu-public-dashboard.component.html',
  styleUrls: ['../top-menu.component.css'],
  providers: [PrivacyPolicyService]
})

export class TopMenuPublicDashboardComponent implements OnInit, OnDestroy {
  subscriptions = [];
  showLogin = true;
  showNationalContributionsToEOSC: boolean = null;
  showArchive: boolean = null;
  ready = false;
  userInfo: UserInfo = null;

  constructor(private userService: UserService, private authentication: AuthenticationService, private router: Router) {
  }

  ngOnInit() {
    if (this.authentication.authenticated) {
      this.subscriptions.push(
        this.userService.getUserInfo().subscribe(
          next => {
            this.userService.setUserInfo(next);
            this.userInfo = next;
            this.showLogin = false
            this.ready = true;
            this.showNationalContributionsToEOSC = this.coordinatorOrManager('country');
            this.showArchive = this.coordinatorContains('country');
          },
          error => {
            console.log(error);
            this.ready = true;
          }
        )
      );
    } else {
      this.ready = true;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription instanceof Subscriber) {
        subscription.unsubscribe();
      }
    });
  }

  setGroup(group: Stakeholder) {
    // console.log(group)
    this.userService.changeCurrentStakeholder(group);
    this.router.navigate([`/contributions/${group.id}/home`]);
  }

  setCoordinator(coordinator: Coordinator){
    this.userService.changeCurrentCoordinator(coordinator);
    this.router.navigate([`/contributions/${coordinator.id}/home`]);
  }

  coordinatorOrManager(name: string) {
    if (this.userInfo.coordinators.filter(c => c.type === name).length > 0) {
      return true;
    } else if (this.userInfo.stakeholders.filter(c => c.type === name).length > 0) {
      let stakeHolders: Stakeholder[] = this.userInfo.stakeholders.filter(c => c.type === name);
      let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      for (const stakeHolder of stakeHolders) {
        // console.log(stakeHolder.name);
        if (stakeHolder.managers.indexOf(userInfo.user.email) >= 0)
          return true;
      }
      return false
    } else {
      return false
    }

  }

  coordinatorContains(name: string): boolean {
    return this.userInfo.coordinators.filter(c => c.type === name).length > 0;
  }

  logInButton() {
    this.authentication.login();
  }

  logout() {
    this.authentication.logout();
  }

  change() {
    const el: HTMLElement = document.getElementById('hamburger');
    if(el.classList.contains('change')) {
      el.classList.remove('change');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.remove('sidebar_main_active');
    } else {
      el.classList.add('change');
      const el1: HTMLElement = document.getElementById('sidebar_main_content');
      el1.classList.add('sidebar_main_active');
    }
  }
}
