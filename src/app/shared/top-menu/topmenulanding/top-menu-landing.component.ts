import {Component, OnDestroy, OnInit} from "@angular/core";
import {Coordinator, Stakeholder, UserInfo} from "../../../../survey-tool/app/domain/userInfo";
import {UserService} from "../../../../survey-tool/app/services/user.service";
import {AuthenticationService} from "../../../../survey-tool/app/services/authentication.service";
import {Router} from "@angular/router";
import {Subscriber} from "rxjs";

@Component({
  selector: 'app-top-menu-landing',
  templateUrl: 'top-menu-landing.component.html',
  styleUrls: ['../top-menu.component.css'],
})

export class TopMenuLandingComponent implements OnInit, OnDestroy {

  subscriptions = [];
  showLogin = true;
  showNationalContributionsToEOSC: boolean = null;
  // showArchive: boolean = null;
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
            this.showNationalContributionsToEOSC = this.coordinatorOrManager('eosc-sb');
            // this.showArchive = this.coordinatorContains('country');
          },
          error => {
            console.error(error);
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
}
