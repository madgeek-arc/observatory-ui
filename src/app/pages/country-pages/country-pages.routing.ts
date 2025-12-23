import { Route } from "@angular/router";
import { PolicyOverviewComponent } from "./policy-overview/policy-overview.component";
import { OpenAccessPublicationsPage } from "./open-access-publications/open-access-publications";
import { GeneralRDOverviewComponent } from "./general-R&D-overview/general-R&D-overview.component";
import { OpenDataComponent } from "./open-data/open-data.component";
import { CitizenScienceComponent } from "./citizen-science/citizen-science.component";
import { DataManagementComponent } from "./data-management/data-management.component";
import { FairDataComponent } from "./fair-data/fair-data.component";
import { OpenRepositoriesComponent } from "./open-repositories/open-repositories.component";
import { OpenScienceTrainingComponent } from "./open-science-training/open-science-training.component";
import { OpenSoftwareComponent } from "./open-software/open-software.component";


export const countryPagesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./country-pages.component').then(m => m.CountryPagesComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'general',
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
      },
      {
        path: 'open-data',
        component: OpenDataComponent
      },
      {
        path: 'citizen-science',
        component: CitizenScienceComponent
      },
      {
        path: 'data-management',
        component: DataManagementComponent
      },
      {
        path: 'fair-data',
        component: FairDataComponent
      },
      {
        path: 'repositories',
        component: OpenRepositoriesComponent
      },
      {
        path: 'science-training',
        component: OpenScienceTrainingComponent
      },
      {
        path: 'open-software',
        component: OpenSoftwareComponent
      }
    ]
  }

];
