import { Component, input, output } from "@angular/core";

/**
 * Fixed banner shown while a specific country's override is being edited (not the Global default).
 * Extracted from the config page so it mirrors {@link SectionHiddenNoticeComponent} as a small,
 * reusable notice. Styling reuses the global `.country-config-override-banner` classes
 * (eosc-obs-general-custom.less), so this component has no stylesheet of its own.
 */
@Component({
  selector: 'app-override-mode-banner',
  standalone: true,
  template: `
    <div class="country-config-override-banner uk-flex uk-flex-between uk-flex-middle uk-border-bottom uk-padding-small uk-padding-remove-vertical">
      <div class="uk-flex uk-flex-middle">
        <span class="uk-label uk-label-override uk-margin-small-right">Override mode</span>
        <span>You're editing <strong>{{ countryName() }}</strong>. Changes here override the Global default for this country only.</span>
      </div>

      <button type="button" class="uk-button uk-button-secondary uk-button-small override-reset-btn"
              (click)="reset.emit()">
        Reset {{ countryName() }} to Global default
      </button>
    </div>
  `,
})
export class OverrideModeBannerComponent {
  /** Display name of the country being edited. */
  readonly countryName = input.required<string>();

  /** Emitted when the admin clicks "Reset … to Global default". */
  readonly reset = output<void>();
}
