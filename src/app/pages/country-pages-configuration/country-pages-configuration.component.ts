import { Component, DestroyRef, inject, OnInit, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable } from "rxjs";
import { UserService } from "../../../survey-tool/app/services/user.service";
import { countries } from "../../domain/countries";
import {
  CountryPageIndicatorsService, DefaultsDoc, GLOBAL_SCOPE_CODE, OverrideDoc
} from "../country-pages/services/country-page-indicators.service";
import { OverrideModeBannerComponent } from "./override-mode-banner/override-mode-banner.component";
import { IndicatorListComponent } from "./indicator-list/indicator-list.component";
import * as UIkit from "uikit";

@Component({
  selector: 'app-country-pages-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, OverrideModeBannerComponent, IndicatorListComponent],
  templateUrl: './country-pages-configuration.component.html',
  styleUrls: ['../../../assets/css/explore-sidebar.less']
})
export class CountryPagesConfigurationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  protected readonly indicatorsService = inject(CountryPageIndicatorsService);

  /** Dropdown sentinel for the type-wide Global default scope (vs a real country code). */
  static readonly GLOBAL_SCOPE = 'global';

  checkingAuth = true;
  authorized = false;
  countryCode = '';

  readonly countries = countries;

  /** Current "Editing" dropdown value: 'global' or a real country code. */
  readonly selectedScope = signal<string>(CountryPagesConfigurationComponent.GLOBAL_SCOPE);

  /** True while a specific country is being edited (i.e. not the Global default) — drives the
   *  override banner's visibility and the content's extra top offset. */
  readonly isCountryScope = computed(() =>
    this.selectedScope() !== CountryPagesConfigurationComponent.GLOBAL_SCOPE
  );

  /** Display name of the country currently being edited (falls back to the raw code). */
  readonly currentCountryName = computed(() => {
    const code = this.selectedScope();
    return this.countries.find(c => c.id === code)?.name ?? code;
  });
  /** View switch, backed by the shared service so the nested card wrappers can react to it. */
  readonly viewMode = this.indicatorsService.viewMode;
  readonly changesSubmitted = signal<boolean>(false);
  readonly publishing = signal<boolean>(false);

  /** True while a reset is in flight (or its notification is still showing) — disables Reset. */
  readonly resetting = signal<boolean>(false);

  private get stakeholderId(): string {
    return 'sh-eosc-sb-' + this.countryCode;
  }

  ngOnInit() {
    // Angular reuses this component when only :code changes, so a one-time snapshot read would
    // leave the state stale after switching scope. React to params instead: the Global default is
    // the reserved :code = GLOBAL_SCOPE_CODE (EU), every other :code is that real country. The
    // dropdown maps EU back to its 'global' sentinel; a real code stays as-is (per-country PUT target).
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.countryCode = params['code'];
        this.selectedScope.set(
          this.countryCode === GLOBAL_SCOPE_CODE
            ? CountryPagesConfigurationComponent.GLOBAL_SCOPE
            : this.countryCode
        );
      });

    this.userService.getUserInfo().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (userInfo) => {
        this.authorized = !!userInfo?.admin
          || (userInfo?.coordinators ?? []).some(c => c.type === 'eosc-sb')
          || (userInfo?.administrators ?? []).some(a => a.type === 'eosc-sb');
        this.checkingAuth = false;
        if (!this.authorized) {
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        this.checkingAuth = false;
        this.router.navigate(['/home']);
      }
    });
  }

  /**
   * Switching the editing scope reloads the configuration page under a new :code. The Global
   * default lives at the reserved GLOBAL_SCOPE_CODE (EU) — a distinct path from any real country —
   * so the two URLs never collide, no query param is needed, and the scope survives F5.
   */
  onScopeChange(scope: string) {
    this.selectedScope.set(scope);
    const code = scope === CountryPagesConfigurationComponent.GLOBAL_SCOPE ? GLOBAL_SCOPE_CODE : scope;
    this.router.navigate(['/country', code, 'configuration']);
  }

  discard() {
    this.indicatorsService.discard();
    this.changesSubmitted.set(false);
  }

  /**
   * Reset the current country to the Global default. If the country never had an override it already
   * follows the Global default — there is nothing to delete (the backend would 404) — so we just show
   * a notification and stop. Otherwise we delete the override and drop the working state back to "no
   * override" in place; signals refresh the preview and the left-nav, so no reload is needed.
   */
  resetToGlobal() {
    if (this.resetting()) {
      return;
    }

    if (!this.indicatorsService.hasOverride()) {
      this.resetting.set(true);
      UIkit.notification({
        message: `${this.currentCountryName()} already uses the Global defaults.`,
        status: 'primary',
        pos: 'top-center',
        timeout: 4000
      });
      // Re-enable once the notification has gone, so a stray double-click can't stack messages.
      setTimeout(() => this.resetting.set(false), 4000);
      return;
    }

    this.resetting.set(true);
    this.indicatorsService.deleteOverrides(this.stakeholderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.indicatorsService.setState(undefined, '');
          this.changesSubmitted.set(false);
          this.resetting.set(false);
        },
        error: (err) => {
          console.error('Failed to reset country to Global default:', err);
          this.resetting.set(false);
        }
      });
  }

  publish() {
    this.publishing.set(true);
    const payload = this.indicatorsService.buildPayload();

    // Global-default scope writes the type-wide defaults document; a country writes its override.
    const save$: Observable<OverrideDoc | DefaultsDoc> =
      this.selectedScope() === CountryPagesConfigurationComponent.GLOBAL_SCOPE
        ? this.indicatorsService.putDefaults('eosc-sb', payload)
        : this.indicatorsService.putOverrides(this.stakeholderId, payload);

    save$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.indicatorsService.setState(
            res?.indicators ?? payload,
            res?.id ?? '',
            this.indicatorsService.buildHiddenSections()
          );
          this.changesSubmitted.set(true);
          this.publishing.set(false);
        },
        error: () => {
          this.publishing.set(false);
        }
      });
  }
}
