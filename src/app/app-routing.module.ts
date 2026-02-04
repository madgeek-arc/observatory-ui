import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from "./pages/home/home.component";
import { CountryLandingPageComponent } from "./pages/dashboard/country-landing-page/country-landing-page.component";
import {
  ContributionsHomeExtentionComponent
} from "./pages/dashboard/contribution-dashboard-extension/home/contributions-home-extention.component";
import { AuthGuard } from "../survey-tool/app/services/auth-guard.service";
import { countryPagesRoutes } from "./pages/country-pages/country-pages.routing";
import { CountrySelectorComponent } from "./pages/dashboard/country-selector/country-selector.component";
import { ArchiveModule } from "./pages/archive/archive.module";
import { ArchiveGuardService } from "./pages/services/archiveGuard.service";
import {
  ContributionsHomeComponent
} from "../survey-tool/app/pages/contributions-dashboard/home/contributions-home.component";
import { ReportCreationComponent } from "./pages/report-creation/report-creation.component";
import {
  StakeholdersHomeComponent
} from "./pages/dashboard/contribution-dashboard-extension/stakeholders/stakeholders-home.component";
import {
  CoordinatorHomeComponent
} from "./pages/dashboard/contribution-dashboard-extension/coordinators/coordinator-home.component";
import {
  AdministratorHomeComponent
} from "./pages/dashboard/contribution-dashboard-extension/administrator/administrator-home.component";

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: "enabled",
  anchorScrolling: "enabled",
  // scrollOffset: [0, 64],
  // enableTracing: true
};

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
    path: 'about/:selector',
    loadComponent: () => import('./pages/iframe-loader/iframe-loader.component').then(m => m.IframeLoaderComponent),
  },
  {
    path: 'resources/:selector',
    loadComponent: () => import('./pages/iframe-loader/iframe-loader.component').then(m => m.IframeLoaderComponent),
  },
  {
    path: 'country_selector',
    component: CountrySelectorComponent,
    canActivate: [ArchiveGuardService]
  },
  {
    path: 'landing/country/:code',
    component: CountryLandingPageComponent,
    canActivate: [ArchiveGuardService]
  },
  {
    path: 'country-pages',
    loadComponent: () => import('./pages/dashboard/country-selector/country-selector.component').then(m => m.CountrySelectorComponent),
  },
  {
    path: 'country/:code',
    children: countryPagesRoutes
  },
  {
    path: 'explore',
    loadChildren: () => import('./pages/explore/explore.module').then(m => m.ExploreModule),
  },
  {
    path: 'eoscreadiness',
    loadChildren: () => import('./pages/eosc-readiness-dashboard/eosc-readiness-dashboard.module').then(m => m.EoscReadinessDashboardModule),
  },
  {
    path: 'archive',
    loadChildren: () => import('./pages/archive/archive.module').then(m => m.ArchiveModule)
  },
  {
    path: 'contributions/:id',
    loadChildren: () => import('../messaging-system-ui/app/messaging-system.module').then(m => m.MessagingSystemModule),
  },
  {
    path: 'contributions/:stakeholderId/resources-registry',
    loadChildren: () => import('./pages/explore/resources-registry/resources-registry.module').then(m => m.ResourcesRegistryModule),
  },
  {
    path: 'contributions/:id/',
    pathMatch: 'full',
    redirectTo: 'contributions/:id/home'
  },
  {
    path: 'contributions/:id/stakeholder',
    component: StakeholdersHomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contributions/:id/coordinator',
    component: CoordinatorHomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contributions/:id/administrator',
    component: AdministratorHomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reportExport',
    component: ReportCreationComponent,
    canActivate: [AuthGuard],
    // data: {
    //   hasSidebar: false,
    //   showFooter: false,
    // }
  },
  {
    path: '',
    loadChildren: () => import('../survey-tool/app/survey-tool.module').then(m => m.SurveyToolModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
