import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NgxMatomoTrackerModule} from '@ngx-matomo/tracker';
import {NgxMatomoRouterModule} from '@ngx-matomo/router';
import {ObservatoryUiModule} from "../survey-tool/app/observatoryUi.module";
import {UserService} from "../survey-tool/app/services/user.service";
import {SharedModule} from "./shared/shared.module";
import {HttpInterceptorService} from "./pages/services/http-interceptor.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    ObservatoryUiModule,
    NgxMatomoTrackerModule.forRoot({trackerUrl: '', siteId: ''}),
    NgxMatomoRouterModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
