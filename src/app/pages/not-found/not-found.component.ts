import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Shown for every URL that no route matches */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="uk-section uk-text-center">
      <div class="uk-container">
        <h1 class="uk-heading-large">404</h1>
        <p class="uk-text-lead">Page not found</p>
        <p>The page you are looking for does not exist or has moved.</p>
        <a routerLink="/home" class="uk-button uk-button-primary">Go to the home page</a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
