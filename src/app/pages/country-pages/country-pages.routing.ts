import { Route } from "@angular/router";
import { PolicyOverviewComponent } from "./policy-overview/policy-overview.component";
import { OpenAccessPublicationsPage } from "./open-access-publications/open-access-publications";

export const countryPagesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./country-pages.component').then(m => m.CountryPagesComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'policy-overview',
      },
      {
        path: 'policy-overview',
        component: PolicyOverviewComponent,
      },
      {
        path: 'open-access-publications',
        component: OpenAccessPublicationsPage,
      }
    ]
  }

];
