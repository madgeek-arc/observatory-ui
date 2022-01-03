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
