import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./pages/home.component";
import {AcceptInvitationComponent} from "./pages/accept-invitation.component.ts/accept-invitation.component";
import {AuthenticationGuardService} from "./services/authentication-guard.service";
import {FormBuilderComponent} from "../catalogue-ui/pages/form-builder/form-builder.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'fb',
    component: FormBuilderComponent
  },
  {
    path: 'invitation/accept/:invitationToken',
    component: AcceptInvitationComponent,
    canActivate: [AuthenticationGuardService]
  },
  {
    path: 'contributions/:id',
    loadChildren: () => import('./pages/contributions-dashboard/contributions-dashboard.module').then(m => m.ContributionsDashboardModule),
  },
  {
    path: 'nationalContributionsToEOSC',
    loadChildren: () => import('./pages/national-contributions-to-eosc-dashboard/national-contributions-to-eosc-dashboard.module').then(m => m.NationalContributionsToEOSCDashboardModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
