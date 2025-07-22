import { Routes, RouterModule } from '@angular/router';
import { DocumentLandingComponent } from './Document-landing/document-landing/document-landing.component';
import { SearchComponent } from './Search/search/search.component';
import { NgModule } from '@angular/core';

export const resourcesRegistryRoutes: Routes = [
  {
    path: 'document-landing/:id',
    component: DocumentLandingComponent
  },
  {
    path: '',
    component: SearchComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(resourcesRegistryRoutes)],
  exports: [RouterModule],
  providers: []
})

export class ResourcesRegistryRoutingModule {}