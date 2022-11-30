import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {TopMenuLandingComponent} from "./top-menu/topmenulanding/top-menu-landing.component";
import {TopMenuDashboardComponent} from "./top-menu/topmenudashboard/top-menu-dashboard.component";
import {TopMenuPublicDashboardComponent} from "./top-menu/topmenupublicdashboard/top-menu-public-dashboard.component";
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
    TopMenuPublicDashboardComponent,
    FooterComponent
  ],
  declarations: [
    TopMenuLandingComponent,
    TopMenuDashboardComponent,
    TopMenuPublicDashboardComponent,
    FooterComponent
  ]
})

export class SharedModule {}
