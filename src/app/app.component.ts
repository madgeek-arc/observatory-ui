import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgStyle } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter, map, startWith } from "rxjs/operators";
import { AuthenticationService } from "../survey-tool/app/services/authentication.service";
import { DashboardSideMenuService } from "../survey-tool/app/shared/dashboard-side-menu/dashboard-side-menu.service";
import { ContributionsDashboardComponent } from "../survey-tool/app/pages/contributions-dashboard/contributions-dashboard.component";
import { CookieConsentComponent } from "./shared/cookies/cookie-consent.component";
import { FullFooterComponent } from "./shared/footer/full-footer.component";
import { TopMenuDashboardComponent } from "./shared/top-menu/topmenudashboard/top-menu-dashboard.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        NgStyle,
        RouterOutlet,
        TopMenuDashboardComponent,
        ContributionsDashboardComponent,
        FullFooterComponent,
        CookieConsentComponent
    ]
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
  hasHeader = true;
  showFooter = true;

  constructor() {
    this.auth.redirect();

    this.layoutService.isMobile.subscribe(isMobile => {
      this.smallScreen = isMobile;
    });

    this.layoutService.isOpen.subscribe(open => {
      this.isOpen = open;
    });

    this.layoutService.hasHeader.subscribe(hasHeader => {
      this.hasHeader = hasHeader;
    });

    this.layoutService.showFooter.subscribe(showFooter => {
      this.showFooter = showFooter;
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
