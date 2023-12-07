import {APP_INITIALIZER, ErrorHandler, NgModule} from "@angular/core";
import {Router} from "@angular/router";
import * as Sentry from "@sentry/angular-ivy";
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {environment} from "../environments/environment";
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NgxMatomoTrackerModule} from '@ngx-matomo/tracker';
import {NgxMatomoRouterModule} from '@ngx-matomo/router';
import {UserService} from "../survey-tool/app/services/user.service";
import {SurveyToolModule} from "../survey-tool/app/survey-tool.module";
import {HttpInterceptorService} from "./pages/services/http-interceptor.service";
import {SharedModule} from "./shared/shared.module";
import {ArchiveGuardService} from "./pages/services/archiveGuard.service";
import {MessagingSystemModule} from "src/messaging-system-ui/app/messaging-system.module";
import {CountrySelectorComponent} from "./pages/dashboard/country-selector/country-selector.component";
import {ReusableComponentsModule} from "../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import {CountryLandingPageComponent} from "./pages/dashboard/country-landing-page/country-landing-page.component";
import {MessagingSystemService} from "../messaging-system-ui/services/messaging-system.service";
import {CountryLandingPagePoliciesComponent} from "./pages/dashboard/country-landing-page/policies-section.component";
import {CountryLandingPageGeneralComponent} from "./pages/dashboard/country-landing-page/general-section.component";
import {
  PoliciesCategoryIndicatorsComponent
} from "./pages/dashboard/country-landing-page/indicator-cards/policies-category-indicators.component";
import {
  CategoryIndicatorsWrapperComponent
} from "./pages/dashboard/country-landing-page/indicator-cards/category-indicators-wrapper.component";
import {
  PracticesCategoryIndicatorsComponent
} from "./pages/dashboard/country-landing-page/indicator-cards/practices-category-indicators.component";
import {CountryLandingPagePracticesComponent} from "./pages/dashboard/country-landing-page/practices-section.component";
import {CountryLandingPageUseCasesComponent} from "./pages/dashboard/country-landing-page/use-cases-section.component";
import {
  CategoryIndicatorsRowComponent
} from "./pages/dashboard/country-landing-page/indicators-table/category-indicators-row.component";
import {
  ContributionsHomeExtentionComponent
} from "./pages/dashboard/contribution-dashboard-extension/home/contributions-home-extention.component";

@NgModule({
  declarations: [
    AppComponent,
    CountrySelectorComponent,
    CountryLandingPageComponent,
    CountryLandingPagePoliciesComponent,
    CountryLandingPageGeneralComponent,
    CountryLandingPagePracticesComponent,
    CountryLandingPageUseCasesComponent,
    PoliciesCategoryIndicatorsComponent,
    PracticesCategoryIndicatorsComponent,
    CategoryIndicatorsWrapperComponent,
    CategoryIndicatorsRowComponent,
    ContributionsHomeExtentionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    SurveyToolModule,
    MessagingSystemModule,
    NgxMatomoTrackerModule.forRoot({trackerUrl: environment.matomoTrackerUrl, siteId: environment.matomoSiteId}),
    NgxMatomoRouterModule,
    ReusableComponentsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    UserService,
    ArchiveGuardService,
    MessagingSystemService,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    }, {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {
      },
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
