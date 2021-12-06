import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "./services/user.service";
import {LoginService} from "./services/login.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [UserService, LoginService]
})
export class AppComponent {
  title = 'observatory-ui';

  constructor(private router: Router, private loginService: LoginService) {
  }

  isContributionsDashboardRoute() {
    return (this.router.url.startsWith('/contributions'));
  }

  logInButton() {
    this.loginService.login();
    // window.location.href = 'http://localhost:8280/observatory/login';
  }
}
