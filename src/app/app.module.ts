import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { appProviders } from './app.config';
import { SurveyToolModule } from "../survey-tool/app/survey-tool.module";
import { ReusableComponentsModule } from "../survey-tool/app/shared/reusablecomponents/reusable-components.module";
import { CountryLandingPageComponent } from "./pages/dashboard/country-landing-page/country-landing-page.component";
import { CountryLandingPagePoliciesComponent } from "./pages/dashboard/country-landing-page/policies-section.component";
import { CountryLandingPageGeneralComponent } from "./pages/dashboard/country-landing-page/general-section.component";
import {
  PoliciesCategoryIndicatorsComponent
} from "./pages/dashboard/country-landing-page/indicator-cards/policies-category-indicators.component";
import {
  CategoryIndicatorsWrapperComponent
} from "./pages/dashboard/country-landing-page/indicator-cards/category-indicators-wrapper.component";
import {
  PracticesCategoryIndicatorsComponent
} from "./pages/dashboard/country-landing-page/indicator-cards/practices-category-indicators.component";
import {
  CountryLandingPagePracticesComponent
} from "./pages/dashboard/country-landing-page/practices-section.component";
import {
  CountryLandingPageUseCasesComponent
} from "./pages/dashboard/country-landing-page/use-cases-section.component";
import {
  CategoryIndicatorsRowComponent
} from "./pages/dashboard/country-landing-page/indicators-table/category-indicators-row.component";
import {
  ContributionsHomeExtentionComponent
} from "./pages/dashboard/contribution-dashboard-extension/home/contributions-home-extention.component";
import { ChartsModule } from "./shared/charts/charts.module";
import { SharedModule } from './shared/shared.module';
import {
  ContributionsDashboardComponent
} from "../survey-tool/app/pages/contributions-dashboard/contributions-dashboard.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageContentComponent } from "../survey-tool/app/shared/page-content/page-content.component";
import {
  SidebarMobileToggleComponent
} from "../survey-tool/app/shared/dashboard-side-menu/mobile-toggle/sidebar-mobile-toggle.component";
import {
  StakeholdersHomeComponent
} from "./pages/dashboard/contribution-dashboard-extension/stakeholders/stakeholders-home.component";
import { CookieConsentComponent } from "./shared/cookies/cookie-consent.component";


@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ChartsModule,
        RouterModule,
        SurveyToolModule,
        ReusableComponentsModule,
        SharedModule,
        ContributionsDashboardComponent,
        BrowserAnimationsModule,
        PageContentComponent,
        SidebarMobileToggleComponent,
        StakeholdersHomeComponent,
        CookieConsentComponent,
        CountryLandingPageComponent,
        CountryLandingPagePoliciesComponent,
        CountryLandingPageGeneralComponent,
        CountryLandingPagePracticesComponent,
        CountryLandingPageUseCasesComponent,
        PoliciesCategoryIndicatorsComponent,
        PracticesCategoryIndicatorsComponent,
        CategoryIndicatorsWrapperComponent,
        CategoryIndicatorsRowComponent,
        ContributionsHomeExtentionComponent,
    ],
    providers: appProviders,
    bootstrap: [AppComponent]
})

export class AppModule {
}
