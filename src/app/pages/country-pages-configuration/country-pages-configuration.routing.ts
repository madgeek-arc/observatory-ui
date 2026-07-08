import { Route } from "@angular/router";
import { countryPagesRoutes } from "../country-pages/country-pages.routing";

export const countryPagesConfigurationRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./country-pages-configuration.component').then(m => m.CountryPagesConfigurationComponent),
    children: countryPagesRoutes
  }
];
