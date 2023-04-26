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
import {MessagingSystemModule} from "../messaging-system-ui/app/messaging-system.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    SurveyToolModule,
    MessagingSystemModule,
    NgxMatomoTrackerModule.forRoot({trackerUrl: environment.matomoTrackerUrl, siteId: environment.matomoSiteId}),
    NgxMatomoRouterModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    UserService,
    ArchiveGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
