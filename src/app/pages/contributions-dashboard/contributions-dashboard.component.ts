import {Component, OnInit, ViewChild} from "@angular/core";
import {UserService} from "../../services/user.service";
import {Stakeholder, UserInfo} from "../../domain/userInfo";
import {Router} from "@angular/router";

import * as UIkit from 'uikit';
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html',
})

export class ContributionsDashboardComponent implements OnInit{

  open: boolean = true;
  userInfo: UserInfo;

  constructor(public userService: UserService, public authentication: AuthenticationService, public router: Router) {
    this.userService.getUserInfo().subscribe(
      res => {
        this.userInfo = res;
        this.userService.changeCurrentStakeholder(this.userInfo.stakeholders[0]);
        this.userService.userId = this.userInfo.user.email;
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

  updateConsent(value: boolean) {
      this.userService.setUserConsent(value).subscribe(
        next => {
          UIkit.modal('#consent-modal').hide();
          if (!value) {
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
