/**
 * Created by stefania on 4/6/17.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ForbiddenPageComponent } from './403-forbidden-page.component';
import { ReadMoreComponent, ReadMoreTextComponent } from './read-more.component';
import { TopMenuDashboardComponent } from "../top-menu/topmenudashboard/top-menu-dashboard.component";
import { SideMenuDashboardComponent } from "../sidemenudashboard/side-menu-dashboard.component";
import { FooterComponent } from "../footer/footer.component";
import { TopMenuLandingComponent } from "../top-menu/topmenulanding/top-menu-landing.component";
import { HighchartsChartModule } from "highcharts-angular";
import { HighchartsTilemapComponent } from "./charts/highcharts-tilemap.component";
import { HighchartsCategoryMapComponent } from "./charts/highcharts-category-map.component";
import {HighchartsPieComponent} from "./charts/highcharts-pie.component";
import {HighchartsHighlightedAreasMapComponent} from "./charts/highcharts-highlighted-areas-map.component";
// import { SideMenuComponent } from "../sidemenu/sidemenu.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    // TabsModule.forRoot(),
    // ModalModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HighchartsChartModule
  ],
  declarations: [
    TopMenuLandingComponent,
    TopMenuDashboardComponent,
    SideMenuDashboardComponent,
    // SideMenuComponent,
    FooterComponent,
    ForbiddenPageComponent,
    ReadMoreComponent,
    ReadMoreTextComponent,
    HighchartsTilemapComponent,
    HighchartsCategoryMapComponent,
    HighchartsHighlightedAreasMapComponent,
    HighchartsPieComponent
  ],
  exports: [
    TopMenuLandingComponent,
    TopMenuDashboardComponent,
    SideMenuDashboardComponent,
    // SideMenuComponent,
    FooterComponent,
    ForbiddenPageComponent,
    ReadMoreComponent,
    ReadMoreTextComponent,
    HighchartsTilemapComponent,
    HighchartsCategoryMapComponent,
    HighchartsHighlightedAreasMapComponent,
    HighchartsPieComponent
  ],
  providers: [
    // HelpContentService
  ],
})

export class ReusableComponentsModule {
}
