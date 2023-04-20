import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TopMenuLandingComponent} from "./top-menu/topmenulanding/top-menu-landing.component";
import {TopMenuDashboardComponent} from "./top-menu/topmenudashboard/top-menu-dashboard.component";
import {RouterModule} from "@angular/router";
import {FooterComponent} from "./footer/footer.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    TopMenuLandingComponent,
    TopMenuDashboardComponent,
    FooterComponent
  ],
  declarations: [
    TopMenuLandingComponent,
    TopMenuDashboardComponent,
    FooterComponent
  ]
})

export class SharedModule {}
