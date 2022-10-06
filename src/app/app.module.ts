import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HomeComponent} from "./pages/home.component";
import {CatalogueUiModule} from "../catalogue-ui/catalogue-ui.module";
import {SurveyFormComponent} from "./pages/contributions-dashboard/my-surveys/survey-form/survey-form.component";
import {DynamicFormModule} from "../catalogue-ui/pages/dynamic-form/dynamic-form.module";
import {ContributionsDashboardComponent} from "./pages/contributions-dashboard/contributions-dashboard.component";
import {ReusableComponentsModule} from "./shared/reusablecomponents/reusable-components.module";
import {UserService} from "./services/user.service";
import {AuthenticationService} from "./services/authentication.service";
import {AuthenticationGuardService} from "./services/authentication-guard.service";
import {FormsModule} from "@angular/forms";
import {SurveyService} from "./services/survey.service";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {HttpInterceptorService} from "./services/http-interceptor.service";
import {AcceptInvitationComponent} from "./pages/accept-invitation.component.ts/accept-invitation.component";
import {ArchiveComponent} from "./pages/national-contributions-to-eosc-dashboard/archive/archive.component";
import {NationalContributionsToEOSCGuardService} from "./services/nationalContributionsToEOSC-guard.service";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SurveyFormComponent,
    ContributionsDashboardComponent,
    AcceptInvitationComponent,
    // NationalContributionsToEOSCDashboardComponent
  ],
  imports: [
    BrowserModule,
    CatalogueUiModule,
    AppRoutingModule,
    DynamicFormModule,
    ReusableComponentsModule,
    FormsModule,
  ],
  providers: [
    AuthenticationService,
    AuthenticationGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    NationalContributionsToEOSCGuardService,
    UserService,
    SurveyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
