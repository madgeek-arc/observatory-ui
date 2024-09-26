import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { OpenScienceByAreaComponent } from "./open-science-by-area.component";
import { OpenScienceByAreaPublicationsComponent } from "./areas/open-science-by-area-publications.component";
import { OpenScienceByAreaOpenDataComponent } from "./areas/open-science-by-area-open-data.component";
import { OpenScienceByAreaFairDataComponent } from "./areas/open-science-by-area-fair-data.component";
import { OpenScienceByAreaDataManagementComponent } from "./areas/open-science-by-area-data-management.component";

const openScienceAreaRoutes: Routes = [
  {
    path: '',
    component: OpenScienceByAreaComponent,
  },
  {
    path: 'publications',
    component: OpenScienceByAreaPublicationsComponent
  },
  {
    path: 'open-data',
    component: OpenScienceByAreaOpenDataComponent
  },
  {
    path: 'fair-data',
    component: OpenScienceByAreaFairDataComponent
  },
  {
    path: 'data-management',
    component: OpenScienceByAreaDataManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(openScienceAreaRoutes)],
  exports: [RouterModule],
  providers: []
})

export class OpenScienceByAreaRouting {}
