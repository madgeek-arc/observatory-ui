import {Component, OnInit, ViewChild} from "@angular/core";
import {UserService} from "../../services/user.service";
import {MemberOf, UserInfo} from "../../domain/userInfo";
import {Router} from "@angular/router";
import {LoginService} from "../../services/login.service";

import * as UIkit from 'uikit';

@Component({
  selector: 'app-contributions-dashboard',
  templateUrl: 'contributions-dashboard.component.html',
  providers: [UserService, LoginService]
})

export class ContributionsDashboardComponent implements OnInit{

  open: boolean = true;
  userInfo: UserInfo;
  currentStakeholderGroup: MemberOf = null;

  constructor(public userService: UserService, public loginService: LoginService, public router: Router) {
    this.userService.getUserInfo().subscribe(
      res => {
        this.userInfo = res;
        this.userService.changeCurrentGroup(this.userInfo.memberOf[0]);
        this.userService.userId = this.userInfo.user.email;
      }, error => {
        console.log('skata');
        this.router.navigate(['/home']);
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
      console.log(value);
      this.userService.setUserConsent(value).subscribe(
        next => {
          UIkit.modal('#consent-modal').hide();
          if (!value) {
            this.loginService.logout();
          }
        },
        error => {
          console.log(error);
          UIkit.modal('#consent-modal').hide()
          this.loginService.logout();
        },
        () => {UIkit.modal('#consent-modal').hide()}
      );
  }

}
