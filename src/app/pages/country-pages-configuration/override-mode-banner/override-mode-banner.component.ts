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
  templateUrl: './override-mode-banner.component.html',
})
export class OverrideModeBannerComponent {
  /** Display name of the country being edited. */
  readonly countryName = input.required<string>();

  /** Emitted when the admin clicks "Reset … to Global default". */
  readonly reset = output<void>();

  /** Disables the Reset button while a reset is in flight, so it can't be clicked repeatedly. */
  readonly disabled = input<boolean>(false);
}
