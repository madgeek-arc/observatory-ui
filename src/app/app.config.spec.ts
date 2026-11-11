import { HttpClient } from '@angular/common/http';
import { readFile } from 'node:fs/promises';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as Sentry from '@sentry/angular';
import { MatomoTracker } from 'ngx-matomo-client';
import { ROUTER_CONFIGURATION, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthenticationService } from '../survey-tool/app/services/authentication.service';
import { StakeholderMentionableUsersProvider } from '../survey-tool/app/services/stakeholder-mentionable-users.service';
import { SurveyService } from '../survey-tool/app/services/survey.service';
import { UserService } from '../survey-tool/app/services/user.service';
import { MessagingSystemService } from '../messaging-system-ui/services/messaging-system.service';
import { MessagingWebsocketService } from '../messaging-system-ui/services/messaging-websocket.service';
import { APP_ENV } from '../survey-tool/catalogue-ui/config/app-env.token';
import { MentionableUsersProvider } from '../survey-tool/catalogue-ui/domain/mentionable-user';
import { appConfig, appProviders } from './app.config';

/**
 * The root providers are plain code that Angular only resolves at startup. A wrong one blanks the whole
 * application, and neither the compiler nor the other specs notice, because none of them boots it.
 */
describe('appProviders', () => {
  let placeholder: HTMLScriptElement;

  beforeEach(() => {
    // Matomo adds its script before the first one in the page, which index.html provides and jsdom does not
    placeholder = document.head.appendChild(document.createElement('script'));
    TestBed.configureTestingModule({ providers: appProviders });
  });

  afterEach(() => placeholder.remove());

  it('resolve the HTTP client, the Sentry trace service and the Matomo tracker', () => {
    expect(TestBed.inject(HttpClient)).toBeTruthy();
    expect(TestBed.inject(Sentry.TraceService)).toBeTruthy();
    expect(TestBed.inject(MatomoTracker)).toBeTruthy();
  });

  it('resolve the services the whole application shares', () => {
    expect(TestBed.inject(UserService)).toBeTruthy();
    expect(TestBed.inject(MessagingSystemService)).toBeTruthy();
    expect(TestBed.inject(MessagingWebsocketService)).toBeTruthy();
    expect(TestBed.inject(APP_ENV)).toBe(environment);
  });

  it('resolve the survey tool services that no lazy route provides for the top menu and the guards', () => {
    expect(TestBed.inject(AuthenticationService)).toBeTruthy();
    expect(TestBed.inject(SurveyService)).toBeTruthy();
    expect(TestBed.inject(MentionableUsersProvider)).toBeInstanceOf(StakeholderMentionableUsersProvider);
  });

  it('replace the default error handler with the Sentry one', () => {
    expect(TestBed.inject(ErrorHandler).handleError).toBeTypeOf('function');
    expect(TestBed.inject(ErrorHandler).constructor).not.toBe(ErrorHandler);
  });
});

/** The router setup of the bootstrap: what AppRoutingModule.forRoot used to configure */
describe('appConfig', () => {
  let placeholder: HTMLScriptElement;

  /** The route config path of the deepest activated route */
  const leafPath = (router: Router) => {
    let route = router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.routeConfig?.path;
  };

  beforeEach(() => {
    placeholder = document.head.appendChild(document.createElement('script'));
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => placeholder.remove());

  it('keeps the route params inheritance the routes were written against', () => {
    expect(TestBed.inject(ROUTER_CONFIGURATION).paramsInheritanceStrategy).toBe('emptyOnly');
  });

  it('mounts the contact page at the root and leaves the survey tool routes as the last resort before the wildcard', () => {
    const paths = TestBed.inject(Router).config.map(route => route.path);

    expect(paths).toContain('contact');
    expect(paths).not.toContain('messages');
    expect(paths.at(-2)).toBe('');
    expect(paths.at(-1)).toBe('**');
  });

  it('shows the not-found page for a URL no route matches, without hiding the survey tool routes', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/no/such/page');
    expect(leafPath(router)).toBe('**');

    await router.navigateByUrl('/profile');
    expect(leafPath(router)).toBe('profile');
  });

  it('points every internal link of the footer at a real route', async () => {
    const footer = await readFile('src/app/shared/footer/full-footer.component.html', 'utf8');
    const links = [...footer.matchAll(/routerLink\]="\['(\/[^']+)'\]"/g)].map(match => match[1]);
    const router = TestBed.inject(Router);

    expect(links.length).toBeGreaterThan(10);
    for (const link of links) {
      await router.navigateByUrl(link);
      expect(leafPath(router), `${link} falls through to the not-found page`).not.toBe('**');
    }
  });
});
