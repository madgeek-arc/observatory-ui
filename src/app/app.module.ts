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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SurveyFormComponent,
    ContributionsDashboardComponent
  ],
  imports: [
    BrowserModule,
    CatalogueUiModule,
    AppRoutingModule,
    DynamicFormModule,
    ReusableComponentsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
