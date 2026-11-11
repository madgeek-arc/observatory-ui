import {
  ApplicationConfig,
  EnvironmentProviders,
  ErrorHandler,
  inject,
  Provider,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { provideHttpClient, withXhr, withXsrfConfiguration } from '@angular/common/http';
import { provideRouter, Router, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import * as Sentry from '@sentry/angular';
import { provideMatomo } from 'ngx-matomo-client';
import { environment } from '../environments/environment';
import { AuthenticationService } from '../survey-tool/app/services/authentication.service';
import { StakeholderMentionableUsersProvider } from '../survey-tool/app/services/stakeholder-mentionable-users.service';
import { SurveyService } from '../survey-tool/app/services/survey.service';
import { UserService } from '../survey-tool/app/services/user.service';
import { MessagingSystemService } from '../messaging-system-ui/services/messaging-system.service';
import { MessagingWebsocketService } from '../messaging-system-ui/services/messaging-websocket.service';
import { APP_ENV } from '../survey-tool/catalogue-ui/config/app-env.token';
import { MentionableUsersProvider } from '../survey-tool/catalogue-ui/domain/mentionable-user';
import { routes } from './app.routes';

/** The providers of the whole application, shared by the bootstrap and by the spec that checks they resolve */
export const appProviders: (Provider | EnvironmentProviders)[] = [
  UserService,
  AuthenticationService,
  SurveyService,
  { provide: MentionableUsersProvider, useClass: StakeholderMentionableUsersProvider },
  MessagingSystemService,
  // The top menu opens the unread counter socket with it, outside any lazy route
  MessagingWebsocketService,
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(
      routes,
      // Angular 22 defaults to 'always'; keep the behaviour the routes were written against
      withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' }),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    ...appProviders,
  ],
};
