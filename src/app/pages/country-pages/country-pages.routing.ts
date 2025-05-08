import { Route } from "@angular/router";
import { PolicyOverviewComponent } from "./policy-overview/policy-overview.component";
import { OpenAccessPublicationsPage } from "./open-access-publications/open-access-publications";
import { GeneralRDOverviewComponent } from "./general-R&D-overview/general-R&D-overview.component";

export const countryPagesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./country-pages.component').then(m => m.CountryPagesComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'general',
        component: GeneralRDOverviewComponent,
      },
      {
        path: 'policy',
        component: PolicyOverviewComponent,
      },
      {
        path: 'publications',
        component: OpenAccessPublicationsPage,
      }
    ]
  }

];
