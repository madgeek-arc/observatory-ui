import { Routes } from '@angular/router';
import { HomeComponent } from "./pages/home/home.component";
import { CountryLandingPageComponent } from "./pages/dashboard/country-landing-page/country-landing-page.component";
import {
  ContributionsHomeExtentionComponent
} from "./pages/dashboard/contribution-dashboard-extension/home/contributions-home-extention.component";
import { AuthGuard } from "../survey-tool/app/services/auth-guard.service";
import { countryPagesRoutes } from "./pages/country-pages/country-pages.routing";
import { countryPagesConfigurationRoutes } from "./pages/country-pages-configuration/country-pages-configuration.routing";
import { CountrySelectorComponent } from "./pages/dashboard/country-selector/country-selector.component";
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
import { NewsAndStoriesComponent } from "./pages/dashboard/contribution-dashboard-extension/news-and-stories/news-and-stories.component";

export const routes: Routes = [
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
    path: 'country/:code/configuration',
    children: countryPagesConfigurationRoutes
  },
  {
    path: 'explore',
    loadChildren: () => import('./pages/explore/explore.routes').then(m => m.EXPLORE_ROUTES),
  },
  {
    path: 'eoscreadiness',
    loadChildren: () => import('./pages/eosc-readiness-dashboard/eosc-readiness-dashboard.routes').then(m => m.EOSC_READINESS_ROUTES),
  },
  {
    path: 'archive',
    loadChildren: () => import('./pages/archive/archive.routes').then(m => m.ARCHIVE_ROUTES)
  },
  {
    path: 'contributions/:id',
    loadChildren: () => import('../messaging-system-ui/app/messaging-system.routes').then(m => m.MESSAGING_SYSTEM_ROUTES),
  },
  {
    path: 'contributions/:stakeholderId/resources-registry',
    loadChildren: () => import('./pages/explore/resources-registry/resources-registry.routes').then(m => m.resourcesRegistryRoutes),
  },
  {
    path: 'contributions/:id/',
    pathMatch: 'full',
    redirectTo: 'contributions/:id/home'
  },
  {
    path: 'contributions/:id/stakeholder',
    component: ContributionsHomeExtentionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contributions/:id/news-and-stories',
    component: NewsAndStoriesComponent,
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
    path: 'contact',
    loadChildren: () => import('../messaging-system-ui/app/messaging-system.routes').then(m => m.CONTACT_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('../survey-tool/app/survey-tool.routes').then(m => m.SURVEY_TOOL_ROUTES)
  },
  // Must stay last: it only answers what neither the routes above nor the survey tool routes matched
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
