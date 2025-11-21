import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ExploreComponent } from "./explore.component";
import { OpenScienceTrendsComponent } from "./open-science-trends/open-science-trends.component";
import { InvestmentsInEoscComponent } from "./investments-in-eosc/investments-in-eosc.component";
import { NationalMonitoringComponent } from "./national-monitoring/national-monitoring.component";
import { OpenScienceUseCasesComponent } from "./open-science-use-cases/open-science-use-cases.component";
import { OpenSciencePoliciesComponent } from "./open-science-policies/open-science-policies.component";
import { OpenScienceImpactComponent } from "./open-science-impact/open-science-impact.component";
import { CustomSearchComponent } from "./custom-search/custom-search.component";
import { SearchComponent } from './resources-registry/search/search.component';
import { DocumentLandingComponent } from './resources-registry/document-landing/document-landing.component';

const exploreRoutes: Routes = [
  {
    path: '',
    component: ExploreComponent,
    children: [
      {
        path: '',
        redirectTo: 'open-science-by-area',
        pathMatch: 'full'
      },
      {
        path: 'open-science-by-area',
        loadChildren: () => import('./open-science-by-area/open-science-by-area.module').then(m => m.OpenScienceByAreaModule),
      },
      {
        path: 'open-science-trends',
        component: OpenScienceTrendsComponent
      },
      {
        path: 'investments-in-eosc',
        component: InvestmentsInEoscComponent
      },
      {
        path: 'national-monitoring',
        component: NationalMonitoringComponent
      },
      {
        path: 'open-science-use-cases',
        component: OpenScienceUseCasesComponent
      },
      {
        path: 'open-science-policies',
        component: OpenSciencePoliciesComponent
      },
      {
       path: 'resource-registry',
        children: [
          {
            path: 'search',
            component: SearchComponent
          },
          {
            path: 'document-landing/:documentId',
            component: DocumentLandingComponent
          }
        ]
      },
      {
        path: 'open-science-impact',
        component: OpenScienceImpactComponent
      },
      {
        path: 'custom-search',
        component: CustomSearchComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(exploreRoutes)],
  exports: [RouterModule],
  providers: []
})

export class ExploreRouting {}
