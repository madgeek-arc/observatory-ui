import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {UserInfo} from "../../domain/userInfo";
import {Router} from "@angular/router";

import * as UIkit from 'uikit';
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html',
})

export class ContributionsDashboardComponent implements OnInit{

  open: boolean = true;
  consent: boolean = false;
  userInfo: UserInfo;

  constructor(public userService: UserService, public authentication: AuthenticationService, public router: Router) {
    this.userService.getUserInfo().subscribe(
      res => {
        this.userInfo = res;
        this.userService.userId = this.userInfo.user.email;
        this.setGroup();
      }, error => {
        console.log(error);
      },
      () => {
        if (!this.userInfo.user.consent) {
          UIkit.modal('#consent-modal').show();
        }
      }
    );
  }

  ngOnInit() {
  }

  setGroup() {
    if (sessionStorage.getItem('currentStakeholder')) {
      const stakeholderId = sessionStorage.getItem('currentStakeholder');
      for (let stakeholder of this.userInfo.stakeholders) {
        if (stakeholderId === stakeholder.id) {
          this.userService.changeCurrentStakeholder(stakeholder);
        }
      }
    } else if (sessionStorage.getItem('currentCoordinator')) {
      console.log('Coordinator');
      const coordinatorId = sessionStorage.getItem('currentCoordinator');
      for (let coordinator of this.userInfo.coordinators) {
        if (coordinatorId === coordinator.id) {
          this.userService.changeCurrentCoordinator(coordinator);
        }
      }
    } else {
      if (this.userInfo.stakeholders.length) {
        this.userService.changeCurrentStakeholder(this.userInfo.stakeholders[0]);
      } else {
        this.userService.changeCurrentCoordinator(this.userInfo.coordinators[0]);
      }
    }
  }

  updateConsent() {
      this.userService.setUserConsent(this.consent).subscribe(
        next => {
          UIkit.modal('#consent-modal').hide();
          if (!this.consent) {
            this.authentication.logout();
          }
        },
        error => {
          console.log(error);
          UIkit.modal('#consent-modal').hide()
          this.authentication.logout();
        },
        () => {UIkit.modal('#consent-modal').hide()}
      );
  }

}
