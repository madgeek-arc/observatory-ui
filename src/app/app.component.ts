import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {AuthenticationService} from "../observatoryUI/app/services/authentication.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'observatory-ui';

  constructor(private router: Router, private auth: AuthenticationService) {
    this.auth.redirect();
  }

  isContributionsDashboardRoute() {
    return (this.router.url.startsWith('/contributions'));
  }

  isEOSCReadinessDashboardRoute() {
    return (this.router.url.startsWith('/eoscreadiness'));
  }

}
