import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./pages/home.component";
import {ChapterComponent} from "../catalogue-ui/pages/dynamic-form/chapter.component";

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
    path: 'form',
    component: ChapterComponent
  },
  {
    path: 'contributions',
    loadChildren: () => import('./pages/contributions-dashboard/contributions-dashboard.module').then(m => m.ContributionsDashboardModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
