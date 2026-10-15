export const CONSENT_COOKIE_NAME = 'consent';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 395;

export interface Consent {
  /** Bump {@link CONSENT_VERSION} when categories change, so that users are asked again. */
  version: number;
  /** Strictly necessary cookies cannot be switched off. */
  necessary: true;
  analytics: boolean;
  /** ISO date of the moment the choice was made. */
  date: string;
}

export interface CookieInfo {
  name: string;
  description: string;
  provider: string;
  expiration: string;
}

export interface CookieCatalog {
  necessary: CookieInfo[];
  analytics: CookieInfo[];
}

/** Cookies this website (or the third-party services it loads) may set, shown in the cookie settings panel. */
export const COOKIE_CATALOG: CookieCatalog = {
  necessary: [
    {
      name: CONSENT_COOKIE_NAME,
      description: 'Stores your cookie choices, so that you are not asked again.',
      provider: 'This website',
      expiration: '13 months'
    },
    {
      name: 'SESSION',
      description: 'Identifies your signed-in session on the server, so that you stay logged in while you browse.',
      provider: 'This website',
      expiration: 'Session'
    },
    {
      name: 'XSRF-TOKEN',
      description: 'Protects your requests against cross-site request forgery.',
      provider: 'This website',
      expiration: 'Session'
    },
    {
      name: '_GRECAPTCHA',
      description: 'Used by Google reCAPTCHA to tell humans from bots and protect forms against abuse.',
      provider: 'Google',
      expiration: '6 months'
    },
    {
      name: 'mtm_consent_removed',
      description: 'Set only if you withdraw your analytics consent: remembers that analytics must stay off.',
      provider: 'Matomo',
      expiration: '30 years'
    }
  ],
  analytics: [
    {
      name: '_pk_id.*',
      description: 'Stores a few details about the visitor, such as a unique visitor ID.',
      provider: 'Matomo',
      expiration: '13 months'
    },
    {
      name: '_pk_ses.*',
      description: 'Short-lived cookie that temporarily stores data for the current visit.',
      provider: 'Matomo',
      expiration: '30 minutes'
    },
    {
      name: '_pk_ref.*',
      description: 'Stores the referrer that brought you to the website.',
      provider: 'Matomo',
      expiration: '6 months'
    }
  ]
};
