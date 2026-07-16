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

@Component({
  selector: 'app-country-pages-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
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
  readonly viewMode = signal<'manage' | 'split' | 'on-page'>('on-page');
  readonly changesSubmitted = signal<boolean>(false);
  readonly publishing = signal<boolean>(false);

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
          // Reset the pristine snapshot so the page is no longer marked dirty, and keep the
          // document id current (a first-time Publish creates the document server-side).
          this.indicatorsService.setState(res?.indicators ?? payload, res?.id ?? '');
          this.changesSubmitted.set(true);
          this.publishing.set(false);
        },
        error: () => {
          this.publishing.set(false);
        }
      });
  }
}
