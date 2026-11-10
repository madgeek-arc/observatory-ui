import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
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
import { HttpInterceptorService } from './pages/services/http-interceptor.service';

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

  it('register the HTTP interceptor class', () => {
    expect(TestBed.inject(HTTP_INTERCEPTORS).map(interceptor => interceptor.constructor)).toEqual([HttpInterceptorService]);
  });
});

/** The router setup of the bootstrap: what AppRoutingModule.forRoot used to configure */
describe('appConfig', () => {
  let placeholder: HTMLScriptElement;

  beforeEach(() => {
    placeholder = document.head.appendChild(document.createElement('script'));
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => placeholder.remove());

  it('keeps the route params inheritance the routes were written against', () => {
    expect(TestBed.inject(ROUTER_CONFIGURATION).paramsInheritanceStrategy).toBe('emptyOnly');
  });

  it('mounts the contact page at the root and leaves the survey tool routes as the last resort', () => {
    const paths = TestBed.inject(Router).config.map(route => route.path);

    expect(paths).toContain('contact');
    expect(paths).not.toContain('messages');
    expect(paths.at(-1)).toBe('');
  });
});
