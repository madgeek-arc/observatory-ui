import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {CookieConsentService} from '../cookies/cookie-consent.service';

@Component({
    selector: 'app-full-footer',
    templateUrl: './full-footer.component.html',
    styleUrls: ['./footer.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FullFooterComponent {
  private cookieConsent = inject(CookieConsentService);

  constructor() {
  }

  openCookieSettings(event: Event) {
    event.preventDefault();
    this.cookieConsent.open();
  }

  scrollToTop(){
    window.scroll(0,0);
  }
}
