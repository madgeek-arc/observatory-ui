import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../catalogue-ui/services/user.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [UserService]
})
export class AppComponent {
  title = 'observatory-ui';

  constructor(private router: Router) {
  }

  isContributionsDashboardRoute() {
    return (this.router.url.startsWith('/contributions'));
  }

  logInButton() {
    window.location.href = '/observatory/login';
  }
}
