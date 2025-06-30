import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {AuthenticationService} from "../survey-tool/app/services/authentication.service";
import { DashboardSideMenuService } from "../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'observatory-ui';

  constructor(private router: Router, private auth: AuthenticationService, private layoutService: DashboardSideMenuService) {
    this.auth.redirect();
  }

  isContributionsDashboardRoute() {
    return (this.router.url.startsWith('/contributions'));
  }

  isEOSCReadinessDashboardRoute() {
    return (this.router.url.startsWith('/eoscreadiness')
      || this.router.url.startsWith('/explore')
      || this.router.url.startsWith('/country/')
    );
  }

}
