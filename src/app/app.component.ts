import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter, map, startWith } from "rxjs/operators";
import { AuthenticationService } from "../survey-tool/app/services/authentication.service";
import { DashboardSideMenuService } from "../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent {
  private layoutService = inject(DashboardSideMenuService);
  private router = inject(Router);
  private auth = inject(AuthenticationService);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    )
  );

  isContributionsDashboardRoute = computed(() =>
    this.currentUrl()?.startsWith('/contributions')
  );

  isEOSCReadinessDashboardRoute = computed(() => {
    const url = this.currentUrl() ?? '';
    return (
      url.startsWith('/eoscreadiness') ||
      url.startsWith('/explore') ||
      url.startsWith('/country/')
    );
  });

  isFormBuilderRoute = computed(() =>
    this.currentUrl()?.startsWith('/fb')
  );

  title = 'observatory-ui';
  smallScreen= false;
  isOpen = true;

  constructor() {
    this.auth.redirect();

    this.layoutService.isMobile.subscribe(isMobile => {
      this.smallScreen = isMobile;
    });

    this.layoutService.isOpen.subscribe(open => {
      this.isOpen = open;
    });
  }

  // isContributionsDashboardRoute() {
  //   return (this.router.url.startsWith('/contributions'));
  // }
  //
  // isEOSCReadinessDashboardRoute() {
  //   return (this.router.url.startsWith('/eoscreadiness')
  //     || this.router.url.startsWith('/explore')
  //     || this.router.url.startsWith('/country/')
  //   );
  // }

}
