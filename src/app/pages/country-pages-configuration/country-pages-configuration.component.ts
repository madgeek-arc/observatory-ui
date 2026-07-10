import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UserService } from "../../../survey-tool/app/services/user.service";
import { countries } from "../../domain/countries";
import { CountryPageIndicatorsService } from "../country-pages/services/country-page-indicators.service";

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

  checkingAuth = true;
  authorized = false;
  countryCode = '';

  readonly countries = countries;

  readonly selectedCountryCode = signal<string>('');
  readonly viewMode = signal<'manage' | 'split' | 'on-page'>('on-page');
  readonly changesSubmitted = signal<boolean>(false);
  readonly publishing = signal<boolean>(false);

  private get stakeholderId(): string {
    return 'sh-eosc-sb-' + this.countryCode;
  }

  ngOnInit() {
    // Angular reuses this component when only :code changes, so a one-time snapshot read would
    // leave countryCode (and therefore the PUT target) stale after switching scope. React instead.
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.countryCode = params['code'];
      this.selectedCountryCode.set(this.countryCode);
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

  /** Switching the editing scope reloads the whole configuration page for that country. */
  onCountryChange(code: string) {
    this.selectedCountryCode.set(code);
    this.router.navigate(['/country', code, 'configuration']);
  }

  discard() {
    this.indicatorsService.discard();
    this.changesSubmitted.set(false);
  }

  publish() {
    this.publishing.set(true);
    this.indicatorsService.putOverrides(this.stakeholderId, this.indicatorsService.buildPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          // Reset the pristine snapshot so the page is no longer marked dirty.
          this.indicatorsService.setState(res?.indicators ?? this.indicatorsService.buildPayload());
          this.changesSubmitted.set(true);
          this.publishing.set(false);
        },
        error: () => {
          this.publishing.set(false);
        }
      });
  }
}
