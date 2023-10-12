import {NgModule} from '@angular/core';
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
  PoliciesCategoryIndicatorsCardComponent
} from "./pages/dashboard/country-landing-page/indicator-cards/policies-category-indicators-card.component";
import {
  PoliciesSubcategoriesIndicatorsCardComponent
} from "./pages/dashboard/country-landing-page/indicator-cards/policies-subcategories-indicators-card.component";

@NgModule({
  declarations: [
    AppComponent,
    CountrySelectorComponent,
    CountryLandingPageComponent,
    CountryLandingPagePoliciesComponent,
    CountryLandingPageGeneralComponent,
    PoliciesCategoryIndicatorsCardComponent,
    PoliciesSubcategoriesIndicatorsCardComponent
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
    MessagingSystemService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
