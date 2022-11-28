import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "../observatoryUI/app/pages/home.component";
import {AcceptInvitationComponent} from "../observatoryUI/app/pages/accept-invitation.component.ts/accept-invitation.component";
import {AuthenticationGuardService} from "../observatoryUI/app/services/authentication-guard.service";
import {FormBuilderComponent} from "../observatoryUI/catalogue-ui/pages/form-builder/form-builder.component";

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../observatoryUI/app/observatoryUi.module').then(m => m.ObservatoryUiModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
