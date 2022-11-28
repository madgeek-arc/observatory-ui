import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';
import { NgxMatomoRouterModule } from '@ngx-matomo/router';
import {ObservatoryUiModule} from "../observatoryUI/app/observatoryUi.module";
import {UserService} from "../observatoryUI/app/services/user.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // HttpClientModule,
    AppRoutingModule,
    ObservatoryUiModule,
    // CatalogueUiModule,
    // DynamicFormModule,
    // ReusableComponentsModule,
    // FormsModule,
    NgxMatomoTrackerModule.forRoot({ trackerUrl: '', siteId: '' }),
    NgxMatomoRouterModule,
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
