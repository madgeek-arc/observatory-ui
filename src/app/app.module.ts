import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HomeComponent} from "./pages/home.component";
import {CatalogueUiModule} from "../catalogue-ui/catalogue-ui.module";
import {SurveyFormComponent} from "./pages/survey-form/survey-form.component";
import {DynamicFormModule} from "../catalogue-ui/pages/dynamic-form/dynamic-form.module";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SurveyFormComponent
  ],
  imports: [
    BrowserModule,
    CatalogueUiModule,
    AppRoutingModule,
    DynamicFormModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
