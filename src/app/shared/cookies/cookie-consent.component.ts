import { Component, DestroyRef, effect, ElementRef, inject, OnInit, untracked, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { CookieConsentService } from './cookie-consent.service';
import { COOKIE_CATALOG } from './cookie-consent.model';

declare var UIkit: any;

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [DatePipe, NgTemplateOutlet],
  styles: [`
    .cookie-banner {
      width: 450px;
      max-width: calc(100vw - 40px);
      z-index: 995;
    }

    .cookie-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .cookie-actions > * {
      flex: 1 1 auto;
    }

    summary {
      cursor: pointer;
    }
  `],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (!service.hasChoice()) {
      <div class="cookie-banner uk-position-fixed uk-position-bottom-left uk-margin-left uk-margin-bottom"
           role="dialog" aria-labelledby="cookie-banner-title">
        <div class="uk-card uk-card-default uk-box-shadow-medium">
          <div class="uk-card-body">
            <div id="cookie-banner-title" class="uk-text-bold uk-text-large uk-margin-small-bottom">We use cookies</div>
            <div class="uk-text-small">
              This website uses essential cookies to ensure its proper operation and analytics cookies to
              understand how you interact with it. Analytics cookies will be set only if you accept them.
              <br><br>
              Read more about our <a [href]="policyUrl" target="_blank" rel="noopener">Cookies Policy</a>.
            </div>
          </div>
          <div class="uk-card-footer uk-margin-xsmall">
            <div class="cookie-actions">
              <button type="button" class="uk-button uk-button-small uk-button-default" (click)="service.open()">
                Settings
              </button>
              <button type="button" class="uk-button uk-button-small uk-button-primary" (click)="service.rejectAll()">
                Reject all
              </button>
              <button type="button" class="uk-button uk-button-small uk-button-primary" (click)="service.acceptAll()">
                Accept all
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <ng-template #cookieTable let-cookie="cookie">
      <table class="uk-table uk-table-small uk-table-striped uk-text-small">
        <tr><th>Name</th><td>{{ cookie.name }}</td></tr>
        <tr><th>Description</th><td>{{ cookie.description }}</td></tr>
        <tr><th>Provider</th><td>{{ cookie.provider }}</td></tr>
        <tr><th>Expiration</th><td>{{ cookie.expiration }}</td></tr>
      </table>
    </ng-template>

    <div #panel id="cookie-consent-panel" uk-offcanvas="flip: true; overlay: true"
         aria-labelledby="cookie-panel-title">
      <div class="uk-offcanvas-bar uk-flex uk-flex-column">
        <button class="uk-offcanvas-close" type="button" uk-close aria-label="Close cookie settings"></button>

        <h3 id="cookie-panel-title" class="uk-h4 uk-margin-remove-bottom">Cookie preferences</h3>
        <div class="uk-margin-small-top uk-text-small">
          We use cookies to ensure the basic functionality of the website and to understand how it is used.
          You can opt in or out of each optional category at any time.
        </div>

        <div class="uk-margin-top uk-flex-1 uk-overflow-auto">
          <div class="uk-background-muted uk-padding-small uk-margin-bottom uk-border-rounded">
            <label class="uk-flex uk-flex-between uk-flex-middle uk-text-bold">
              Strictly necessary cookies
              <input class="uk-checkbox" type="checkbox" checked disabled>
            </label>
            <div class="uk-text-small uk-margin-small-top">
              These cookies are required for the website to work, for example to keep you signed in and to
              protect forms against abuse. They cannot be switched off. Information about your signed-in
              session is also kept in your browser's session storage and is cleared when you close the tab.
            </div>
            <details class="uk-margin-small-top">
              <summary class="uk-text-small">View cookies</summary>
              @for (cookie of catalog.necessary; track cookie.name) {
                <ng-container *ngTemplateOutlet="cookieTable; context: {cookie: cookie}"></ng-container>
              }
            </details>
          </div>

          <div class="uk-background-muted uk-padding-small uk-border-rounded">
            <label class="uk-flex uk-flex-between uk-flex-middle uk-text-bold">
              Analytical cookies
              <input class="uk-checkbox" type="checkbox" [checked]="analyticsDraft"
                     (change)="analyticsDraft = $any($event.target).checked">
            </label>
            <div class="uk-text-small uk-margin-small-top">
              These cookies help us understand how the website is used, such as which pages are visited and which
              links are clicked, so that we can improve it. They are set only if you allow them.
            </div>
            <details class="uk-margin-small-top">
              <summary class="uk-text-small">View cookies</summary>
              @for (cookie of catalog.analytics; track cookie.name) {
                <ng-container *ngTemplateOutlet="cookieTable; context: {cookie: cookie}"></ng-container>
              }
            </details>
          </div>

          <div class="uk-margin-top uk-text-small">
            Detailed information about how we handle cookies could be found in our <a [href]="policyUrl" target="_blank" rel="noopener">Cookies policy.</a>.
          </div>
          @if (service.consent(); as consent) {
            <div class="uk-margin-small-top uk-text-small">
              Consent granted on
              <span class="uk-text-bold">{{ consent.date | date: 'dd-MM-yyyy HH:mm' }}</span>
            </div>
          }
        </div>

        <div class="uk-margin-top cookie-actions">
          <button type="button" class="uk-button uk-button-small uk-button-primary" (click)="service.rejectAll()">
            Reject all
          </button>
          <button type="button" class="uk-button uk-button-small uk-button-primary" (click)="service.acceptAll()">
            Accept all
          </button>
          <button type="button" class="uk-button uk-button-small uk-button-default"
                  (click)="service.save(analyticsDraft)">
            Save settings
          </button>
        </div>
      </div>
    </div>
  `
})
export class CookieConsentComponent implements OnInit {
  readonly service = inject(CookieConsentService);
  readonly catalog = COOKIE_CATALOG;
  readonly policyUrl = 'https://www.openaire.eu/cookies-policy';

  /** State of the analytics checkbox while the panel is open; only applied on save. */
  analyticsDraft = false;

  @ViewChild('panel', {static: true}) panel: ElementRef<HTMLElement>;

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const open = this.service.settingsOpen();
      const el = this.panel?.nativeElement;
      if (!el || typeof UIkit === 'undefined') {
        return;
      }
      if (open) {
        this.analyticsDraft = untracked(() => this.service.consent()?.analytics) ?? false;
        UIkit.offcanvas(el).show();
      } else if (el.classList.contains('uk-open')) {
        UIkit.offcanvas(el).hide();
      }
    });
  }

  ngOnInit(): void {
    // Keep the service in sync when the panel is closed by UIkit itself (Esc, close button, overlay click).
    const el = this.panel.nativeElement;
    const onHidden = (event: Event) => {
      // `hidden` also bubbles up from components nested in the panel.
      if (event.target === el) {
        this.service.settingsOpen.set(false);
      }
    };
    el.addEventListener('hidden', onHidden);
    this.destroyRef.onDestroy(() => el.removeEventListener('hidden', onHidden));
  }
}
