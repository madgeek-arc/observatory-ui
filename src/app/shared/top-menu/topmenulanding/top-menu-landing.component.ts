import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {MemberOf, UserInfo} from "../../../domain/userInfo";
import {UserService} from "../../../services/user.service";
import {Router} from "@angular/router";
import {LoginService} from "../../../services/login.service";

@Component({
  selector: 'app-top-menu-landing',
  templateUrl: 'top-menu-landing.component.html',
  styleUrls: ['../top-menu.component.css'],
  providers: [LoginService]
})

export class TopMenuLandingComponent implements OnInit {

  showLogin = true;
  userInfo: UserInfo = null;

  constructor(private userService: UserService, private loginService: LoginService) {
  }

  ngOnInit() {
    this.userService.getUserInfo().subscribe(next => {
      this.userInfo = next;
      this.showLogin = false
    });
  }

  logInButton() {
    this.loginService.login();
  }

  logout() {
    this.loginService.logout();
  }
}
