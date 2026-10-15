import { computed, inject, Injectable, signal } from '@angular/core';
import { MatomoTracker } from 'ngx-matomo-client';
import { CONSENT_COOKIE_NAME, CONSENT_MAX_AGE_DAYS, CONSENT_VERSION, Consent } from './cookie-consent.model';

/**
 * Keeps the visitor's cookie choices in a single first-party cookie and applies them to Matomo.
 *
 * The consent cookie is the only source of truth: Matomo is configured with `requireConsent: 'tracking'`
 * (see AppModule), so nothing is sent and no Matomo cookie is set until {@link save} records analytics consent.
 */
@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly tracker = inject(MatomoTracker);
  private readonly _consent = signal<Consent | null>(this.read());
  /** Whether Matomo has been told, during this page's lifetime, that analytics consent was given. */
  private matomoConsentGiven = false;

  /** The saved choice, or `null` if the visitor has not chosen yet (or the stored value is unusable). */
  readonly consent = this._consent.asReadonly();
  readonly hasChoice = computed(() => this._consent() !== null);
  /** Whether the cookie settings panel is (requested to be) open. */
  readonly settingsOpen = signal(false);

  constructor() {
    this.applyToMatomo(this._consent()?.analytics === true);
  }

  open(): void {
    this.settingsOpen.set(true);
  }

  acceptAll(): void {
    this.save(true);
  }

  rejectAll(): void {
    this.save(false);
  }

  save(analytics: boolean): void {
    const consent: Consent = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics,
      date: new Date().toISOString()
    };
    this.write(consent);
    this._consent.set(consent);
    this.applyToMatomo(analytics);
    this.settingsOpen.set(false);
  }

  private applyToMatomo(analytics: boolean): void {
    if (analytics) {
      // One-time consent on purpose: it is re-applied from our cookie on every start, so Matomo
      // does not keep a second, independent consent cookie that could get out of sync.
      this.tracker.setConsentGiven();
      this.matomoConsentGiven = true;
      return;
    }
    if (this.matomoConsentGiven) {
      // Revokes consent given earlier in this page's lifetime (the app is a SPA, so Matomo would keep tracking).
      // Matomo records a withdrawal in its own cookie (`mtm_consent_removed`), so this must not be called for
      // visitors who never consented: that would set a Matomo cookie before they have chosen anything.
      this.tracker.forgetConsentGiven();
      this.matomoConsentGiven = false;
    }
    // Also cleans up Matomo cookies set before consent was required.
    this.tracker.deleteCookies();
  }

  private read(): Consent | null {
    if (typeof document === 'undefined') {
      return null;
    }
    const prefix = `${CONSENT_COOKIE_NAME}=`;
    const entry = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(prefix));
    if (!entry) {
      return null;
    }
    try {
      const parsed = JSON.parse(decodeURIComponent(entry.substring(prefix.length)));
      return this.isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private isValid(value: any): value is Consent {
    return !!value
      && value.version === CONSENT_VERSION
      && value.necessary === true
      && typeof value.analytics === 'boolean'
      && typeof value.date === 'string';
  }

  private write(consent: Consent): void {
    if (typeof document === 'undefined') {
      return;
    }
    const expires = new Date(Date.now() + CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}`
      + `; Expires=${expires}; Path=/; SameSite=Lax${secure}`;
  }
}
