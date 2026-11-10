import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as Sentry from '@sentry/angular';
import { MatomoTracker } from 'ngx-matomo-client';
import { environment } from '../environments/environment';
import { UserService } from '../survey-tool/app/services/user.service';
import { MessagingSystemService } from '../messaging-system-ui/services/messaging-system.service';
import { MessagingWebsocketService } from '../messaging-system-ui/services/messaging-websocket.service';
import { APP_ENV } from '../survey-tool/catalogue-ui/config/app-env.token';
import { appProviders } from './app.config';
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

  it('replace the default error handler with the Sentry one', () => {
    expect(TestBed.inject(ErrorHandler).handleError).toBeTypeOf('function');
    expect(TestBed.inject(ErrorHandler).constructor).not.toBe(ErrorHandler);
  });

  it('register the HTTP interceptor class', () => {
    expect(TestBed.inject(HTTP_INTERCEPTORS).map(interceptor => interceptor.constructor)).toEqual([HttpInterceptorService]);
  });
});
