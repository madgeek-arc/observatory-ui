import { Routes } from '@angular/router';
import { DocumentLandingComponent } from './document-landing/document-landing.component';
import { SearchComponent } from './search/search.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { AuthGuard } from "src/survey-tool/app/services/auth-guard.service";

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
  },
  {
    path: 'document-edit/:id',
    canActivate: [AuthGuard],
    component: DocumentEditComponent
  },
  {
    path: 'document-add',
    canActivate: [AuthGuard],
    component: DocumentEditComponent
  }
];
