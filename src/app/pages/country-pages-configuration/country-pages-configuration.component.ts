import { Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UserService } from "../../../survey-tool/app/services/user.service";
import { countries } from "../../domain/countries";

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

  checkingAuth = true;
  authorized = false;
  countryCode = '';

  readonly countries = countries;

  // Visual-only for this pass - not wired to real scope switching / publish logic yet.
  readonly selectedCountryCode = signal<string>('FR');
  readonly viewMode = signal<'manage' | 'split' | 'on-page'>('on-page');
  readonly changesSubmitted = signal<boolean>(false);

  ngOnInit() {
    this.countryCode = this.route.snapshot.params['code'];

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

  publish() {
    // TODO: call the publish endpoint once the service/API contract for saving
    // indicator visibility is confirmed.
  }
}
