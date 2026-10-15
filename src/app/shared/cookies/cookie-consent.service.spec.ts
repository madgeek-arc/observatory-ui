import { TestBed } from '@angular/core/testing';
import { MatomoTracker } from 'ngx-matomo-client';
import { CookieConsentService } from './cookie-consent.service';
import { CONSENT_COOKIE_NAME, CONSENT_VERSION } from './cookie-consent.model';

describe('CookieConsentService', () => {
  let tracker: jasmine.SpyObj<MatomoTracker>;

  const clearCookie = () => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/`;
  };

  const setRawCookie = (value: string) => {
    document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/`;
  };

  const create = () => TestBed.inject(CookieConsentService);

  beforeEach(() => {
    clearCookie();
    tracker = jasmine.createSpyObj<MatomoTracker>('MatomoTracker', ['setConsentGiven', 'forgetConsentGiven', 'deleteCookies']);
    TestBed.configureTestingModule({providers: [{provide: MatomoTracker, useValue: tracker}]});
  });

  afterEach(clearCookie);

  it('has no choice when there is no cookie, and keeps Matomo off', () => {
    const service = create();

    expect(service.hasChoice()).toBeFalse();
    expect(service.consent()).toBeNull();
    expect(tracker.deleteCookies).toHaveBeenCalled();
    expect(tracker.setConsentGiven).not.toHaveBeenCalled();
  });

  it('does not touch Matomo consent state for visitors who never consented', () => {
    // forgetConsentGiven() makes Matomo write a cookie (mtm_consent_removed), which must not happen before consent.
    const service = create();
    expect(tracker.forgetConsentGiven).not.toHaveBeenCalled();

    service.rejectAll();

    expect(tracker.forgetConsentGiven).not.toHaveBeenCalled();
    expect(tracker.deleteCookies).toHaveBeenCalled();
  });

  it('ignores a corrupt cookie instead of throwing', () => {
    setRawCookie('%7Bnot-json');

    const service = create();

    expect(service.hasChoice()).toBeFalse();
  });

  it('ignores a cookie written with another schema version', () => {
    setRawCookie(encodeURIComponent(JSON.stringify({functional: true, preferences: true, analytics: true})));

    const service = create();

    expect(service.hasChoice()).toBeFalse();
    expect(tracker.setConsentGiven).not.toHaveBeenCalled();
  });

  it('acceptAll stores analytics consent and tells Matomo', () => {
    const service = create();

    service.acceptAll();

    expect(service.consent()?.analytics).toBeTrue();
    expect(service.consent()?.version).toBe(CONSENT_VERSION);
    expect(document.cookie).toContain(`${CONSENT_COOKIE_NAME}=`);
    expect(tracker.setConsentGiven).toHaveBeenCalledTimes(1);
  });

  it('rejectAll after accepting removes Matomo consent and cookies', () => {
    const service = create();
    service.acceptAll();
    tracker.forgetConsentGiven.calls.reset();
    tracker.deleteCookies.calls.reset();

    service.rejectAll();

    expect(service.consent()?.analytics).toBeFalse();
    expect(tracker.forgetConsentGiven).toHaveBeenCalledTimes(1);
    expect(tracker.deleteCookies).toHaveBeenCalledTimes(1);
  });

  it('restores a previously saved choice on start and re-applies it to Matomo', () => {
    create().acceptAll();
    TestBed.resetTestingModule();
    tracker = jasmine.createSpyObj<MatomoTracker>('MatomoTracker', ['setConsentGiven', 'forgetConsentGiven', 'deleteCookies']);
    TestBed.configureTestingModule({providers: [{provide: MatomoTracker, useValue: tracker}]});

    const service = create();

    expect(service.hasChoice()).toBeTrue();
    expect(service.consent()?.analytics).toBeTrue();
    expect(tracker.setConsentGiven).toHaveBeenCalledTimes(1);
    expect(tracker.forgetConsentGiven).not.toHaveBeenCalled();
  });

  it('closes the settings panel when a choice is saved', () => {
    const service = create();
    service.open();
    expect(service.settingsOpen()).toBeTrue();

    service.save(false);

    expect(service.settingsOpen()).toBeFalse();
  });
});
