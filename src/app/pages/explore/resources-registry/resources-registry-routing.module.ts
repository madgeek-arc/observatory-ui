import { Routes, RouterModule } from '@angular/router';
import { DocumentLandingComponent } from './document-landing/document-landing.component';
import { SearchComponent } from './search/search.component';
import { NgModule } from '@angular/core';

export const resourcesRegistryRoutes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full',
  },
  {
    path: 'document-landing/:documentId',
    component: DocumentLandingComponent
  },
  {
    path: 'search',
    component: SearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(resourcesRegistryRoutes)],
  exports: [RouterModule],
  providers: []
})

export class ResourcesRegistryRoutingModule {}
