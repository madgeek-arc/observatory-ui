import { EnvironmentProviders, ErrorHandler, inject, Provider, provideAppInitializer } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withXhr, withXsrfConfiguration } from '@angular/common/http';
import { Router } from '@angular/router';
import * as Sentry from '@sentry/angular';
import { provideMatomo } from 'ngx-matomo-client';
import { environment } from '../environments/environment';
import { UserService } from '../survey-tool/app/services/user.service';
import { MessagingSystemService } from '../messaging-system-ui/services/messaging-system.service';
import { APP_ENV } from '../survey-tool/catalogue-ui/config/app-env.token';
import { HttpInterceptorService } from './pages/services/http-interceptor.service';

/** The providers of the whole application, shared by the root module and by the spec that checks they resolve */
export const appProviders: (Provider | EnvironmentProviders)[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpInterceptorService,
    multi: true
  },
  UserService,
  MessagingSystemService,
  { provide: APP_ENV, useValue: environment },
  {
    provide: ErrorHandler,
    useValue: Sentry.createErrorHandler({
      showDialog: false,
    }),
  },
  {
    provide: Sentry.TraceService,
    deps: [Router],
  },
  provideAppInitializer(() => {
    const initializerFn = (() => {
      const trace = inject(Sentry.TraceService);
      return () => {
        // use `trace` here, e.g. trace.start() or whatever Sentry requires
      };
    })();

    return initializerFn();
  }),
  provideHttpClient(
    withXhr(),
    withXsrfConfiguration({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    })
  ),
  provideMatomo(
    {
      trackerUrl: environment.matomoTrackerUrl,
      siteId: environment.matomoSiteId,
      // Nothing is sent and no Matomo cookie is set until the visitor accepts analytics (see CookieConsentService)
      requireConsent: 'tracking',
    },
  ),
];
